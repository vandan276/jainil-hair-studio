import sys

def apply_patch():
    with open('/Users/panchalvandan/Desktop/hair-saloon3/New-hair-saloon/api/index.py', 'r') as f:
        content = f.read()

    new_endpoint = """
@api.post("/leads/{lead_id}/receive-pending-payment")
def receive_pending_payment(lead_id: str, payload: dict, user: dict = Depends(get_current_user)):
    amount = float(payload.get("amount", 0.0))
    payment_method = payload.get("payment_method", "Cash")
    
    if amount <= 0:
        raise HTTPException(400, "Amount must be greater than 0")
        
    lead_ref = db.collection("leads").document(lead_id)
    lead_snap = lead_ref.get()
    if not lead_snap.exists:
        raise HTTPException(404, "Client not found")
        
    lead_data = lead_snap.to_dict()
    current_pending = float(lead_data.get("pending_payment", 0.0))
    new_pending = max(0.0, current_pending - amount)
    
    # 1. Update Lead
    lead_ref.update({"pending_payment": new_pending})
    
    # 2. Create a payment collection record (using orders collection so it flows into Admin reports)
    dt_now = datetime.now(timezone.utc)
    order_id = str(uuid.uuid4())
    order_data = {
        "id": order_id,
        "employee_id": user.get("id"),
        "user_name": lead_data.get("name", "Unknown Client"),
        "phone": lead_data.get("phone", ""),
        "total": amount,
        "items": [{
            "name": "Pending Payment Collection",
            "price": amount,
            "quantity": 1,
            "line_total": amount,
            "category": "Payment"
        }],
        "payment_method": payment_method,
        "split_payments": [{"method": payment_method, "amount": amount}],
        "status": "delivered", # Delivered status is used in reports for pending_received
        "is_pending_collection": True,
        "notes": f"Pending Payment Collected via {payment_method}",
        "created_at": dt_now.isoformat()
    }
    db.collection("orders").document(order_id).set(order_data)
    
    return {"message": "Payment collected successfully", "new_pending": new_pending, "order_id": order_id}
"""
    
    if "@api.post(\"/leads/{lead_id}/receive-pending-payment\")" not in content:
        # Append before the end or just before some other endpoint
        target = "@api.get(\"/admin/orders\")"
        content = content.replace(target, new_endpoint + "\n" + target)
        
        with open('/Users/panchalvandan/Desktop/hair-saloon3/New-hair-saloon/api/index.py', 'w') as f:
            f.write(content)
        print("Patched index.py successfully")
    else:
        print("Endpoint already exists")

if __name__ == "__main__":
    apply_patch()
