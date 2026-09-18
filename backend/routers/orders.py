from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, List

from ..db import supabase
from ..utils import new_id, now_iso, get_current_user, require_employee, require_admin, unpack_data

router = APIRouter(tags=["orders_bookings"])

class BookingIn(BaseModel):
    service_id: str
    stylist_id: Optional[str] = None
    date: str
    time: str
    notes: Optional[str] = ""

class CartItem(BaseModel):
    product_id: str
    quantity: int
    package_id: Optional[str] = None
    service_provider: Optional[str] = None
    discount: Optional[float] = 0.0

class OrderIn(BaseModel):
    items: List[CartItem]
    full_name: str
    phone: str
    address: str
    city: str = "Vadodara"
    pincode: str
    notes: Optional[str] = ""
    payment_method: Optional[str] = None
    discount: Optional[float] = 0.0
    branch: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

# ----- BOOKINGS -----

@router.get("/bookings")
def get_bookings(user: dict = Depends(get_current_user)):
    if user.get("role") in ["admin", "receptionist"]:
        res = supabase.table("bookings").select("*").execute()
    else:
        res = supabase.table("bookings").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
    return res.data

@router.post("/bookings")
def create_booking(data: BookingIn, user: dict = Depends(get_current_user)):
    bid = new_id()
    doc = {
        "id": bid,
        "user_id": user["id"],
        "user_name": user.get("name"),
        "service_id": data.service_id,
        "stylist_id": data.stylist_id,
        "date": data.date,
        "time": data.time,
        "notes": data.notes,
        "status": "pending",
        "created_at": now_iso()
    }
    
    # Conflict check
    if data.stylist_id:
        conflict = supabase.table("bookings").select("id") \
            .eq("stylist_id", data.stylist_id) \
            .eq("date", data.date) \
            .eq("time", data.time) \
            .execute()
        if conflict.data:
            raise HTTPException(400, "Stylist is already booked at this time")
            
    supabase.table("bookings").insert(doc).execute()
    return doc

@router.patch("/bookings/{bid}/status")
def update_booking_status(bid: str, data: StatusUpdate, user: dict = Depends(require_employee)):
    res = supabase.table("bookings").select("id").eq("id", bid).execute()
    if not res.data:
        raise HTTPException(404, "Booking not found")
        
    supabase.table("bookings").update({"status": data.status, "updated_at": now_iso()}).eq("id", bid).execute()
    return {"ok": True, "status": data.status}

# ----- ORDERS -----

@router.post("/orders")
async def create_order(request: Request, user: dict = Depends(get_current_user)):
    try:
        data = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON")
        
    oid = new_id()
    
    # Store everything in order_data
    doc = {
        "id": oid,
        "phone": data.get("phone"),
        "total_amount": data.get("total", 0) or 0,
        "status": data.get("status", "pending"),
        "created_at": data.get("created_at") or now_iso(),
        "updated_at": data.get("created_at") or now_iso(),
        "order_data": data
    }
    supabase.table("orders").insert(doc).execute()
    
    # Decrement stock for products
    items = data.get("items", [])
    for item in items:
        if not item.get("package_id"):
            prod_id = item.get("product_id") or item.get("item_id")
            qty = item.get("quantity") or item.get("qty", 1)
            if prod_id:
                prod_res = supabase.table("products").select("stock").eq("id", prod_id).execute()
                if prod_res.data:
                    current_stock = prod_res.data[0].get("stock", 0)
                    new_stock = max(0, current_stock - qty)
                    supabase.table("products").update({"stock": new_stock}).eq("id", prod_id).execute()
                    
    return {"id": oid, "order_id": oid, **doc}

@router.get("/orders")
def get_orders(user: dict = Depends(get_current_user)):
    if user.get("role") in ["admin", "receptionist", "sales"]:
        res = supabase.table("orders").select("*").order("created_at", desc=True).limit(500).execute()
    else:
        res = supabase.table("orders").select("*").eq("user_id", user["id"]).order("created_at", desc=True).limit(100).execute()
    return unpack_data(res.data, "order_data")

@router.patch("/orders/{oid}/status")
def update_order_status(oid: str, data: StatusUpdate, user: dict = Depends(require_employee)):
    res = supabase.table("orders").select("id").eq("id", oid).execute()
    if not res.data:
        raise HTTPException(404, "Order not found")
        
    supabase.table("orders").update({"status": data.status, "updated_at": now_iso()}).eq("id", oid).execute()
    return {"ok": True, "status": data.status}
