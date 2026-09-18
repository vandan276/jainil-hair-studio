import time
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List

from ..db import supabase
from ..utils import new_id, now_iso, get_current_user, require_employee, require_admin, unpack_data

router = APIRouter(tags=["leads"])

class LeadIn(BaseModel):
    name: str
    phone: str
    branch: str = "Surat"
    section: str = "Men"
    source: str = "manual"
    campaign: Optional[str] = None
    notes: Optional[str] = None
    grade: Optional[str] = None
    city: Optional[str] = None
    hair_condition: Optional[str] = None

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    follow_up_date: Optional[str] = None
    follow_up_time: Optional[str] = None
    follow_up_type: Optional[str] = None
    assigned_to: Optional[str] = None
    grade: Optional[str] = None
    is_favorite: Optional[bool] = None
    hair_condition: Optional[str] = None

class LeadNoteIn(BaseModel):
    text: str

class CallLogIn(BaseModel):
    duration: int
    talk_time: int
    outcome: str
    comment: Optional[str] = ""
    grade: Optional[str] = ""
    next_followup_date: Optional[str] = None
    next_followup_time: Optional[str] = None
    converted_date: Optional[str] = None
    token_date: Optional[str] = None
    sale_amount: Optional[float] = None
    pending_amount: Optional[float] = None
    payment_mode: Optional[str] = None
    consulted_by: Optional[str] = None

@router.post("/leads")
def create_lead(data: LeadIn, user: dict = Depends(require_employee)):
    lid = new_id()
    assigned_to = None
    assigned_to_name = None
    if user.get("role") == "sales":
        assigned_to = user["id"]
        assigned_to_name = user.get("name")
    
    doc = {
        "id": lid,
        "lead_number": f"LD-{int(time.time())}",
        "name": data.name,
        "phone": data.phone,
        "branch": data.branch,
        "section": data.section,
        "source": data.source,
        "campaign": data.campaign or "",
        "status": "new",
        "grade": data.grade or "Cold",
        "city": data.city or "",
        "hair_condition": data.hair_condition or "",
        "assigned_to": assigned_to,
        "assigned_to_name": assigned_to_name,
        "notes": [{"text": data.notes, "author": user.get("name"), "timestamp": now_iso()}] if data.notes else [],
        "created_by": "Manual",
        "created_at": now_iso(),
        "updated_at": now_iso()
    }
    supabase.table("leads").insert(doc).execute()
    return doc


@router.get("/leads")
def list_leads(user: dict = Depends(require_employee)):
    try:
        role = user.get("role", "")
        if role == "sales":
            res = supabase.table("leads").select("*").eq("assigned_to", user.get("id")).order("created_at", desc=True).limit(1000).execute()
            return unpack_data(res.data, "data")
        elif role in ["employee", "service", "receptionist"]:
            user_id = user.get("id")
            user_branch = user.get("branch") or ""
            user_section = user.get("section") or ""
            
            res1 = supabase.table("leads").select("*").eq("assigned_to", user_id).limit(500).execute()
            res2 = supabase.table("leads").select("*").is_("assigned_to", "null").eq("branch", user_branch).eq("section", user_section).limit(500).execute()
            res3 = supabase.table("leads").select("*").is_("assigned_to", "null").eq("branch", user_branch).eq("section", "Not Decided").limit(500).execute()
            res4 = supabase.table("leads").select("*").is_("assigned_to", "null").eq("branch", "Not Decided").limit(500).execute()
            
            merged = {l["id"]: l for l in (res1.data + res2.data + res3.data + res4.data)}
            return unpack_data(sorted(merged.values(), key=lambda x: x.get("created_at", ""), reverse=True), "data")
        else:
            res = supabase.table("leads").select("*").order("created_at", desc=True).limit(1000).execute()
            return unpack_data(res.data, "data")
    except Exception as e:
        print(f"Error in list_leads: {e}")
        return []


@router.get("/leads/{lid}")
def get_lead(lid: str, user: dict = Depends(require_employee)):
    res = supabase.table("leads").select("*").eq("id", lid).execute()
    if not res.data:
        raise HTTPException(404, "Lead not found")
    data = res.data[0]
    if user.get("role") == "employee" and data.get("assigned_to") and data.get("assigned_to") != user["id"]:
        raise HTTPException(403, "Not assigned to this lead")
    return data


