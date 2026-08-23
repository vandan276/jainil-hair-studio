@api.post("/admin/employees")
def create_employee(data: RegisterIn, user: dict = Depends(require_admin)):
    email = data.email.lower()
    docs = db.collection("users").where("email", "==", email).limit(1).get()
    if docs:
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
        "created_at": now_iso(),
    }
    db.collection("users").document(uid).set(user_doc)
    user_doc.pop("password_hash", None)
    return user_doc


# ----- Leads CRM -----
@api.post("/leads")
def create_lead(data: LeadIn, user: dict = Depends(require_employee)):
    lid = new_id()
    assigned_to = None
    assigned_to_name = None
    if user.get("role") == "sales":
        assigned_to = user["id"]
        assigned_to_name = user["name"]
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
        "notes": [{"text": data.notes, "author": user["name"], "timestamp": now_iso()}] if data.notes else [],
        "follow_up_date": None,
        "follow_up_time": None,
        "follow_up_type": None,
        "is_favorite": False,
        "created_by": "Manual",
        "created_at": now_iso(),
        "updated_at": now_iso()
    }
    db.collection("leads").document(lid).set(doc)
    return doc


@api.get("/leads")
def list_leads(user: dict = Depends(require_employee)):
    coll = db.collection("leads")
    
    if user["role"] == "sales":
        # Sales employees only see their explicitly assigned leads
        assigned_query = coll.where("assigned_to", "==", user["id"]).limit(1000).stream()
        return sorted([d.to_dict() for d in assigned_query], key=lambda x: x.get("created_at", ""), reverse=True)
    elif user["role"] in ["employee", "service", "receptionist"]:
        user_id = user["id"]
        user_branch = user.get("branch")
        user_section = user.get("section")
        
        # Firestore doesn't support OR natively across different fields easily without complex indexing
        # So we perform two queries and merge:
        
        # 1. Assigned to me
        assigned_query = coll.where("assigned_to", "==", user_id).limit(500).stream()
        assigned_leads = [d.to_dict() for d in assigned_query]
        
        # 2. Unassigned in my branch/section
        unassigned_query = coll.where("assigned_to", "==", None).where("branch", "==", user_branch).where("section", "==", user_section).limit(500).stream()
        unassigned_leads = [d.to_dict() for d in unassigned_query]

        # 3. Unassigned in my branch but section Not Decided
        not_decided_section_query = coll.where("assigned_to", "==", None).where("branch", "==", user_branch).where("section", "==", "Not Decided").limit(500).stream()
        not_decided_section_leads = [d.to_dict() for d in not_decided_section_query]

        # 4. Unassigned branch Not Decided
        not_decided_branch_query = coll.where("assigned_to", "==", None).where("branch", "==", "Not Decided").limit(500).stream()
        not_decided_branch_leads = [d.to_dict() for d in not_decided_branch_query]
        
        # Merge and deduplicate
        merged = {l["id"]: l for l in (assigned_leads + unassigned_leads + not_decided_section_leads + not_decided_branch_leads)}
        result = sorted(merged.values(), key=lambda x: x.get("created_at", ""), reverse=True)
        return result
    elif user["role"] == "admin":
        return [d.to_dict() for d in coll.order_by("created_at", direction="DESCENDING").limit(1000).stream()]
    else:
        return []


@api.get("/leads/{lid}")
def get_lead(lid: str, user: dict = Depends(require_employee)):
    doc = db.collection("leads").document(lid).get()
    if not doc.exists:
        raise HTTPException(404, "Lead not found")
    data = doc.to_dict()
    if user["role"] == "employee" and data.get("assigned_to") and data.get("assigned_to") != user["id"]:
        raise HTTPException(403, "Not assigned to this lead")
    return data


@api.patch("/leads/{lid}")
def update_lead(lid: str, data: LeadUpdate, user: dict = Depends(require_employee)):
    doc_ref = db.collection("leads").document(lid)
    if not doc_ref.get().exists:
        raise HTTPException(404, "Lead not found")
    
    update_data = {"updated_at": now_iso()}
    if data.status is not None: update_data["status"] = data.status
    if data.follow_up_date is not None: update_data["follow_up_date"] = data.follow_up_date
    if data.follow_up_time is not None: update_data["follow_up_time"] = data.follow_up_time
    if data.follow_up_type is not None: update_data["follow_up_type"] = data.follow_up_type
    if data.assigned_to is not None: update_data["assigned_to"] = data.assigned_to
    if data.grade is not None: update_data["grade"] = data.grade
    if data.is_favorite is not None: update_data["is_favorite"] = data.is_favorite
    if data.hair_condition is not None: update_data["hair_condition"] = data.hair_condition
    
    doc_ref.update(update_data)
    return doc_ref.get().to_dict()


