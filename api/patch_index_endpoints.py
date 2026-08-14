import sys

def apply_patch():
    with open('/Users/panchalvandan/Desktop/hair-saloon3/New-hair-saloon/api/index.py', 'r') as f:
        content = f.read()

    new_endpoints = """
@api.get("/leads/{lead_id}/pending-orders")
def get_lead_pending_orders(lead_id: str, user: dict = Depends(get_current_user)):
    lead_snap = db.collection("leads").document(lead_id).get()
    if not lead_snap.exists:
        raise HTTPException(404, "Lead not found")
        
    lead_data = lead_snap.to_dict()
    phone = lead_data.get("phone")
    if not phone:
        return []
        
    orders_query = db.collection("orders").where("phone", "==", phone).stream()
    pending_orders = []
    
    for o_doc in orders_query:
        o = o_doc.to_dict()
        status = o.get("status", "")
        # Calculate pending amount
        total = float(o.get("total", 0.0))
        discount = float(o.get("discount", 0.0)) # Admin.jsx logic uses o.discount
        paid = 0.0
        
        if o.get("split_payments"):
            paid = sum(float(p.get("amount", 0.0)) for p in o.get("split_payments"))
        else:
            if status not in ["placed", "pending"]:
                paid = total
                
        unpaid = max(0.0, total - discount - paid)
        
        if unpaid > 0 and status in ["placed", "pending"]:
            o["unpaid_amount"] = unpaid
            pending_orders.append(o)
            
    # Sort by date
    pending_orders.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return pending_orders

@api.post("/orders/{order_id}/pay-pending")
def pay_pending_order(order_id: str, payload: dict, user: dict = Depends(get_current_user)):
    amount = float(payload.get("amount", 0.0))
    payment_method = payload.get("payment_method", "Cash")
    lead_id = payload.get("lead_id")
    
    if amount <= 0:
        raise HTTPException(400, "Amount must be greater than 0")
        
    order_ref = db.collection("orders").document(order_id)
    order_snap = order_ref.get()
    if not order_snap.exists:
        raise HTTPException(404, "Order not found")
        
    order = order_snap.to_dict()
    
    split_payments = order.get("split_payments", [])
    split_payments.append({
        "method": payment_method,
        "amount": amount
    })
    
    total = float(order.get("total", 0.0))
    discount = float(order.get("discount", 0.0))
    paid = sum(float(p.get("amount", 0.0)) for p in split_payments)
    
    update_data = {"split_payments": split_payments}
    
    if paid >= (total - discount):
        update_data["status"] = "delivered"
        
    order_ref.update(update_data)
    
    # Deduct from lead's global pending payment if lead_id is provided
    if lead_id:
        lead_ref = db.collection("leads").document(lead_id)
        lead_snap = lead_ref.get()
        if lead_snap.exists:
            lead_data = lead_snap.to_dict()
            current_pending = float(lead_data.get("pending_payment", 0.0))
            new_pending = max(0.0, current_pending - amount)
            lead_ref.update({"pending_payment": new_pending})
            
    return {"message": "Payment recorded successfully", "order_id": order_id}
"""
    
    if "@api.get(\"/leads/{lead_id}/pending-orders\")" not in content:
        # Append before the end or just before some other endpoint
        target = "@api.post(\"/leads/{lead_id}/receive-pending-payment\")"
        content = content.replace(target, new_endpoints + "\n" + target)
        
        with open('/Users/panchalvandan/Desktop/hair-saloon3/New-hair-saloon/api/index.py', 'w') as f:
            f.write(content)
        print("Patched index.py successfully")
    else:
        print("Endpoints already exist")

if __name__ == "__main__":
    apply_patch()
