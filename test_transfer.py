import os
import firebase_admin
from firebase_admin import credentials, firestore
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

cred = credentials.Certificate("api/firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def new_id():
    import uuid
    return str(uuid.uuid4())

class TransferItemIn(BaseModel):
    product_id: str
    quantity: int

class ProductTransferIn(BaseModel):
    items: List[TransferItemIn]
    source: str
    destination: str
    employee_id: str
    employee_name: str
    remarks: Optional[str] = ""

data = ProductTransferIn(
    items=[TransferItemIn(product_id="81a4d531-ee9b-4961-88b9-4debac467287", quantity=1)],
    source="Baroda",
    destination="Surat",
    employee_id="test",
    employee_name="test",
    remarks="test"
)

results = []
for item in data.items:
    # 1. Deduct stock from source branch product
    prod_ref = db.collection("products").document(item.product_id)
    prod_snap = prod_ref.get()
    if not prod_snap.exists:
        print("Source product not found!")
        break
    prod = prod_snap.to_dict()
    current_stock = prod.get("stock", 0)
    print(f"Current stock of {prod.get('name')}: {current_stock}")
    
    prod_ref.update({"stock": current_stock - item.quantity})
    print(f"Updated source stock to: {current_stock - item.quantity}")
    
    # 2. Add stock to destination branch product
    dest_query = db.collection("products").where("name", "==", prod.get("name")).where("branch", "==", data.destination).limit(1).get()
    if dest_query:
        dest_prod_ref = dest_query[0].reference
        dest_prod = dest_query[0].to_dict()
        dest_prod_ref.update({"stock": dest_prod.get("stock", 0) + item.quantity})
        print(f"Updated dest stock to: {dest_prod.get('stock', 0) + item.quantity}")
    else:
        new_pid = new_id()
        new_prod = {
            **prod,
            "id": new_pid,
            "stock": item.quantity,
            "branch": data.destination,
            "created_at": now_iso()
        }
        db.collection("products").document(new_pid).set(new_prod)
        print(f"Created new product in dest branch {data.destination} with id {new_pid} and stock {item.quantity}")