@api.post("/leads/{lid}/notes")
def add_lead_note(lid: str, data: LeadNoteIn, user: dict = Depends(require_employee)):
    doc_ref = db.collection("leads").document(lid)
    if not doc_ref.get().exists:
        raise HTTPException(404, "Lead not found")
    
    note = {"text": data.text, "author": user["name"], "timestamp": now_iso()}
    doc_ref.update({"notes": firestore.ArrayUnion([note]), "updated_at": now_iso()})
    return {"ok": True, "note": note}


@api.patch("/leads/{lid}/assign")
def assign_lead(lid: str, data: LeadUpdate, user: dict = Depends(require_admin)):
    doc_ref = db.collection("leads").document(lid)
    if not doc_ref.get().exists:
        raise HTTPException(404, "Lead not found")
    
    assigned_to = data.assigned_to
    assigned_to_name = None
    if assigned_to:
        emp_doc = db.collection("users").document(assigned_to).get()
        if emp_doc.exists:
            assigned_to_name = emp_doc.to_dict().get("name")
            
    doc_ref.update({
        "assigned_to": assigned_to,
        "assigned_to_name": assigned_to_name,
        "updated_at": now_iso()
    })
    return doc_ref.get().to_dict()


# ----- Call Logs & Dashboard -----
@api.post("/leads/{lid}/calls")
def log_call(lid: str, data: CallLogIn, user: dict = Depends(require_employee)):
    doc_ref = db.collection("leads").document(lid)
    if not doc_ref.get().exists:
        raise HTTPException(404, "Lead not found")
        
    call_id = new_id()
    call_doc = {
        "id": call_id,
        "lead_id": lid,
        "user_id": user["id"],
        "duration": data.duration,
        "talk_time": data.talk_time,
        "outcome": data.outcome,
        "comment": data.comment or "",
        "timestamp": now_iso()
    }
    db.collection("calls").document(call_id).set(call_doc)
    
    # Auto update lead status based on outcome
    update_data = {"updated_at": now_iso()}
    
    if data.outcome == "Not Picked Up":
        update_data["status"] = "in process"
        # Optional: schedule callback reminder
    elif data.outcome in ["Said No", "Not Interested"]:
        update_data["status"] = "dead"
    elif data.outcome == "Picked Up":
        update_data["status"] = "in process"
        if data.grade: update_data["grade"] = data.grade
        if data.next_followup_date: update_data["follow_up_date"] = data.next_followup_date
        if data.next_followup_time: update_data["follow_up_time"] = data.next_followup_time
    
    # Add comment to history if provided
    if data.comment:
        note = {"text": f"Call Outcome: {data.outcome} - {data.comment}", "author": user["name"], "timestamp": now_iso()}
        update_data["notes"] = firestore.ArrayUnion([note])
        
    doc_ref.update(update_data)
    return {"ok": True, "call_id": call_id}


@api.get("/sales/dashboard")
def get_sales_dashboard(user: dict = Depends(require_employee)):
    coll = db.collection("leads")
    
    # Get relevant docs based on user role
    fields = ["created_at", "updated_at", "status", "grade", "follow_up_date", "payments", "assigned_to", "branch", "section"]
    if user["role"] == "sales":
        # Sales employees only see their explicitly assigned leads
        assigned_query = coll.where("assigned_to", "==", user["id"]).select(fields).limit(1000).stream()
        docs = [d.to_dict() for d in assigned_query]
    elif user["role"] in ["employee", "service", "receptionist"]:
        user_id = user["id"]
        user_branch = user.get("branch")
        user_section = user.get("section")
        
        assigned_query = coll.where("assigned_to", "==", user_id).select(fields).limit(500).stream()
        unassigned_query = coll.where("assigned_to", "==", None).where("branch", "==", user_branch).where("section", "==", user_section).select(fields).limit(300).stream()
        
        merged = {l.id: l.to_dict() for l in (list(assigned_query) + list(unassigned_query))}
        docs = list(merged.values())
    else:
        # Admin: Limit to recent docs
        docs = [d.to_dict() for d in coll.select(fields).order_by("created_at", direction="DESCENDING").limit(1000).stream()]
    
    today = now_iso()[:10]
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


# ----- Webhook -----
