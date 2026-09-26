from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List

from ..db import supabase
from ..utils import unpack_data, new_id, now_iso, get_current_user, require_admin, require_employee, hash_password

router = APIRouter(tags=["admin"])

class RegisterIn(BaseModel):
    model_config = {"extra": "allow"}
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: Optional[str] = None
    branch: Optional[str] = None
    section: Optional[str] = None
    base_salary: Optional[float] = None
    commission_rate: Optional[float] = None
    product_commission_rate: Optional[float] = None
    working_hours_from: Optional[str] = None
    working_hours_to: Optional[str] = None
    gender: Optional[str] = None
    monthly_target: Optional[float] = None
    sales_staff_type: Optional[str] = None
    service_provider_type: Optional[str] = None
    custom_commission_enabled: Optional[bool] = None
    commission_slabs: Optional[list] = None
    commission_type: Optional[str] = None
    phone_numbers: Optional[list] = None

class EmployeeUpdate(BaseModel):
    model_config = {"extra": "allow"}
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    branch: Optional[str] = None
    section: Optional[str] = None
    is_active: Optional[bool] = None
    base_salary: Optional[float] = None
    commission_rate: Optional[float] = None
    product_commission_rate: Optional[float] = None
    working_hours_from: Optional[str] = None
    working_hours_to: Optional[str] = None
    gender: Optional[str] = None
    monthly_target: Optional[float] = None
    sales_staff_type: Optional[str] = None
    service_provider_type: Optional[str] = None
    custom_commission_enabled: Optional[bool] = None
    commission_slabs: Optional[list] = None
    commission_type: Optional[str] = None
    phone_numbers: Optional[list] = None

@router.get("/admin/employees")
def list_employees(user: dict = Depends(require_employee)):
    res = supabase.table("users").select("*").execute()
    employees = res.data
    
    # Fetch all employee metadata from settings
    meta_res = supabase.table("settings").select("*").like("id", "emp_meta_%").execute()
    meta_map = {m["id"].replace("emp_meta_", ""): m.get("data", {}) for m in meta_res.data}
    
    for emp in employees:
        emp.pop("password_hash", None)
        # Merge metadata
        if emp["id"] in meta_map:
            emp.update(meta_map[emp["id"]])
            
    return employees

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
        "role": data.role or "sales",
        "created_at": now_iso()
    }
    
    supabase.table("users").insert(user_doc).execute()
    
    # Extract metadata fields
    meta_fields = {}
    allowed_cols = ["name", "email", "password_hash", "phone", "role"]
    for key, value in data.model_dump(exclude_unset=True).items():
        if key not in allowed_cols and key != "password":
            meta_fields[key] = value
            
    if meta_fields:
        supabase.table("settings").insert({"id": f"emp_meta_{uid}", "data": meta_fields}).execute()
        
    user_doc.pop("password_hash", None)
    user_doc.update(meta_fields)
    return user_doc

@router.patch("/admin/employees/{uid}")
def update_employee(uid: str, data: EmployeeUpdate, user: dict = Depends(require_admin)):
    res = supabase.table("users").select("id").eq("id", uid).execute()
    if not res.data:
        raise HTTPException(404, "Employee not found")
        
    update_data = {"updated_at": now_iso()}
    meta_fields = {}
    allowed_cols = ["name", "email", "phone", "role", "password_hash"]
    
    dumped_data = data.model_dump(exclude_unset=True)
    if "password" in dumped_data:
        update_data["password_hash"] = hash_password(dumped_data.pop("password"))
        
    for key, value in dumped_data.items():
        if key in allowed_cols:
            update_data[key] = value
        else:
            meta_fields[key] = value
            
    if len(update_data) > 1:
        supabase.table("users").update(update_data).eq("id", uid).execute()
        
    if meta_fields:
        # Check if meta doc exists
        meta_res = supabase.table("settings").select("id,data").eq("id", f"emp_meta_{uid}").execute()
        if meta_res.data:
            existing_meta = meta_res.data[0].get("data", {})
            existing_meta.update(meta_fields)
            supabase.table("settings").update({"data": existing_meta}).eq("id", f"emp_meta_{uid}").execute()
        else:
            supabase.table("settings").insert({"id": f"emp_meta_{uid}", "data": meta_fields}).execute()
            
    return {"ok": True}

@router.get("/admin/leaves")
def admin_list_leaves(_: dict = Depends(require_admin)):
    try:
        res = supabase.table("leave_requests").select("*").order("created_at", desc=True).execute()
        return unpack_data(res.data)
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
from datetime import datetime
import pytz

