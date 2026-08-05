import os
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

ROOT_DIR = Path(__file__).resolve().parent

local_creds = ROOT_DIR / 'firebase-adminsdk.json'
if local_creds.exists():
    cred = credentials.Certificate(str(local_creds))
    firebase_admin.initialize_app(cred)
else:
    print("No firebase-adminsdk.json found!")
    exit(1)

db = firestore.client()

# Fetch all orders to build a map of phone -> total spendings
print("Fetching orders...")
orders = list(db.collection("orders").stream())

phone_spendings = {}
for doc in orders:
    order = doc.to_dict()
    phone = order.get("phone")
    total = order.get("total", 0.0)
    if phone:
        phone_spendings[phone] = phone_spendings.get(phone, 0.0) + total

print("Recalculating lead spendings...")
leads = list(db.collection("leads").stream())
updated = 0

for lead_doc in leads:
    lead = lead_doc.to_dict()
    phone = lead.get("phone")
    if not phone:
        continue
    
    current_spending = lead.get("total_sale_amount", 0.0)
    actual_spending = 0.0
    
    # Try exact match first
    if phone in phone_spendings:
        actual_spending = phone_spendings[phone]
    else:
        # Try without '+'
        if phone.startswith("+") and phone[1:] in phone_spendings:
            actual_spending = phone_spendings[phone[1:]]
        # Try without '+91'
        elif phone.startswith("+91") and phone[3:] in phone_spendings:
            actual_spending = phone_spendings[phone[3:]]
        # Try with '+91'
        elif "+91" + phone in phone_spendings:
            actual_spending = phone_spendings["+91" + phone]
    
    # Update if there's a mismatch
    if abs(current_spending - actual_spending) > 0.01:
        print(f"Lead {lead.get('name', 'Unknown')} ({phone}): Fixing {current_spending} -> {actual_spending}")
        lead_doc.reference.update({"total_sale_amount": actual_spending})
        updated += 1

print(f"Done! Fixed {updated} leads.")
