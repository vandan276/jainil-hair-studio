import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone

cred = credentials.Certificate("api/firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

leads = db.collection("leads").where("assigned_to_name", "==", "Vikram Singh (Sales)").get()

print(f"Found {len(leads)} leads to reassign.")
batch = db.batch()
count = 0

for lead in leads:
    batch.update(lead.reference, {
        "assigned_to": None,
        "assigned_to_name": None,
        "notes": firestore.ArrayUnion([{
            "text": "System Auto-Correction: Removed invalid assignment to deleted user Vikram Singh (Sales)",
            "author": "System",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }])
    })
    count += 1
    
    if count % 500 == 0:
        batch.commit()
        batch = db.batch()

if count > 0:
    batch.commit()
    
print(f"Successfully unassigned {count} leads from Vikram Singh (Sales)")
