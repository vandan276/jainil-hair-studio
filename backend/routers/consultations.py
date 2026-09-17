from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel
from ..db import supabase
from ..utils import require_admin, require_employee, new_id, now_iso

router = APIRouter(tags=["consultations"])

@router.post("/consultations")
def create_consultation(data: dict, user: dict = Depends(require_employee)):
    cid = new_id()
    doc = {
        "id": cid,
        **data,
        "created_by": user.get("name"),
        "created_by_id": user.get("id"),
        "created_at": now_iso()
    }
    supabase.table("consultations").insert(doc).execute()
    
    # Update or create lead
    phone = data.get("phone", "")
    if phone and not phone.startswith("+"): phone = "+" + phone
    
    if phone:
        existing = supabase.table("leads").select("*").eq("phone", phone).limit(1).execute()
        
        note_text = f"Consultation Form Submitted.\nConsulted By: {data.get('consulted_by', '')}\nExpected Look: {data.get('expected_look', '')}\nBudget: {data.get('budget_range', '')}\nNotes: {data.get('notes', '')}"
        note = {"text": note_text, "author": user.get("name", "System"), "timestamp": now_iso()}
        
        if existing.data:
            lead = existing.data[0]
            current_notes = lead.get("notes") or []
            current_notes.append(note)
            supabase.table("leads").update({
                "notes": current_notes,
                "status": "visited",
                "grade": data.get("status", "Warm"),
                "updated_at": now_iso()
            }).eq("id", lead["id"]).execute()
        else:
            lid = new_id()
            lead_doc = {
                "id": lid,
                "name": data.get("name", "Unknown"),
                "phone": phone,
                "branch": data.get("location", "Baroda"),
                "section": "Men",
                "source": data.get("source", "Direct"),
                "campaign": "Consultation Form",
                "status": "visited",
                "grade": data.get("status", "Warm"),
                "notes": [note],
                "created_at": now_iso(),
                "updated_at": now_iso()
            }
            supabase.table("leads").insert(lead_doc).execute()
            
    return {"status": "success", "id": cid}

@router.get("/admin/consultations")
def admin_list_consultations(_: dict = Depends(require_admin)):
    try:
        res = supabase.table("consultations").select("*").order("created_at", desc=True).execute()
        return res.data
    except Exception:
        return []

@router.get("/consultations")
def list_consultations(_: dict = Depends(require_employee)):
    try:
        res = supabase.table("consultations").select("*").order("created_at", desc=True).execute()
        return res.data
    except Exception:
        return []

@router.patch("/admin/consultations/{cid}")
def admin_patch_consultation(cid: str, data: dict, user: dict = Depends(require_admin)):
    update_data = {
        **data,
        "updated_at": now_iso()
    }
    supabase.table("consultations").update(update_data).eq("id", cid).execute()
    return {"status": "success"}

@router.put("/consultations/{cid}")
def update_consultation(cid: str, data: dict, user: dict = Depends(require_employee)):
    update_data = {
        **data,
        "updated_by": user.get("name"),
        "updated_at": now_iso()
    }
    supabase.table("consultations").update(update_data).eq("id", cid).execute()
    return {"status": "success"}

@router.delete("/admin/consultations/{cid}")
def admin_delete_consultation(cid: str, user: dict = Depends(require_admin)):
    supabase.table("consultations").delete().eq("id", cid).execute()
    return {"status": "success"}

@router.delete("/consultations/{cid}")
def delete_consultation(cid: str, user: dict = Depends(require_employee)):
    supabase.table("consultations").delete().eq("id", cid).execute()
    return {"status": "success"}
