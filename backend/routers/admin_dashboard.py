from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from pydantic import BaseModel
from ..db import supabase
from ..utils import unpack_data, require_admin, new_id, now_iso

router = APIRouter(tags=["admin_dashboard"])

class ExpenseIn(BaseModel):
    category: str
    amount: float
    date: str
    description: Optional[str] = ""
    paid_to: Optional[str] = ""

@router.get("/admin/stats")
def admin_stats(branch: Optional[str] = None, user: dict = Depends(require_admin)):
    import traceback
    try:
        if user.get("email", "").lower() != "superadmin@jainil.com":
            branch = user.get("branch")

        users_q = supabase.table("users").select("id").eq("role", "user")
        users_count = len(users_q.execute().data)
        
        try:
            bookings_q = supabase.table("bookings").select("id")
            if branch: bookings_q = bookings_q.eq("branch", branch)
            bookings_count = len(bookings_q.execute().data)
        except: bookings_count = 0

        try:
            orders_q = supabase.table("orders").select("total_amount,order_data")
            orders_data = orders_q.execute().data
            orders_count = len(orders_data)
        except:
            orders_data = []
            orders_count = 0
            
        try:
            products_q = supabase.table("products").select("id")
            if branch: products_q = products_q.eq("branch", branch)
            products_count = len(products_q.execute().data)
        except: products_count = 0
            
        try:
            services_count = len(unpack_data(supabase.table("services").select("id").execute().data))
        except: services_count = 0
            
        unpacked = unpack_data(orders_data, "order_data")
        revenue = 0.0
        for o in unpacked:
            try:
                val = o.get("total") or o.get("total_amount") or 0
                if str(val).strip() == "": val = 0
                revenue += float(val)
            except: pass
            
        try:
            rb_q = supabase.table("bookings").select("*").order("created_at", desc=True).limit(5)
            if branch: rb_q = rb_q.eq("branch", branch)
            recent_bookings = rb_q.execute().data
        except: recent_bookings = []
        
        try:
            ro_q = supabase.table("orders").select("*").order("created_at", desc=True).limit(5)
            recent_orders = unpack_data(ro_q.execute().data, "order_data")
        except: recent_orders = []
        
        return {
            "users": users_count,
            "bookings": bookings_count,
            "orders": orders_count,
            "products": products_count,
            "services": services_count,
            "revenue": revenue,
            "recent_bookings": recent_bookings,
            "recent_orders": recent_orders,
            "today_revenue": 0, "today_manual_revenue": 0, "daily_sales": 0,
            "daily_services": 0, "daily_website_products": 0, "daily_salon_products": 0,
            "daily_sales_details": [], "daily_services_details": [],
            "daily_website_products_details": [], "daily_salon_products_details": []
        }
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}

@router.get("/admin/orders")
def admin_orders(limit: int = 200, branch: Optional[str] = None, user: dict = Depends(require_admin)):
    if user.get("email", "").lower() != "superadmin@jainil.com":
        branch = user.get("branch")

    q = supabase.table("orders").select("*").order("created_at", desc=True).limit(limit)

    return q.execute().data

@router.patch("/admin/orders/{oid}")
def admin_update_order(oid: str, data: dict, _: dict = Depends(require_admin)):
    supabase.table("orders").update(data).eq("id", oid).execute()
    return {"ok": True}

@router.get("/admin/expenses")
def admin_list_expenses(branch: Optional[str] = None, user: dict = Depends(require_admin)):
    if user.get("email", "").lower() != "superadmin@jainil.com":
        branch = user.get("branch")

    try:
        docs = unpack_data(supabase.table("expenses").select("*").execute().data)
    except:
        docs = []
    if branch and branch != "All Branches":
        docs = [e for e in docs if not e.get("branch") or e.get("branch") == branch]
    
    docs.sort(key=lambda x: x.get("date") or "", reverse=True)
    return docs

@router.post("/admin/expenses")
def admin_create_expense(data: ExpenseIn, admin: dict = Depends(require_admin)):
    eid = new_id()
    doc = {
        "id": eid, 
        **data.model_dump(), 
        "paid_by": admin.get("name", "Admin"), 
        "branch": admin.get("branch", ""), 
        "created_at": now_iso()
    }
    supabase.table("expenses").insert(doc).execute()
    return doc

@router.put("/admin/expenses/{eid}")
def admin_update_expense(eid: str, data: ExpenseIn, _: dict = Depends(require_admin)):
    update_data = data.model_dump()
    supabase.table("expenses").update(update_data).eq("id", eid).execute()
    return {"ok": True, "id": eid}

@router.delete("/admin/expenses/{eid}")
def admin_delete_expense(eid: str, _: dict = Depends(require_admin)):
    supabase.table("expenses").delete().eq("id", eid).execute()
    return {"ok": True}

@router.get("/admin/products/usages")
def admin_product_usages(branch: Optional[str] = None, user: dict = Depends(require_admin)):
    try:
        q = supabase.table("product_usages").select("*")
        if branch and branch != "All Branches":
            q = q.eq("branch", branch)
        return q.execute().data
    except:
        return []

@router.get("/admin/products/stock-logs")
def admin_stock_logs(branch: Optional[str] = None, user: dict = Depends(require_admin)):
    try:
        q = supabase.table("stock_logs").select("*")
        if branch and branch != "All Branches":
            q = q.eq("branch", branch)
        return q.execute().data
    except:
        return []

@router.get("/admin/vendors")
def admin_vendors(user: dict = Depends(require_admin)):
    try:
        return unpack_data(supabase.table("vendors").select("*").execute().data)
    except:
        return []

@router.post("/admin/vendors")
def admin_create_vendor(data: dict, user: dict = Depends(require_admin)):
    doc = {"id": new_id(), **data, "created_at": now_iso()}
    supabase.table("vendors").insert(doc).execute()
    return doc

@router.get("/maintenance")
def admin_maintenance(user: dict = Depends(require_admin)):
    try:
        return supabase.table("maintenance").select("*").execute().data
    except:
        return []

@router.post("/maintenance")
def admin_create_maintenance(data: dict, user: dict = Depends(require_admin)):
    doc = {"id": new_id(), **data, "created_at": now_iso()}
    supabase.table("maintenance").insert(doc).execute()
    return doc
