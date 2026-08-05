import os
from pathlib import Path
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Firebase Init
firebase_creds_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
if firebase_creds_json:
    import json
    creds_dict = json.loads(firebase_creds_json)
    cred = credentials.Certificate(creds_dict)
    firebase_admin.initialize_app(cred)
else:
    local_creds = ROOT_DIR / 'firebase-adminsdk.json'
    if local_creds.exists():
        cred = credentials.Certificate(str(local_creds))
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()

db = firestore.client()

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def new_id():
    return str(uuid.uuid4())

MEN_PRODUCTS = [
    {
        "name": "Silk-Based Gents Hair System",
        "category": "Hair Systems",
        "description": "Premium silk-based hair system for a natural look and comfortable wear.",
        "price": 12500,
        "stock": 10,
        "target_audience": "Men",
        "image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800"
    },
    {
        "name": "Men’s Scalp Topper | 100% Human Hair",
        "category": "Scalp Topper",
        "description": "High-quality scalp topper designed specifically for men experiencing thinning.",
        "price": 8999,
        "stock": 5,
        "target_audience": "Men",
        "image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800"
    },
    {
        "name": "Lace Frontal Hair System For Men",
        "category": "Hair Systems",
        "description": "Ultra-thin lace frontal for a completely undetectable hairline.",
        "price": 14500,
        "stock": 8,
        "target_audience": "Men",
        "image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800"
    }
]

def seed_men():
    for p in MEN_PRODUCTS:
        pid = new_id()
        db.collection("products").document(pid).set({"id": pid, **p, "created_at": now_iso()})
        print(f"Seeded: {p['name']}")

if __name__ == "__main__":
    seed_men()
