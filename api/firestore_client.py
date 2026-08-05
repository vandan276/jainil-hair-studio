"""Lightweight Firestore REST client — no grpcio, no firebase-admin."""
import json, time, requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request as AuthRequest

_creds = None
_project = None

def init(creds_json_str=None, creds_file=None):
    global _creds, _project
    if creds_json_str:
        info = json.loads(creds_json_str)
    elif creds_file:
        with open(creds_file) as f:
            info = json.load(f)
    else:
        raise RuntimeError("No Firebase credentials provided")
    _project = info["project_id"]
    _creds = service_account.Credentials.from_service_account_info(
        info, scopes=["https://www.googleapis.com/auth/datastore"]
    )

def _token():
    if not _creds.valid or (_creds.expiry and _creds.expiry.timestamp() < time.time() + 60):
        _creds.refresh(AuthRequest())
    return _creds.token

def _base():
    return f"https://firestore.googleapis.com/v1/projects/{_project}/databases/(default)/documents"

def _headers():
    return {"Authorization": f"Bearer {_token()}", "Content-Type": "application/json"}

# --- value encode/decode ---
def _encode(v):
    if v is None: return {"nullValue": None}
    if isinstance(v, bool): return {"booleanValue": v}
    if isinstance(v, int): return {"integerValue": str(v)}
    if isinstance(v, float): return {"doubleValue": v}
    if isinstance(v, str): return {"stringValue": v}
    if isinstance(v, list): return {"arrayValue": {"values": [_encode(i) for i in v]}}
    if isinstance(v, dict): return {"mapValue": {"fields": {k: _encode(val) for k, val in v.items()}}}
    return {"stringValue": str(v)}

def _decode(v):
    if "nullValue" in v: return None
    if "booleanValue" in v: return v["booleanValue"]
    if "integerValue" in v: return int(v["integerValue"])
    if "doubleValue" in v: return v["doubleValue"]
    if "stringValue" in v: return v["stringValue"]
    if "arrayValue" in v: return [_decode(i) for i in v.get("arrayValue", {}).get("values", [])]
    if "mapValue" in v: return {k: _decode(val) for k, val in v.get("mapValue", {}).get("fields", {}).items()}
    return None

def _doc_to_dict(doc):
    return {k: _decode(v) for k, v in doc.get("fields", {}).items()}

# --- CRUD ---
def get_doc(collection, doc_id):
    r = requests.get(f"{_base()}/{collection}/{doc_id}", headers=_headers())
    if r.status_code == 404: return None
    r.raise_for_status()
    return _doc_to_dict(r.json())

def set_doc(collection, doc_id, data):
    body = {"fields": {k: _encode(v) for k, v in data.items()}}
    r = requests.patch(f"{_base()}/{collection}/{doc_id}", headers=_headers(), json=body)
    r.raise_for_status()

def update_doc(collection, doc_id, data):
    mask = "&".join(f"updateMask.fieldPaths={k}" for k in data.keys())
    body = {"fields": {k: _encode(v) for k, v in data.items()}}
    r = requests.patch(f"{_base()}/{collection}/{doc_id}?{mask}", headers=_headers(), json=body)
    r.raise_for_status()

def delete_doc(collection, doc_id):
    r = requests.delete(f"{_base()}/{collection}/{doc_id}", headers=_headers())
    r.raise_for_status()

def list_docs(collection):
    results = []
    url = f"{_base()}/{collection}?pageSize=300"
    while url:
        r = requests.get(url, headers=_headers())
        r.raise_for_status()
        body = r.json()
        for doc in body.get("documents", []):
            results.append(_doc_to_dict(doc))
        token = body.get("nextPageToken")
        url = f"{_base()}/{collection}?pageSize=300&pageToken={token}" if token else None
    return results

def query(collection, filters=None, order_by=None, order_dir="ASCENDING", limit=None):
    """Run a structured query. filters = [(field, op, value), ...]"""
    q = {"from": [{"collectionId": collection}]}
    if filters:
        where_filters = []
        for field, op, value in filters:
            op_map = {"==": "EQUAL", "!=": "NOT_EQUAL", "<": "LESS_THAN",
                      "<=": "LESS_THAN_OR_EQUAL", ">": "GREATER_THAN", ">=": "GREATER_THAN_OR_EQUAL"}
            where_filters.append({
                "fieldFilter": {"field": {"fieldPath": field}, "op": op_map.get(op, op), "value": _encode(value)}
            })
        if len(where_filters) == 1:
            q["where"] = {"fieldFilter": where_filters[0]["fieldFilter"]}
        else:
            q["where"] = {"compositeFilter": {"op": "AND", "filters": where_filters}}
    if order_by:
        q["orderBy"] = [{"field": {"fieldPath": order_by}, "direction": order_dir}]
    if limit:
        q["limit"] = limit
    r = requests.post(f"{_base()}:runQuery", headers=_headers(), json={"structuredQuery": q})
    r.raise_for_status()
    results = []
    for item in r.json():
        if "document" in item:
            results.append(_doc_to_dict(item["document"]))
    return results
