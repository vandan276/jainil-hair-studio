from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List

from ..db import supabase
from ..utils import unpack_data, new_id, now_iso, get_current_user, require_admin, require_employee, hash_password

router = APIRouter(tags=["admin"])

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: Optional[str] = None
    branch: Optional[str] = None
    section: Optional[str] = None
    base_salary: Optional[float] = None
    commission_rate: Optional[float] = None

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    branch: Optional[str] = None
    section: Optional[str] = None
    is_active: Optional[bool] = None
    base_salary: Optional[float] = None
    commission_rate: Optional[float] = None

@router.get("/admin/employees")
def list_employees(user: dict = Depends(require_employee)):
    res = supabase.table("users").select("*").execute()
    # Remove password_hashes
    for emp in res.data:
        emp.pop("password_hash", None)
    return res.data

@router.post("/admin/employees")
def create_employee(data: RegisterIn, user: dict = Depends(require_admin)):
    email = data.email.lower()
    res = supabase.table("users").select("id").eq("email", email).execute()
    if res.data:
        raise HTTPException(400, "Email already exists")
        
    uid = new_id()
    user_doc = {
        "id": uid,
        "name": data.name,
        "email": email,
        "password_hash": hash_password(data.password),
        "phone": data.phone or "",
        "branch": data.branch or "Surat",
        "section": data.section or "Men",
        "role": data.role or "sales",
        "base_salary": data.base_salary,
        "commission_rate": data.commission_rate,
        "created_at": now_iso(),
        "is_active": True
    }
    
    supabase.table("users").insert(user_doc).execute()
    user_doc.pop("password_hash", None)
    return user_doc

@router.patch("/admin/employees/{uid}")
def update_employee(uid: str, data: EmployeeUpdate, user: dict = Depends(require_admin)):
    res = supabase.table("users").select("id").eq("id", uid).execute()
    if not res.data:
        raise HTTPException(404, "Employee not found")
        
    update_data = {"updated_at": now_iso()}
    for key, value in data.model_dump(exclude_unset=True).items():
        update_data[key] = value
        
    supabase.table("users").update(update_data).eq("id", uid).execute()
    return {"ok": True}

@router.get("/admin/leaves")
def admin_list_leaves(_: dict = Depends(require_admin)):
    try:
        res = supabase.table("leave_requests").select("*").order("created_at", desc=True).execute()
        return res.data
    except:
        return []

@router.get("/admin/appointments")
def admin_appointments(_: dict = Depends(require_admin)):
    try:
        return supabase.table("appointments").select("*").execute().data
    except:
        return []

@router.get("/admin/product-categories")
def admin_product_categories(_: dict = Depends(require_admin)):
    try:
        return unpack_data(supabase.table("product_categories").select("*").execute().data)
    except:
        return []

@router.get("/admin/users")
def admin_users(_: dict = Depends(require_admin)):
    try:
        return supabase.table("users").select("*").execute().data
    except:
        return []

@router.get("/admin/coupons")
def admin_coupons(_: dict = Depends(require_admin)):
    try:
        return supabase.table("coupons").select("*").execute().data
    except:
        return []

@router.get("/admin/attendance")
def admin_attendance(_: dict = Depends(require_admin)):
    try:
        return unpack_data(supabase.table("attendance").select("*").execute().data)
    except:
        return []


@router.patch("/admin/leaves/{rid}/status")
def admin_update_leave_status(rid: str, data: dict, user: dict = Depends(require_admin)):
    status = data.get("status")
    if status not in ["approved", "rejected"]:
        raise HTTPException(400, "Status must be 'approved' or 'rejected'")
        
    res = supabase.table("leave_requests").select("*").eq("id", rid).execute()
    if not res.data:
        raise HTTPException(404, "Leave request not found")
        
    req = res.data[0]
    
    # Update request status
    supabase.table("leave_requests").update({
        "status": status, 
        "updated_at": now_iso()
    }).eq("id", rid).execute()
    
    # If approved, add the date to the user's official leaves array
    if status == "approved":
        user_res = supabase.table("users").select("leaves").eq("id", req["user_id"]).execute()
        if user_res.data:
            leaves = user_res.data[0].get("leaves") or []
            if req["date"] not in leaves:
                leaves.append(req["date"])
                supabase.table("users").update({"leaves": leaves}).eq("id", req["user_id"]).execute()
                
    # If rejected, remove from official leaves array if present
    if status == "rejected":
        user_res = supabase.table("users").select("leaves").eq("id", req["user_id"]).execute()
        if user_res.data:
            leaves = user_res.data[0].get("leaves") or []
            if req["date"] in leaves:
                leaves = [d for d in leaves if d != req["date"]]
                supabase.table("users").update({"leaves": leaves}).eq("id", req["user_id"]).execute()
                
    return {"ok": True, "status": status}

