"""Tests for v2 incremental features:
- Slot conflict prevention (POST /api/bookings 409)
- Admin calendar (GET /api/admin/bookings/calendar)
- Image upload + public serve (POST /api/admin/upload, GET /api/files/{path})
"""
import io
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://saloon-ecom.preview.emergentagent.com").rstrip("/")
ADMIN = {"email": "admin@eminence.com", "password": "Admin@123"}
DEMO = {"email": "demo@eminence.com", "password": "Demo@123"}


def _login(creds):
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json=creds, timeout=20)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    token = r.json()["token"]
    # Use a fresh session to avoid cookie precedence over Bearer
    fresh = requests.Session()
    fresh.headers.update({"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    return fresh, token


@pytest.fixture(scope="module")
def admin_client():
    s, _ = _login(ADMIN)
    return s


@pytest.fixture(scope="module")
def admin_token():
    _, t = _login(ADMIN)
    return t


@pytest.fixture(scope="module")
def demo_client():
    s, _ = _login(DEMO)
    return s


# ---------- Slot conflict prevention ----------
class TestSlotConflict:
    def test_conflict_returns_409(self, demo_client):
        # Pick a service + stylist
        services = requests.get(f"{BASE_URL}/api/services").json()
        stylists = requests.get(f"{BASE_URL}/api/stylists").json()
        assert services and stylists
        sid = services[0]["id"]
        styl = stylists[0]["id"]
        # Use far-future date to avoid colliding with seeded data and re-runs
        date = "2030-12-15"
        time = "11:30"
        b1 = demo_client.post(f"{BASE_URL}/api/bookings",
                              json={"service_id": sid, "stylist_id": styl, "date": date, "time": time})
        # First booking may succeed (201/200) or, if a previous run already created it, 409
        assert b1.status_code in (200, 201, 409), f"unexpected: {b1.status_code} {b1.text}"
        # Second booking with same stylist+date+time MUST be 409
        b2 = demo_client.post(f"{BASE_URL}/api/bookings",
                              json={"service_id": sid, "stylist_id": styl, "date": date, "time": time})
        assert b2.status_code == 409, f"expected 409, got {b2.status_code} {b2.text}"
        body = b2.json()
        msg = body.get("detail") or body.get("message") or ""
        assert "booked" in msg.lower() or "already" in msg.lower(), f"unfriendly message: {msg}"

    def test_different_time_same_stylist_ok(self, demo_client):
        services = requests.get(f"{BASE_URL}/api/services").json()
        stylists = requests.get(f"{BASE_URL}/api/stylists").json()
        date = "2030-12-15"
        r = demo_client.post(f"{BASE_URL}/api/bookings",
                             json={"service_id": services[0]["id"], "stylist_id": stylists[0]["id"],
                                   "date": date, "time": "16:45"})
        assert r.status_code in (200, 201), f"{r.status_code} {r.text}"


# ---------- Admin calendar ----------
class TestAdminCalendar:
    def test_requires_admin(self, demo_client):
        r = demo_client.get(f"{BASE_URL}/api/admin/bookings/calendar?year=2030&month=12")
        assert r.status_code == 403

    def test_unauth_blocked(self):
        r = requests.get(f"{BASE_URL}/api/admin/bookings/calendar?year=2030&month=12")
        assert r.status_code == 401

    def test_returns_grouped_bookings(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/admin/bookings/calendar?year=2030&month=12")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "month" in data and "days" in data
        assert data["month"] == "2030-12"
        # The conflict test seeded at least one date
        assert "2030-12-15" in data["days"]
        bookings = data["days"]["2030-12-15"]
        assert isinstance(bookings, list) and len(bookings) >= 1
        # Validate booking shape
        b = bookings[0]
        for k in ("id", "user_name", "service_name", "stylist_name", "date", "time", "status"):
            assert k in b


# ---------- Image upload + public file serve ----------
# Tiny 1x1 PNG
PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xfc"
    b"\xff\xff?\x00\x05\xfe\x02\xfe\xa3\\\x81\xc6\x00\x00\x00\x00IEND\xaeB`\x82"
)


class TestUploadAndServe:
    def test_upload_requires_admin(self, demo_token=None):
        # demo user cannot upload
        s, _ = _login(DEMO)
        # Need multipart, drop json content-type
        s.headers.pop("Content-Type", None)
        files = {"file": ("p.png", io.BytesIO(PNG_BYTES), "image/png")}
        r = s.post(f"{BASE_URL}/api/admin/upload", files=files)
        assert r.status_code == 403, f"{r.status_code} {r.text}"

    def test_upload_rejects_unsupported_type(self, admin_token):
        files = {"file": ("p.txt", io.BytesIO(b"hello"), "text/plain")}
        r = requests.post(f"{BASE_URL}/api/admin/upload",
                          headers={"Authorization": f"Bearer {admin_token}"}, files=files)
        assert r.status_code == 400

    def test_upload_and_serve_cycle(self, admin_token):
        files = {"file": ("test.png", io.BytesIO(PNG_BYTES), "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload",
                          headers={"Authorization": f"Bearer {admin_token}"}, files=files, timeout=60)
        assert r.status_code == 200, f"upload failed {r.status_code} {r.text}"
        body = r.json()
        assert "path" in body and "url" in body
        assert body["url"].startswith("/api/files/")
        # Public serve (no auth)
        served = requests.get(f"{BASE_URL}{body['url']}", timeout=60)
        assert served.status_code == 200
        assert served.headers.get("content-type", "").startswith("image/")
        assert len(served.content) >= len(PNG_BYTES) - 4  # roughly same payload

    def test_serve_unknown_404(self):
        r = requests.get(f"{BASE_URL}/api/files/eminence-salon/uploads/nope/none.png")
        assert r.status_code == 404


# ---------- Sanity: existing flows still work ----------
class TestRegression:
    def test_login_admin(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_services_public(self):
        r = requests.get(f"{BASE_URL}/api/services")
        assert r.status_code == 200 and len(r.json()) >= 1

    def test_admin_bookings(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/admin/bookings")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