class KioskAttendanceIn(BaseModel):
    user_id: str
    is_checkout: bool
    photo_base64: str
    latitude: Optional[float] = 0.0
    longitude: Optional[float] = 0.0

@router.post("/admin/attendance/kiosk")
def kiosk_attendance(data: KioskAttendanceIn, user: dict = Depends(require_admin)):
    IST = pytz.timezone('Asia/Kolkata')
    now = datetime.now(IST)
    today = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M")
    
    emp_res = supabase.table("users").select("*").eq("id", data.user_id).execute()
    if not emp_res.data:
        raise HTTPException(400, "Employee not found")
    emp = emp_res.data[0]
    
    # Check limit logic
    is_late = False
    role = emp.get("role", "")
    hour = now.hour
    minute = now.minute
    
    if not data.is_checkout:
        if role == "sales":
            # 10:30 AM limit
            if hour > 10 or (hour == 10 and minute > 30):
                is_late = True
        else:
            # 9:30 AM limit (Service and others)
            if hour > 9 or (hour == 9 and minute > 30):
                is_late = True

    # Find existing attendance
    docs = supabase.table("attendance").select("*").contains("data", {"user_id": data.user_id, "date": today}).execute()
    
    if data.is_checkout:
        if not docs.data:
            raise HTTPException(400, "Cannot checkout without check-in")
        record = docs.data[0]
        att_data = record.get("data", {})
        att_data["checkout_time"] = time_str
        att_data["checkout_photo"] = data.photo_base64
        
        supabase.table("attendance").update({"data": att_data}).eq("id", record["id"]).execute()
        return {"ok": True, "message": "Checkout recorded"}
    else:
        if docs.data:
            raise HTTPException(400, "Already checked in today")
            
        aid = new_id()
        att_data = {
            "id": aid,
            "user_id": data.user_id,
            "user_name": emp.get("name"),
            "date": today,
            "time": time_str,
            "status": "present",
            "is_late": is_late,
            "checkin_photo": data.photo_base64,
            "latitude": data.latitude,
            "longitude": data.longitude
        }
        supabase.table("attendance").insert({"id": aid, "data": att_data}).execute()
        
        msg = "Check-in successful!"
        if is_late:
            msg += " (Marked Late)"
        return {"ok": True, "message": msg}
import csv
from fastapi.responses import StreamingResponse
import io

@router.get("/admin/export/clients")
def export_clients(user: dict = Depends(require_admin)):
    try:
        # Fetch data
        leads = supabase.table("leads").select("*").execute().data or []
        consultations = supabase.table("consultations").select("*").execute().data or []
        
        # Build consultation lookup by phone (since lead might be linked by phone or id)
        cons_lookup = {}
        for c in consultations:
            cdata = c.get("data", {})
            phone = cdata.get("phone")
            if phone:
                # Store a dict instead of just string
                cons_lookup[phone] = {
                    "consulted_by": cdata.get("consulted_by", ""),
                    "date": cdata.get("date", "") or c.get("created_at", "")[:10]
                }

        export_data = []
        for lead in leads:
            phone = lead.get("phone", "")
            data = lead.get("data", {})
            
            # Combine purchased items and total revenue
            payments = data.get("payments", [])
            purchased_items = []
            total_spent = 0.0
            
            for p in payments:
                amt = float(p.get("amount") or 0)
                total_spent += amt
                items = p.get("items", [])
                for item in items:
                    name = item.get("name")
                    if name:
                        purchased_items.append(name)
                        
            export_data.append({
                "Client Name": lead.get("name", ""),
                "Phone": phone,
                "Branch": lead.get("branch", ""),
                "Status": lead.get("status", ""),
                "Consulted By": cons_lookup.get(phone, {}).get("consulted_by", ""),
                "Total Spent (₹)": total_spent,
                "Purchased Items": ", ".join(purchased_items),
                "Last Visited Date": cons_lookup.get(phone, {}).get("date", "") or data.get("visited_date") or "",
                "Created At": str(lead.get("created_at", ""))[:10]
            })

        # Create CSV in memory
        stream = io.StringIO()
        if export_data:
            writer = csv.DictWriter(stream, fieldnames=export_data[0].keys())
            writer.writeheader()
            writer.writerows(export_data)
        
        stream.seek(0)
        
        return StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=clients_data.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