@router.get("/admin/clients/segmentation")
def get_clients_segmentation(user: dict = Depends(require_employee)):
    # 1. Fetch all orders to map by phone
    orders_res = supabase.table("orders").select("phone,created_at").execute()
    phone_to_orders = {}
    for od in orders_res.data:
        phone = od.get("phone") or ""
        if phone:
            phone_clean = "".join(filter(str.isdigit, phone))
            if len(phone_clean) >= 10:
                phone_key = phone_clean[-10:]
                phone_to_orders.setdefault(phone_key, []).append(od)

    # 2. Fetch all leads (clients/customers)
    leads_res = supabase.table("leads").select("id,name,phone,grade,status,branch,assigned_to,created_at").execute()

    segments = {
        "all": [],
        "clients": [],
        "active": [],
        "lapse": [],
        "dormant": [],
        "churn": [],
        "one_time": []
    }

    import datetime
    today_date = datetime.datetime.now(datetime.timezone.utc)

    for ld in leads_res.data:
        phone = ld.get("phone") or ""
        phone_clean = "".join(filter(str.isdigit, phone))
        phone_key = phone_clean[-10:] if len(phone_clean) >= 10 else None

        orders = phone_to_orders.get(phone_key, []) if phone_key else []
        
        # Sort orders by date descending
        orders.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        
        client_data = {
            "id": ld.get("id"),
            "name": ld.get("name"),
            "phone": ld.get("phone"),
            "grade": ld.get("grade"),
            "status": ld.get("status"),
            "branch": ld.get("branch"),
            "visits": len(orders),
            "last_visit": orders[0].get("created_at") if orders else None
        }

        segments["all"].append(client_data)
        
        if len(orders) > 0:
            segments["clients"].append(client_data)
            
            if len(orders) == 1:
                segments["one_time"].append(client_data)
            
            last_visit_str = orders[0].get("created_at")
            if last_visit_str:
                try:
                    last_visit_dt = datetime.datetime.fromisoformat(last_visit_str.replace('Z', '+00:00'))
                    days_since = (today_date - last_visit_dt).days
                    
                    if days_since <= 60:
                        segments["active"].append(client_data)
                    elif days_since <= 120:
                        segments["lapse"].append(client_data)
                    elif days_since <= 180:
                        segments["dormant"].append(client_data)
                    else:
                        segments["churn"].append(client_data)
                except Exception:
                    pass

    return segments

@router.get("/admin/branches")
def admin_branches(_: dict = Depends(require_admin)):
    try:
        res = supabase.table("branches").select("*").execute()
        return unpack_data(res.data)
    except Exception as e:
        print("Error fetching branches:", e)
        return []

@router.post("/admin/branches")
def create_branch(data: dict, user: dict = Depends(require_admin)):
    name = data.get("name")
    if not name:
        raise HTTPException(400, "Branch name is required")
    doc = {
        "id": new_id(),
        "name": name,
        "data": data,
        "created_at": now_iso()
    }
    supabase.table("branches").insert(doc).execute()
    return doc

@router.get("/admin/permissions")
def admin_permissions(_: dict = Depends(require_admin)):
    try:
        res = supabase.table("settings").select("data").eq("id", "admin_permissions").execute()
        if res.data:
            return res.data[0].get("data")
        return {"allowed_tabs": "__ALL__"}
    except Exception as e:
        print("Error fetching permissions:", e)
        return {"allowed_tabs": "__ALL__"}

@router.post("/admin/permissions")
def set_admin_permissions(data: dict, user: dict = Depends(require_admin)):
    try:
        # Check if row exists
        res = supabase.table("settings").select("id").eq("id", "admin_permissions").execute()
        if res.data:
            supabase.table("settings").update({"data": data}).eq("id", "admin_permissions").execute()
        else:
            supabase.table("settings").insert({"id": "admin_permissions", "data": data}).execute()
        return {"ok": True}
    except Exception as e:
        print("Error setting permissions:", e)
        raise HTTPException(500, "Internal Server Error")