@router.patch("/leads/{lid}")
def update_lead(lid: str, data: LeadUpdate, user: dict = Depends(require_employee)):
    res = supabase.table("leads").select("id").eq("id", lid).execute()
    if not res.data:
        raise HTTPException(404, "Lead not found")
    
    update_data = {"updated_at": now_iso()}
    for field, value in data.model_dump(exclude_unset=True).items():
        update_data[field] = value
        
    res = supabase.table("leads").update(update_data).eq("id", lid).execute()
    return unpack_data(res.data, "data")[0] if res.data else {}


@router.post("/leads/{lid}/notes")
def add_lead_note(lid: str, data: LeadNoteIn, user: dict = Depends(require_employee)):
    res = supabase.table("leads").select("notes").eq("id", lid).execute()
    if not res.data:
        raise HTTPException(404, "Lead not found")
    
    current_notes = res.data[0].get("notes") or []
    note = {"text": data.text, "author": user.get("name"), "timestamp": now_iso()}
    current_notes.append(note)
    
    supabase.table("leads").update({"notes": current_notes, "updated_at": now_iso()}).eq("id", lid).execute()
    return {"ok": True, "note": note}


@router.patch("/leads/{lid}/assign")
def assign_lead(lid: str, data: dict, user: dict = Depends(require_admin)):
    res = supabase.table("leads").select("id").eq("id", lid).execute()
    if not res.data:
        raise HTTPException(404, "Lead not found")
    
    assigned_to = data.get("assigned_to")
    assigned_to_name = None
    if assigned_to:
        emp_res = supabase.table("users").select("name").eq("id", assigned_to).execute()
        if emp_res.data:
            assigned_to_name = emp_res.data[0].get("name")
            
    res = supabase.table("leads").update({
        "assigned_to": assigned_to,
        "assigned_to_name": assigned_to_name,
        "updated_at": now_iso()
    }).eq("id", lid).execute()
    
    return unpack_data(res.data, "data")[0] if res.data else {}


@router.post("/leads/{lid}/calls")
def log_call(lid: str, data: CallLogIn, user: dict = Depends(require_employee)):
    res = supabase.table("leads").select("*").eq("id", lid).execute()
    if not res.data:
        raise HTTPException(404, "Lead not found")
    
    lead_dict = res.data[0]
        
    call_id = new_id()
    call_doc = {
        "id": call_id,
        "lead_id": lid,
        "call_data": {
            "user_id": user["id"],
            "duration": data.duration,
            "talk_time": data.talk_time,
            "outcome": data.outcome
        },
        "created_at": now_iso()
    }
    supabase.table("calls").insert(call_doc).execute()
    
    update_data = {"updated_at": now_iso()}
    
    if data.outcome == "Not Picked Up":
        update_data["status"] = "in process"
    elif data.outcome in ["Said No", "Not Interested"]:
        update_data["status"] = "dead"
    elif data.outcome in ["Picked Up", "Interested (Follow-up)"]:
        update_data["status"] = "in process"
        if data.grade: update_data["grade"] = data.grade
        if data.next_followup_date: update_data["follow_up_date"] = data.next_followup_date
        if data.next_followup_time: update_data["follow_up_time"] = data.next_followup_time
    elif data.outcome == "Visit Scheduled":
        update_data["status"] = "visit"
        if data.next_followup_date: update_data["follow_up_date"] = data.next_followup_date
        if data.next_followup_time: update_data["follow_up_time"] = data.next_followup_time
    elif data.outcome == "Visited":
        update_data["status"] = "visited"
    elif data.outcome == "Token Received":
        update_data["status"] = "token received"
    elif data.outcome == "Converted":
        update_data["status"] = "converted"
        update_data["follow_up_date"] = None
        update_data["follow_up_time"] = None

    notes_to_add = []
    if data.comment:
        notes_to_add.append({"text": f"Call: {data.outcome} - {data.comment}", "author": user.get("name"), "timestamp": now_iso()})
        
    if data.outcome == "Visited" and data.consulted_by:
        notes_to_add.append({"text": f"SYSTEM: Customer visited and was consulted by {data.consulted_by}", "author": "System", "timestamp": now_iso()})

    # Sale Amount Logic
    order_id = None
    if data.sale_amount:
        eff_date = data.converted_date if data.outcome == "Converted" else (data.token_date if data.outcome == "Token Received" else None)
        payment_ts = f"{eff_date}T12:00:00Z" if eff_date else now_iso()
        
        payment = {
            "amount": data.sale_amount,
            "type": "token" if data.outcome == "Token Received" else "closure",
            "mode": data.payment_mode or "Not Specified",
            "timestamp": payment_ts,
            "date": eff_date or payment_ts[:10],
            "recorded_by": user["name"]
        }
        # The following were removed because they don't exist in Supabase leads schema:
        # payments, total_sale_amount

        
        ptype = "Token" if data.outcome == "Token Received" else "Closure Amount"
        pmode = data.payment_mode or "Not Specified"
        date_str = f" | Date: {eff_date}" if eff_date else ""
        notes_to_add.append({
            "text": f"SYSTEM: {user.get('name')} collected {ptype} of ₹{data.sale_amount:,.2f} via {pmode}{date_str}", 
            "author": "System", 
            "timestamp": now_iso()
        })
        
        # Optionally create an order for receipt generation
        order_id = new_id()
        order_doc = {
            "id": order_id,
            "lead_id": lid,
            "customer_name": lead_dict.get("name", "Valued Client"),
            "customer_phone": lead_dict.get("phone", ""),
            "total": data.sale_amount,
            "payment_mode": pmode,
            "items": [{"name": ptype, "price": data.sale_amount, "qty": 1}],
            "created_at": now_iso(),
            "branch": lead_dict.get("branch", ""),
            "employee_id": user["id"]
        }
        try:
            supabase.table("orders").insert(order_doc).execute()
        except:
            pass

    # pending_amount column does not exist in Supabase leads schema
    if notes_to_add:
        current_notes = lead_dict.get("notes") or []
        current_notes.extend(notes_to_add)
        update_data["notes"] = current_notes
        
    supabase.table("leads").update(update_data).eq("id", lid).execute()
    return {"ok": True, "call_id": call_id, "order_id": order_id}

