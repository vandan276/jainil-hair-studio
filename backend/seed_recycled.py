import os
import uuid
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, firestore

# ----- Firebase Init -----
# Using the same logic as server.py
current_dir = os.path.dirname(os.path.abspath(__file__))
local_creds = os.path.join(current_dir, 'firebase-adminsdk.json')

if os.path.exists(local_creds):
    cred = credentials.Certificate(local_creds)
    firebase_admin.initialize_app(cred)
else:
    firebase_admin.initialize_app()

db = firestore.client()

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def new_id():
    return str(uuid.uuid4())

DUMMY_RECYCLED_LEADS = [
    {
        "name": "Amit Patel",
        "phone": "+91 98765 11111",
        "branch": "Surat",
        "section": "Men",
        "source": "Facebook",
        "status": "recycled",
        "grade": "Warm",
        "city": "Surat",
        "hair_condition": "Hair Fall",
    },
    {
        "name": "Sneha Reddy",
        "phone": "+91 98765 22222",
        "branch": "Baroda",
        "section": "Female",
        "source": "Instagram",
        "status": "recycled",
        "grade": "Hot",
        "city": "Baroda",
        "hair_condition": "Thinning",
    },
    {
        "name": "Rajesh Kumar",
        "phone": "+91 98765 33333",
        "branch": "Surat",
        "section": "Men",
        "source": "Walk-in",
        "status": "recycled",
        "grade": "Cold",
        "city": "Ahmedabad",
        "hair_condition": "Dry Hair",
    }
]

def seed_recycled():
    for lead in DUMMY_RECYCLED_LEADS:
        lid = new_id()
        doc = {
            "id": lid,
            "lead_number": f"LD-RECY-{int(uuid.uuid4().int % 1000000)}",
            "name": lead["name"],
            "phone": lead["phone"],
            "branch": lead["branch"],
            "section": lead["section"],
            "source": lead["source"],
            "campaign": "Recycling Drive May 2026",
            "status": lead["status"],
            "grade": lead["grade"],
            "city": lead["city"],
            "hair_condition": lead["hair_condition"],
            "assigned_to": None,
            "assigned_to_name": None,
            "notes": [{"text": "Seeded as recycled lead for testing.", "author": "System", "timestamp": now_iso()}],
            "follow_up_date": None,
            "follow_up_time": None,
            "follow_up_type": None,
            "is_favorite": False,
            "created_by": "System Seed",
            "created_at": now_iso(),
            "updated_at": now_iso()
        }
        db.collection("leads").document(lid).set(doc)
        print(f"Added recycled lead: {lead['name']}")

if __name__ == "__main__":
    seed_recycled()
