import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone, timedelta

cred = credentials.Certificate("api/firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

@firestore.transactional
def get_next_salesperson_tx(transaction, db):
    sales_docs = db.collection("users").where("role", "==", "sales").get(transaction=transaction)
    sales_users = [d.to_dict() for d in sales_docs]
    
    ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    today_str = ist_now.strftime("%Y-%m-%d")
    
    available_sales = [
        u for u in sales_users 
        if u.get("is_active") is not False and today_str not in u.get("leaves", [])
    ]
    
    if not available_sales:
        available_sales = [u for u in sales_users if u.get("is_active") is not False]
        
    if not available_sales:
        return None
        
    available_sales.sort(key=lambda u: u["id"])
    
    routing_ref = db.collection("settings").document("lead_routing")
    routing_snapshot = routing_ref.get(transaction=transaction)
    
    next_idx = 0
    if routing_snapshot.exists:
        routing_data = routing_snapshot.to_dict()
        last_uid = routing_data.get("last_assigned_uid")
        if last_uid:
            found = False
            for i, u in enumerate(available_sales):
                if u["id"] == last_uid:
                    next_idx = (i + 1) % len(available_sales)
                    found = True
                    break
            if not found:
                for i, u in enumerate(available_sales):
                    if u["id"] > last_uid:
                        next_idx = i
                        found = True
                        break
                        
    next_sales = available_sales[next_idx]
    transaction.set(routing_ref, {
        "last_assigned_uid": next_sales["id"],
        "last_assigned_name": next_sales["name"],
        "updated_at": ist_now.isoformat()
    }, merge=True)
    
    return next_sales

tx = db.transaction()
print(get_next_salesperson_tx(tx, db))
