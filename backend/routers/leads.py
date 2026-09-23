import time
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Request, Query
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
    txn_id: Optional[str] = None
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

@router.get("/leads/duplicates")
def get_duplicate_leads(user: dict = Depends(require_employee)):
    import os
    # Get the webhook secret (for the frontend to generate the webhook url)
    secret_res = supabase.table("settings").select("data").eq("id", "meta_config").execute()
    secret = "jainil_secret_123"
    if secret_res.data:
        secret = secret_res.data[0].get("data", {}).get("webhook_secret", secret)
    
    # Get all leads
    res = supabase.table("leads").select("*").execute()
    leads = [unpack_data(d, "data")[0] for d in res.data]
    
    by_phone = {}
    for d in leads:
        phone = d.get("phone")
        if phone:
            phone_clean = "".join(filter(str.isdigit, phone))
            if len(phone_clean) >= 10:
                phone_key = phone_clean[-10:]
                by_phone.setdefault(phone_key, []).append(d)
                
    duplicates = {}
    for phone_key, group in by_phone.items():
        if len(group) > 1:
            display_phone = group[0].get("phone")
            duplicates[display_phone] = group
            
    return {"secret": secret, "duplicates": duplicates}
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
async def update_lead(lid: str, request: Request, user: dict = Depends(require_employee)):
    try:
        data = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON")
        
    res = supabase.table("leads").select("*").eq("id", lid).execute()
    if not res.data:
        raise HTTPException(404, "Lead not found")
        
    existing_lead = res.data[0]
    existing_data = existing_lead.get("data") or {}
    
    update_data = {"updated_at": now_iso()}
    valid_cols = ['lead_number', 'name', 'phone', 'branch', 'section', 'source', 'campaign', 'status', 'grade', 'city', 'hair_condition', 'assigned_to', 'assigned_to_name', 'follow_up_date', 'follow_up_time', 'follow_up_type', 'is_favorite']
    date_cols = {'follow_up_date', 'follow_up_time', 'follow_up_type'}
    
    for field, value in data.items():
        if field in valid_cols:
            # Convert empty strings to None for date/time columns to avoid DB type errors
            if field in date_cols and value == "":
                value = None
            update_data[field] = value
        elif field not in ["id", "created_at", "updated_at", "created_by", "notes", "data", "new_note"]:
            existing_data[field] = value

    # If comment is provided and changed/new, log it into notes history
    if "comment" in data:
        new_comment_val = (data.get("comment") or "").strip()
        old_comment_val = (existing_data.get("comment") or "").strip()
        existing_data["comment"] = new_comment_val
        if new_comment_val and new_comment_val != old_comment_val:
            current_notes = existing_lead.get("notes") or []
            note = {"text": f"Comment: {new_comment_val}", "author": user.get("name") or "Staff", "timestamp": now_iso()}
            current_notes.append(note)
            update_data["notes"] = current_notes

    if data.get("new_note"):
        current_notes = update_data.get("notes") or existing_lead.get("notes") or []
        note = {"text": data["new_note"], "author": user.get("name") or "Staff", "timestamp": now_iso()}
        current_notes.append(note)
        update_data["notes"] = current_notes
            
    update_data["data"] = existing_data
    
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
        if data.grade and data.grade.lower() == "dead" and not data.next_followup_date:
            update_data["status"] = "dead"
            update_data["grade"] = "Dead"
            update_data["follow_up_date"] = None
            update_data["follow_up_time"] = None
        else:
            update_data["status"] = "in process"
            if data.grade: update_data["grade"] = data.grade
            update_data["follow_up_date"] = data.next_followup_date
            update_data["follow_up_time"] = data.next_followup_time
    elif data.outcome in ["Said No", "Not Interested"]:
        update_data["status"] = "dead"
        update_data["follow_up_date"] = None
        update_data["follow_up_time"] = None
    elif data.outcome == "Visit Scheduled Dead":
        update_data["status"] = "visit scheduled dead"
        update_data["follow_up_date"] = None
        update_data["follow_up_time"] = None
    elif data.outcome in ["Picked Up", "Interested (Follow-up)"]:
        update_data["status"] = "in process"
        if data.grade: update_data["grade"] = data.grade
        update_data["follow_up_date"] = data.next_followup_date
        update_data["follow_up_time"] = data.next_followup_time
    elif data.outcome == "Visit Scheduled":
        update_data["status"] = "visit"
        update_data["follow_up_date"] = data.next_followup_date
        update_data["follow_up_time"] = data.next_followup_time
    elif data.outcome == "Visited":
        update_data["status"] = "visited"
        update_data["follow_up_date"] = data.next_followup_date
        update_data["follow_up_time"] = data.next_followup_time
    elif data.outcome == "Token Received":
        update_data["status"] = "token received"
        update_data["follow_up_date"] = data.next_followup_date
        update_data["follow_up_time"] = data.next_followup_time
    elif data.outcome == "Converted":
        update_data["status"] = "converted"
        update_data["follow_up_date"] = None
        update_data["follow_up_time"] = None

    notes_to_add = []
    
    # Always log the call outcome, even without a comment, and include schedule info
    note_text = f"Call Outcome: {data.outcome}"
    if data.next_followup_date:
        note_text += f" - Scheduled for {data.next_followup_date}"
        if data.next_followup_time:
            note_text += f" at {data.next_followup_time}"
            
    if data.comment:
        note_text += f" | Note: {data.comment}"
        
    notes_to_add.append({"text": note_text, "author": user.get("name"), "timestamp": now_iso()})
        
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
        if hasattr(data, "txn_id") and data.txn_id:
            payment["txn_id"] = data.txn_id
        existing_data = lead_dict.get("data") or {}
        
        if data.outcome == "Converted":
            prev_total = float(existing_data.get("total_sale_amount") or 0)
            existing_data["total_sale_amount"] = prev_total + data.sale_amount
            existing_data["pending_payment"] = 0.0
        else:
            prev_total = float(existing_data.get("total_sale_amount") or 0)
            existing_data["total_sale_amount"] = prev_total + data.sale_amount
            existing_data["pending_payment"] = float(data.pending_amount) if hasattr(data, "pending_amount") and data.pending_amount else 0.0
            
        existing_data["payment_mode"] = data.payment_mode or "Not Specified"
        
        # Initialize payments list if it doesn't exist
        if "payments" not in existing_data:
            existing_data["payments"] = []
        existing_data["payments"].append(payment)
        
        # Double check sanity: calculate from payments directly
        existing_data["total_sale_amount"] = sum([float(p.get("amount", 0)) for p in existing_data["payments"]])
        
        update_data["data"] = existing_data
        ptype = "Token" if data.outcome == "Token Received" else "Closure Amount"
        pmode = data.payment_mode or "Not Specified"
        date_str = f" | Date: {eff_date}" if eff_date else ""
        txn_str = f" (Ref: {data.txn_id})" if hasattr(data, "txn_id") and data.txn_id else ""
        notes_to_add.append({
            "text": f"SYSTEM: {user.get('name')} collected {ptype} of ₹{data.sale_amount:,.2f} via {pmode}{txn_str}{date_str}", 
            "author": "System", 
            "timestamp": now_iso()
        })
        
        # Create an order for receipt generation (must use correct schema)
        order_id = new_id()
        crm_order_data = {
            "id": order_id,
            "lead_id": lid,
            "full_name": lead_dict.get("name", "Valued Client"),
            "phone": lead_dict.get("phone", ""),
            "total": data.sale_amount,
            "amount_paid": data.sale_amount,
            "pending_amount": float(data.pending_amount) if hasattr(data, "pending_amount") and data.pending_amount else 0.0,
            "payment_method": pmode,
            "split_payments": [{"amount": data.sale_amount, "method": pmode}],
            "items": [{
                "name": ptype,
                "price": data.sale_amount,
                "qty": 1,
                "line_total": data.sale_amount,
                "type": "crm",
                "service_provider": user["id"]
            }],
            "branch": lead_dict.get("branch", ""),
            "employee_id": user["id"],
            "employee_name": user.get("name", ""),
            "status": "completed",
            "address": "In-Store / Direct",
            "created_at": payment_ts,
            "notes": f"CRM {ptype} | Amount Paid: ₹{data.sale_amount:,.2f} | Pending Due: ₹{(data.pending_amount or 0):,.2f}",
            "next_appointment_date": "",
            "next_appointment_time": "",
        }
        order_doc = {
            "id": order_id,
            "lead_id": lid,
            "phone": lead_dict.get("phone", ""),
            "total_amount": float(data.sale_amount),
            "status": "completed",
            "created_at": payment_ts,
            "updated_at": payment_ts,
            "order_data": crm_order_data,
        }
        try:
            supabase.table("orders").insert(order_doc).execute()
        except Exception as e:
            print(f"Error inserting CRM order: {e}")
            order_id = None

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
def get_sales_dashboard(
    date: Optional[str] = Query(None),
    period: Optional[str] = Query("daily"),
    results_date: Optional[str] = Query(None),
    results_period: Optional[str] = Query("daily"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    res_start_date: Optional[str] = Query(None),
    res_end_date: Optional[str] = Query(None),
    user: dict = Depends(require_employee)
):
    try:
        fields = "created_at, updated_at, status, grade, follow_up_date, assigned_to, branch, section, data"
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

        target_date = date if date else now_iso()[:10]
        res_date = results_date if results_date else target_date

        def get_range(target, p, s=None, e=None):
            try:
                dt = datetime.fromisoformat(target)
                if p == "daily":
                    return target, target
                if p == "weekly":
                    start = (dt - timedelta(days=dt.weekday())).isoformat()[:10]
                    end = (dt - timedelta(days=dt.weekday()) + timedelta(days=6)).isoformat()[:10]
                    return start, end
                if p == "monthly":
                    return target[:7] + "-01", target[:7] + "-31"
                if p == "quarterly":
                    q = (dt.month - 1) // 3
                    sm = q * 3 + 1
                    em = sm + 2
                    return f"{dt.year:04d}-{sm:02d}-01", f"{dt.year:04d}-{em:02d}-31"
                if p == "yearly":
                    return f"{dt.year:04d}-01-01", f"{dt.year:04d}-12-31"
                if p == "custom":
                    return s if s else target, e if e else target
            except:
                return target, target
            return target, target

        p_start, p_end = get_range(target_date, period, start_date, end_date)
        r_start, r_end = get_range(res_date, results_period, res_start_date, res_end_date)

        def is_in(ts, start, end):
            if not ts: return False
            return start <= ts[:10] <= end

        def get_effective_ts(p, d):
            if p.get("type") == "token":
                if d.get("token_received_date"):
                    return d.get("token_received_date")
                if d.get("token_received_at"):
                    return d.get("token_received_at")
                return p.get("date") or p.get("timestamp") or ""
            elif p.get("type") == "closure":
                if d.get("converted_date"):
                    return d.get("converted_date")
                if d.get("converted_at"):
                    return d.get("converted_at")
                return p.get("date") or p.get("timestamp") or ""
            return p.get("date") or p.get("timestamp") or ""

        # Periodic Stats (Leads/Sales in selected period)
        period_sales = 0.0
        for d in docs:
            d_data = d.get("data") or {}
            for p in d_data.get("payments", []):
                if isinstance(p, dict):
                    eff_ts = get_effective_ts(p, d_data)
                    if is_in(eff_ts, p_start, p_end):
                        period_sales += float(p.get("amount", 0.0))

        # Result Stats (Conversions/Visits in selected results period)
        def check_result(d, status_list):
            if d.get("status") not in status_list: return False
            d_data = d.get("data") or {}
            if "converted" in status_list or "closed" in status_list:
                dt_str = d_data.get("converted_date") or d_data.get("converted_at") or d.get("updated_at") or ""
            elif "token received" in status_list:
                dt_str = d_data.get("token_received_date") or d_data.get("token_received_at") or d.get("updated_at") or ""
            elif "visited" in status_list:
                dt_str = d_data.get("visited_date") or d.get("updated_at") or ""
            elif "dead" in status_list:
                dt_str = d_data.get("dead_at") or d.get("updated_at") or ""
            else:
                dt_str = d.get("updated_at") or ""
            return is_in(dt_str, r_start, r_end)

        this_month = now_iso()[:7]
        monthly_sales = 0.0
        for d in docs:
            d_data = d.get("data") or {}
            for p in d_data.get("payments", []):
                if isinstance(p, dict):
                    eff_ts = get_effective_ts(p, d_data)
                    if eff_ts and eff_ts[:7] == this_month:
                        monthly_sales += float(p.get("amount", 0.0))

        stats = {
            "open": {
                "overdues": len([d for d in docs if d.get("follow_up_date") and d.get("follow_up_date") < target_date and d.get("status") not in ["converted", "dead"]]),
                "due_today": len([d for d in docs if d.get("follow_up_date") == target_date and d.get("status") not in ["converted", "dead"]]),
                "total_assigned": len(docs),
                "opportunities": len([d for d in docs if d.get("grade") in ["Hot", "Warm"] and d.get("status") not in ["converted", "dead"]]),
                "todays_sales": round(period_sales, 2), 
            },
            "periodic": {
                "leads": len([d for d in docs if is_in(d.get("created_at"), p_start, p_end)]),
                "calls_made": 0,
                "activities_completed": 0,
                "messages_sent": 0,
                "sales": round(period_sales, 2)
            },
            "result": {
                "converted": len([d for d in docs if check_result(d, ["converted", "closed"])]),
                "token_received": len([d for d in docs if check_result(d, ["token received"])]),
                "visited": len([d for d in docs if check_result(d, ["visited"])]),
                "recycled": len([d for d in docs if check_result(d, ["recycled"])]),
                "dead": len([d for d in docs if check_result(d, ["dead"])]),
                "closed_won": len([d for d in docs if check_result(d, ["converted", "closed"]) and d.get("grade") in ["Hot", "Warm"]]),
                "on_hold": len([d for d in docs if check_result(d, ["in process"]) and d.get("grade") == "Cold"]),
                "closed_lost": len([d for d in docs if check_result(d, ["dead"]) and d.get("grade") in ["Hot", "Warm"]]),
                "monthly_sales": round(monthly_sales, 2),
                "monthly_target": user.get("monthly_target", 100000.0)
            }
        }
        return stats
    except Exception as e:
        print(f"Error in get_sales_dashboard: {e}")
        return {
            "open": {"overdues": 0, "due_today": 0, "total_assigned": 0, "opportunities": 0},
            "periodic": {"leads": 0, "calls_made": 0, "activities_completed": 0, "messages_sent": 0, "sales": 0},
            "result": {"converted": 0, "token_received": 0, "visited": 0, "recycled": 0, "dead": 0, "closed_won": 0, "on_hold": 0, "closed_lost": 0, "monthly_sales": 0, "monthly_target": 100000.0}
        }

@router.delete("/leads/{lid}")
def delete_lead(lid: str, user: dict = Depends(require_employee)):
    # You might want to restrict this to admins or allow anyone in sales to delete
    res = supabase.table("leads").delete().eq("id", lid).execute()
    return {"ok": True}


@router.delete("/leads/{lid}/payments/{payment_ts}")
def delete_payment(lid: str, payment_ts: str, user: dict = Depends(require_employee)):
    res = supabase.table("leads").select("*").eq("id", lid).execute()
    if not res.data:
        raise HTTPException(404, "Lead not found")
        
    lead_dict = res.data[0]
    existing_data = lead_dict.get("data") or {}
    payments = existing_data.get("payments") or []
    
    # Filter out the payment with the matching timestamp
    new_payments = [p for p in payments if p.get("timestamp") != payment_ts]
    
    if len(new_payments) == len(payments):
        raise HTTPException(404, "Payment not found")
        
    existing_data["payments"] = new_payments
    existing_data["total_sale_amount"] = sum([float(p.get("amount", 0)) for p in new_payments])
    
    update_data = {
        "data": existing_data,
        "updated_at": now_iso()
    }
    
    supabase.table("leads").update(update_data).eq("id", lid).execute()
    
    return {"message": "Payment deleted successfully"}
