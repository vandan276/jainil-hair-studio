import os
import time
from fastapi import APIRouter, HTTPException, Depends
from supabase import create_client, Client
from pydantic import BaseModel
# Assuming these are imported from the main app/utils:
# from utils import hash_password, new_id, now_iso, require_admin, require_employee, ...

# --- Supabase Initialization ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

api = APIRouter()

@api.post("/admin/employees")
def create_employee(data: dict, user: dict = Depends()): # Replace dict with your actual Pydantic Models & Dependencies
    email = data.get("email").lower()
    res = supabase.table("users").select("id").eq("email", email).limit(1).execute()
    if res.data:
        raise HTTPException(400, "Email already exists")
    uid = "new-uuid" # replace with new_id()
    user_doc = {
        "id": uid,
        "name": data.get("name"),
        "email": email,
        "password_hash": "hash_password(data.password)",
        "phone": data.get("phone") or "",
        "branch": data.get("branch") or "Surat",
        "section": data.get("section") or "Men",
        "role": data.get("role") or "sales",
        "created_at": "now_iso()",
    }
    supabase.table("users").insert(user_doc).execute()
    user_doc.pop("password_hash", None)
    return user_doc


# ----- Leads CRM -----
@api.post("/leads")
def create_lead(data: dict, user: dict = Depends()):
    lid = "new-uuid" # replace with new_id()
    assigned_to = None
    assigned_to_name = None
    if user.get("role") == "sales":
        assigned_to = user["id"]
        assigned_to_name = user["name"]
    doc = {
        "id": lid,
        "lead_number": f"LD-{int(time.time())}",
        "name": data.get("name"),
        "phone": data.get("phone"),
        "branch": data.get("branch"),
        "section": data.get("section"),
        "source": data.get("source"),
        "campaign": data.get("campaign") or "",
        "status": "new",
        "grade": data.get("grade") or "Cold",
        "city": data.get("city") or "",
        "hair_condition": data.get("hair_condition") or "",
        "assigned_to": assigned_to,
        "assigned_to_name": assigned_to_name,
        "notes": [{"text": data.get("notes"), "author": user["name"], "timestamp": "now_iso()"}] if data.get("notes") else [],
        "follow_up_date": None,
        "follow_up_time": None,
        "follow_up_type": None,
        "is_favorite": False,
        "created_by": "Manual",
        "created_at": "now_iso()",
        "updated_at": "now_iso()"
    }
    supabase.table("leads").insert(doc).execute()
    return doc


@api.get("/leads")
def list_leads(user: dict = Depends()):
    if user["role"] == "sales":
        res = supabase.table("leads").select("*").eq("assigned_to", user["id"]).order("created_at", desc=True).limit(1000).execute()
        return res.data
    elif user["role"] in ["employee", "service", "receptionist"]:
        user_id = user["id"]
        user_branch = user.get("branch")
        user_section = user.get("section")
        
        res1 = supabase.table("leads").select("*").eq("assigned_to", user_id).limit(500).execute()
        res2 = supabase.table("leads").select("*").is_("assigned_to", "null").eq("branch", user_branch).eq("section", user_section).limit(500).execute()
        res3 = supabase.table("leads").select("*").is_("assigned_to", "null").eq("branch", user_branch).eq("section", "Not Decided").limit(500).execute()
        res4 = supabase.table("leads").select("*").is_("assigned_to", "null").eq("branch", "Not Decided").limit(500).execute()
        
        merged = {l["id"]: l for l in (res1.data + res2.data + res3.data + res4.data)}
        result = sorted(merged.values(), key=lambda x: x.get("created_at", ""), reverse=True)
        return result
    elif user["role"] == "admin":
        res = supabase.table("leads").select("*").order("created_at", desc=True).limit(1000).execute()
        return res.data
    else:
        return []


@api.get("/leads/{lid}")
def get_lead(lid: str, user: dict = Depends()):
    res = supabase.table("leads").select("*").eq("id", lid).execute()
    if not res.data:
        raise HTTPException(404, "Lead not found")
    data = res.data[0]
    if user["role"] == "employee" and data.get("assigned_to") and data.get("assigned_to") != user["id"]:
        raise HTTPException(403, "Not assigned to this lead")
    return data


@api.patch("/leads/{lid}")
def update_lead(lid: str, data: dict, user: dict = Depends()):
    res = supabase.table("leads").select("id").eq("id", lid).execute()
    if not res.data:
        raise HTTPException(404, "Lead not found")
    
    update_data = {"updated_at": "now_iso()"}
    if data.get("status") is not None: update_data["status"] = data.get("status")
    if data.get("follow_up_date") is not None: update_data["follow_up_date"] = data.get("follow_up_date")
    if data.get("follow_up_time") is not None: update_data["follow_up_time"] = data.get("follow_up_time")
    if data.get("follow_up_type") is not None: update_data["follow_up_type"] = data.get("follow_up_type")
    if data.get("assigned_to") is not None: update_data["assigned_to"] = data.get("assigned_to")
    if data.get("grade") is not None: update_data["grade"] = data.get("grade")
    if data.get("is_favorite") is not None: update_data["is_favorite"] = data.get("is_favorite")
    if data.get("hair_condition") is not None: update_data["hair_condition"] = data.get("hair_condition")
    
    res = supabase.table("leads").update(update_data).eq("id", lid).execute()
    return res.data[0] if res.data else {}


