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

MORE_PRODUCTS = [
    {
        "name": "Classic Clip-in Hair Extensions",
        "category": "Extensions",
        "description": "High-quality 100% human hair clip-in extensions for instant length and volume.",
        "price": 5500,
        "stock": 25,
        "target_audience": "Women",
        "image_url": "https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=800"
    },
    {
        "name": "Human Hair Messy Bun",
        "category": "Buns",
        "description": "Easy-to-use messy bun hair piece for a quick and elegant look.",
        "price": 2200,
        "stock": 15,
        "target_audience": "Women",
        "image_url": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800"
    },
    {
        "name": "Seamless Side Patches",
        "category": "Side Patches",
        "description": "Natural-looking side patches to cover thinning areas discreetly.",
        "price": 3800,
        "stock": 20,
        "target_audience": "Women",
        "image_url": "https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=800"
    },
    {
        "name": "Premium Hair Care Kit",
        "category": "Accessories",
        "description": "A complete set of salon-grade shampoo, conditioner, and serum for extension maintenance.",
        "price": 1800,
        "stock": 50,
        "target_audience": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800"
    },
    {
        "name": "Luxury Pearl Hair Clips",
        "category": "Accessories",
        "description": "Elegant pearl-studded hair clips to add a touch of glamour to any hairstyle.",
        "price": 450,
        "stock": 100,
        "target_audience": "Women",
        "image_url": "https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?w=800"
    }
]

def seed_more():
    for p in MORE_PRODUCTS:
        pid = new_id()
        db.collection("products").document(pid).set({"id": pid, **p, "created_at": now_iso()})
        print(f"Seeded: {p['name']}")

if __name__ == "__main__":
    seed_more()