@router.patch("/leads/{lid}/visit")
def schedule_visit(lid: str, data: dict, user: dict = Depends(require_employee)):
    update_data = {
        "status": "visit",
        "follow_up_date": data.get("visit_date"),
        "follow_up_time": data.get("visit_time"),
        "updated_at": now_iso()
    }
    
    res = supabase.table("leads").select("notes").eq("id", lid).execute()
    if res.data:
        current_notes = res.data[0].get("notes") or []
        current_notes.append({
            "text": f"SYSTEM: Visit scheduled for {data.get('visit_date')} {data.get('visit_time')}",
            "author": user.get("name"),
            "timestamp": now_iso()
        })
        update_data["notes"] = current_notes
        
    supabase.table("leads").update(update_data).eq("id", lid).execute()
    return {"ok": True}


@router.get("/sales/dashboard")
def get_sales_dashboard(user: dict = Depends(require_employee)):
    try:
        fields = "created_at, updated_at, status, grade, follow_up_date, assigned_to, branch, section"
        role = user.get("role", "")
        if role == "sales":
            res = supabase.table("leads").select(fields).eq("assigned_to", user.get("id")).limit(1000).execute()
            docs = res.data
        elif role in ["employee", "service", "receptionist"]:
            user_id = user.get("id")
            user_branch = user.get("branch") or ""
            user_section = user.get("section") or ""
            
            res1 = supabase.table("leads").select(fields).eq("assigned_to", user_id).limit(500).execute()
            res2 = supabase.table("leads").select(fields).is_("assigned_to", "null").eq("branch", user_branch).eq("section", user_section).limit(300).execute()
            merged = {l["id"]: l for l in (res1.data + res2.data)}
            docs = list(merged.values())
        else:
            res = supabase.table("leads").select(fields).order("created_at", desc=True).limit(1000).execute()
            docs = res.data
        
        today = now_iso()[:10]
        inactive = ["converted", "closed", "dead", "visit scheduled dead", "recycled"]
        
        stats = {
            "open": {
                "overdues": len([d for d in docs if d.get("follow_up_date") and d.get("follow_up_date") < today and d.get("status") not in inactive]),
                "due_today": len([d for d in docs if d.get("follow_up_date") == today and d.get("status") not in inactive]),
                "total_assigned": len(docs),
                "opportunities": len([d for d in docs if d.get("grade") in ["Hot", "Warm"] and d.get("status") not in inactive]),
            },
            "result": {
                "converted": len([d for d in docs if d.get("status") in ["converted", "closed"]]),
                "dead": len([d for d in docs if d.get("status") == "dead"]),
            }
        }
        return stats
    except Exception as e:
        print(f"Error in get_sales_dashboard: {e}")
        return {
            "open": {"overdues": 0, "due_today": 0, "total_assigned": 0, "opportunities": 0},
            "result": {"converted": 0, "dead": 0}
        }

@router.delete("/leads/{lid}")
def delete_lead(lid: str, user: dict = Depends(require_employee)):
    # You might want to restrict this to admins or allow anyone in sales to delete
    res = supabase.table("leads").delete().eq("id", lid).execute()
    return {"ok": True}