@api.post("/leads/{lid}/notes")
def add_lead_note(lid: str, data: dict, user: dict = Depends()):
    res = supabase.table("leads").select("notes").eq("id", lid).execute()
    if not res.data:
        raise HTTPException(404, "Lead not found")
    
    current_notes = res.data[0].get("notes") or []
    note = {"text": data.get("text"), "author": user["name"], "timestamp": "now_iso()"}
    current_notes.append(note)
    
    supabase.table("leads").update({"notes": current_notes, "updated_at": "now_iso()"}).eq("id", lid).execute()
    return {"ok": True, "note": note}


@api.patch("/leads/{lid}/assign")
def assign_lead(lid: str, data: dict, user: dict = Depends()):
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
        "updated_at": "now_iso()"
    }).eq("id", lid).execute()
    
    return res.data[0] if res.data else {}


# ----- Call Logs & Dashboard -----
@api.post("/leads/{lid}/calls")
def log_call(lid: str, data: dict, user: dict = Depends()):
    res = supabase.table("leads").select("notes").eq("id", lid).execute()
    if not res.data:
        raise HTTPException(404, "Lead not found")
        
    call_id = "new-uuid" # replace with new_id()
    call_doc = {
        "id": call_id,
        "lead_id": lid,
        "user_id": user["id"],
        "duration": data.get("duration"),
        "talk_time": data.get("talk_time"),
        "outcome": data.get("outcome"),
        "comment": data.get("comment") or "",
        "timestamp": "now_iso()"
    }
    supabase.table("calls").insert({"id": call_id, "lead_id": lid, "call_data": call_doc}).execute()
    
    # Auto update lead status based on outcome
    update_data = {"updated_at": "now_iso()"}
    
    if data.get("outcome") == "Not Picked Up":
        update_data["status"] = "in process"
    elif data.get("outcome") in ["Said No", "Not Interested"]:
        update_data["status"] = "dead"
    elif data.get("outcome") == "Picked Up":
        update_data["status"] = "in process"
        if data.get("grade"): update_data["grade"] = data.get("grade")
        if data.get("next_followup_date"): update_data["follow_up_date"] = data.get("next_followup_date")
        if data.get("next_followup_time"): update_data["follow_up_time"] = data.get("next_followup_time")
    
    # Add comment to history if provided
    if data.get("comment"):
        note = {"text": f"Call Outcome: {data.get('outcome')} - {data.get('comment')}", "author": user["name"], "timestamp": "now_iso()"}
        current_notes = res.data[0].get("notes") or []
        current_notes.append(note)
        update_data["notes"] = current_notes
        
    supabase.table("leads").update(update_data).eq("id", lid).execute()
    return {"ok": True, "call_id": call_id}


@api.get("/sales/dashboard")
def get_sales_dashboard(user: dict = Depends()):
    fields = "created_at, updated_at, status, grade, follow_up_date, assigned_to, branch, section"
    if user["role"] == "sales":
        res = supabase.table("leads").select(fields).eq("assigned_to", user["id"]).limit(1000).execute()
        docs = res.data
    elif user["role"] in ["employee", "service", "receptionist"]:
        user_id = user["id"]
        user_branch = user.get("branch")
        user_section = user.get("section")
        
        res1 = supabase.table("leads").select(fields).eq("assigned_to", user_id).limit(500).execute()
        res2 = supabase.table("leads").select(fields).is_("assigned_to", "null").eq("branch", user_branch).eq("section", user_section).limit(300).execute()
        
        merged = {l["id"]: l for l in (res1.data + res2.data)}
        docs = list(merged.values())
    else:
        res = supabase.table("leads").select(fields).order("created_at", desc=True).limit(1000).execute()
        docs = res.data
    
    today = "now_iso()[:10]" # replace with actual
    inactive_statuses = ["converted", "closed", "dead", "visit scheduled dead", "recycled"]
    
    stats = {
        "open": {
            "overdues": len([d for d in docs if d.get("follow_up_date") and d.get("follow_up_date") < today and d.get("status") not in inactive_statuses]),
            "due_today": len([d for d in docs if d.get("follow_up_date") == today and d.get("status") not in inactive_statuses]),
            "total_assigned": len(docs),
            "opportunities": len([d for d in docs if d.get("grade") in ["Hot", "Warm"] and d.get("status") not in inactive_statuses]),
            "todays_calls": 0,
            "unread_whatsapp": 0
        },
        "periodic": {
            "todays_leads": len([d for d in docs if d.get("created_at", "").startswith(today)]),
            "calls_made": 0,
            "activities_completed": 0,
            "messages_sent": 0
        },
        "result": {
            "converted": len([d for d in docs if d.get("status") == "converted" or d.get("status") == "closed"]),
            "recycled": len([d for d in docs if d.get("status") == "recycled"]),
            "dead": len([d for d in docs if d.get("status") == "dead"]),
            "closed_won": len([d for d in docs if (d.get("status") == "converted" or d.get("status") == "closed") and d.get("grade") in ["Hot", "Warm"]]),
            "on_hold": len([d for d in docs if d.get("status") == "in process" and d.get("grade") == "Cold"]),
            "closed_lost": len([d for d in docs if d.get("status") == "dead" and d.get("grade") in ["Hot", "Warm"]]),
            "completed_activities": 0
        }
    }
    return stats
