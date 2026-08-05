"""Eminence Salon backend regression tests."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("TEST_BASE_URL", "https://8d3f580e-9fa3-48e4-9fe2-51b4ffaf2cf8.preview.emergentagent.com")
API = f"{BASE_URL}/api"

ADMIN = {"email": "admin@eminence.com", "password": "Admin@123"}
DEMO = {"email": "demo@eminence.com", "password": "Demo@123"}


@pytest.fixture()
def s():
    # Fresh session per test to avoid cookie cross-contamination
    return requests.Session()


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json=ADMIN, timeout=10)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["role"] == "admin"
    assert data["token"]
    return data["token"]


@pytest.fixture(scope="session")
def demo_token():
    r = requests.post(f"{API}/auth/login", json=DEMO, timeout=10)
    assert r.status_code == 200, r.text
    return r.json()["token"]


def auth(t): return {"Authorization": f"Bearer {t}"}


# ---------- Health & catalog (public) ----------
class TestPublic:
    def test_root(self, s):
        r = s.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        assert r.json()["app"] == "Eminence Salon API"

    def test_services_seeded(self, s):
        r = s.get(f"{API}/services", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 8
        assert all("id" in x and "_id" not in x for x in items)

    def test_services_filter(self, s):
        r = s.get(f"{API}/services", params={"category": "Hair"}, timeout=10)
        assert r.status_code == 200
        assert all(x["category"] == "Hair" for x in r.json())

    def test_products_seeded(self, s):
        r = s.get(f"{API}/products", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 10
        assert all("_id" not in x for x in items)

    def test_products_search(self, s):
        r = s.get(f"{API}/products", params={"search": "Argan"}, timeout=10)
        assert r.status_code == 200
        assert any("Argan" in x["name"] for x in r.json())

    def test_stylists_seeded(self, s):
        r = s.get(f"{API}/stylists", timeout=10)
        assert r.status_code == 200
        assert len(r.json()) >= 5

    def test_product_404(self, s):
        r = s.get(f"{API}/products/nonexistent", timeout=10)
        assert r.status_code == 404


# ---------- Auth ----------
class TestAuth:
    def test_login_admin(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 20

    def test_login_invalid(self, s):
        r = s.post(f"{API}/auth/login", json={"email": "x@y.z", "password": "wrong"}, timeout=10)
        assert r.status_code == 401

    def test_register_and_me(self, s):
        email = f"test_{int(time.time())}@example.com"
        r = s.post(f"{API}/auth/register",
                   json={"name": "TEST User", "email": email, "password": "Pass@123"}, timeout=10)
        assert r.status_code == 200, r.text
        token = r.json()["token"]
        # /me with bearer
        r2 = s.get(f"{API}/auth/me", headers=auth(token), timeout=10)
        assert r2.status_code == 200
        assert r2.json()["email"] == email
        assert "password_hash" not in r2.json()

    def test_register_duplicate(self, s):
        r = s.post(f"{API}/auth/register",
                   json={"name": "x", "email": DEMO["email"], "password": "Demo@123"}, timeout=10)
        assert r.status_code == 400

    def test_me_unauth(self, s):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_login_sets_cookie(self, s):
        sess = requests.Session()
        r = sess.post(f"{API}/auth/login", json=DEMO, timeout=10)
        assert r.status_code == 200
        # cookie is set
        assert any(c.name == "access_token" for c in sess.cookies)


# ---------- Bookings ----------
class TestBookings:
    def test_create_and_list_booking(self, s, demo_token):
        services = s.get(f"{API}/services", timeout=10).json()
        stylists = s.get(f"{API}/stylists", timeout=10).json()
        payload = {
            "service_id": services[0]["id"],
            "stylist_id": stylists[0]["id"],
            "date": "2026-02-15",
            "time": "11:00",
            "notes": "TEST booking",
        }
        r = s.post(f"{API}/bookings", json=payload, headers=auth(demo_token), timeout=10)
        assert r.status_code == 200, r.text
        b = r.json()
        assert b["status"] == "pending"
        assert b["service_name"] == services[0]["name"]
        # list
        r2 = s.get(f"{API}/bookings/me", headers=auth(demo_token), timeout=10)
        assert r2.status_code == 200
        assert any(x["id"] == b["id"] for x in r2.json())

    def test_booking_unauth(self, s):
        r = s.post(f"{API}/bookings",
                   json={"service_id": "x", "date": "2026-01-01", "time": "10:00"}, timeout=10)
        assert r.status_code == 401

    def test_booking_invalid_service(self, s, demo_token):
        r = s.post(f"{API}/bookings",
                   json={"service_id": "bad", "date": "2026-01-01", "time": "10:00"},
                   headers=auth(demo_token), timeout=10)
        assert r.status_code == 404


# ---------- Orders ----------
class TestOrders:
    def test_create_and_list_order(self, s, demo_token):
        products = s.get(f"{API}/products", timeout=10).json()
        payload = {
            "items": [{"product_id": products[0]["id"], "quantity": 2}],
            "full_name": "TEST Demo",
            "phone": "9999999999",
            "address": "1 Test St",
            "city": "Vadodara",
            "pincode": "390001",
            "notes": "TEST order",
        }
        r = s.post(f"{API}/orders", json=payload, headers=auth(demo_token), timeout=10)
        assert r.status_code == 200, r.text
        o = r.json()
        assert o["status"] == "placed"
        assert o["payment"] == "COD"
        assert o["total"] == round(products[0]["price"] * 2, 2)
        # list
        r2 = s.get(f"{API}/orders/me", headers=auth(demo_token), timeout=10)
        assert any(x["id"] == o["id"] for x in r2.json())

    def test_empty_cart(self, s, demo_token):
        r = s.post(f"{API}/orders",
                   json={"items": [], "full_name": "x", "phone": "1", "address": "x", "pincode": "1"},
                   headers=auth(demo_token), timeout=10)
        assert r.status_code == 400


# ---------- Admin ----------
class TestAdmin:
    def test_role_enforcement(self, s, demo_token):
        r = s.get(f"{API}/admin/stats", headers=auth(demo_token), timeout=10)
        assert r.status_code == 403

    def test_stats(self, s, admin_token):
        r = s.get(f"{API}/admin/stats", headers=auth(admin_token), timeout=10)
        assert r.status_code == 200
        d = r.json()
        for k in ("users", "bookings", "orders", "products", "services", "revenue",
                  "recent_bookings", "recent_orders"):
            assert k in d

    def test_admin_lists(self, s, admin_token):
        for ep in ("/admin/bookings", "/admin/orders", "/admin/users"):
            r = s.get(f"{API}{ep}", headers=auth(admin_token), timeout=10)
            assert r.status_code == 200
            assert isinstance(r.json(), list)

    def test_service_crud(self, s, admin_token):
        payload = {"name": "TEST Service", "category": "Hair",
                   "description": "test", "price": 100.0, "duration_min": 30}
        r = s.post(f"{API}/admin/services", json=payload, headers=auth(admin_token), timeout=10)
        assert r.status_code == 200
        sid = r.json()["id"]
        # update
        payload["price"] = 150.0
        r2 = s.patch(f"{API}/admin/services/{sid}", json=payload, headers=auth(admin_token), timeout=10)
        assert r2.status_code == 200
        # verify
        r3 = s.get(f"{API}/services/{sid}", timeout=10)
        assert r3.json()["price"] == 150.0
        # delete
        r4 = s.delete(f"{API}/admin/services/{sid}", headers=auth(admin_token), timeout=10)
        assert r4.status_code == 200
        assert s.get(f"{API}/services/{sid}", timeout=10).status_code == 404

    def test_product_crud(self, s, admin_token):
        payload = {"name": "TEST Product", "category": "Hair Care",
                   "description": "t", "price": 99.0, "stock": 10}
        r = s.post(f"{API}/admin/products", json=payload, headers=auth(admin_token), timeout=10)
        assert r.status_code == 200
        pid = r.json()["id"]
        payload["price"] = 199.0
        r2 = s.patch(f"{API}/admin/products/{pid}", json=payload, headers=auth(admin_token), timeout=10)
        assert r2.status_code == 200
        assert s.get(f"{API}/products/{pid}", timeout=10).json()["price"] == 199.0
        r4 = s.delete(f"{API}/admin/products/{pid}", headers=auth(admin_token), timeout=10)
        assert r4.status_code == 200

    def test_booking_status_update(self, s, admin_token, demo_token):
        services = s.get(f"{API}/services", timeout=10).json()
        b = s.post(f"{API}/bookings",
                   json={"service_id": services[0]["id"], "date": "2026-03-01", "time": "10:00"},
                   headers=auth(demo_token), timeout=10).json()
        r = s.patch(f"{API}/admin/bookings/{b['id']}",
                    json={"status": "confirmed"}, headers=auth(admin_token), timeout=10)
        assert r.status_code == 200
