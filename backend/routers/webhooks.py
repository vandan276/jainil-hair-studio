from fastapi import APIRouter, Request, HTTPException
import time
from datetime import datetime, timezone, timedelta
from ..db import supabase
from ..utils import new_id, now_iso, unpack_data

router = APIRouter(tags=["webhooks"])

def get_next_salesperson():
    res = supabase.table("users").select("*").eq("role", "sales").execute()
    sales_users = res.data
    if not sales_users:
        return None
        
    ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    today_str = ist_now.strftime("%Y-%m-%d")
    
    available = []
    for u in sales_users:
        # Check if active and not on leave
        if u.get("is_active") is not False:
            leaves = []
            if "leaves" in u and u["leaves"]:
                leaves = u["leaves"]
            if today_str not in leaves:
                available.append(u)
                
    if not available:
        available = [u for u in sales_users if u.get("is_active") is not False]
        
    if not available:
        return None
        
    # Read state
    state_res = supabase.table("settings").select("data").eq("id", "round_robin").execute()
    state = state_res.data[0].get("data") if state_res.data else {}
    last_idx = state.get("last_sales_index", -1)
    
    next_idx = (last_idx + 1) % len(available)
    assigned = available[next_idx]
    
    # Update state
    state["last_sales_index"] = next_idx
    if state_res.data:
        supabase.table("settings").update({"data": state}).eq("id", "round_robin").execute()
    else:
        supabase.table("settings").insert({"id": "round_robin", "data": state}).execute()
        
    return assigned

def find_existing_lead(phone: str):
    if not phone: return None
    phone_str = str(phone).strip()
    clean_digits = "".join(filter(str.isdigit, phone_str))
    if not clean_digits or len(clean_digits) < 5: return None
    
    variations = set([phone_str, clean_digits, f"+{clean_digits}"])
    if len(clean_digits) >= 10:
        last10 = clean_digits[-10:]
        variations.update([
            last10, f"+91{last10}", f"91{last10}", f"+{last10}", f"0{last10}",
            f"+91 {last10}", f"+91-{last10}", f"{last10[:5]} {last10[5:]}",
            f"+91 {last10[:5]} {last10[5:]}", f"91 {last10}",
            f"0{last10[:5]} {last10[5:]}", f"0{last10[:5]}-{last10[5:]}",
        ])
    else:
        variations.update([clean_digits, f"+{clean_digits}"])
        
    var_list = list(variations)
    
    # Supabase allows 'in' filtering
    # Phone match
    res = supabase.table("leads").select("*").in_("phone", var_list).limit(1).execute()
    if res.data:
        return res.data[0]
        
    # Secondary phone match
    res = supabase.table("leads").select("*").in_("secondary_phone", var_list).limit(1).execute()
    if res.data:
        return res.data[0]
        
    return None

@router.get("/webhooks/whatsapp")
def whatsapp_verify():
    return {"status": "ok"}

@router.post("/webhooks/whatsapp")
async def whatsapp_webhook(request: Request):
    try:
        data = await request.json()
    except:
        return {"status": "error", "message": "Invalid JSON"}
        
    # 1. Handle Make.com / Bot / Direct JSON Format
    if "phone" in data or "customer_phone" in data or "mobile" in data or "from" in data:
        phone = str(data.get("phone") or data.get("customer_phone") or data.get("mobile") or data.get("from"))
        name = data.get("name") or data.get("full_name") or data.get("customer_name") or "WhatsApp Lead"
        message_text = data.get("message") or data.get("text") or data.get("body") or data.get("last_message") or ""
        source = data.get("source") or "WhatsApp"
        campaign = data.get("campaign") or "Make.com Flow"
        branch_pref = data.get("branch")
        section_pref = data.get("section")
        
        existing_doc = find_existing_lead(phone)
        if not existing_doc:
            next_sales = get_next_salesperson()
            assigned_to = next_sales["id"] if next_sales else None
            assigned_to_name = next_sales["name"] if next_sales else None
            branch = branch_pref or (next_sales.get("branch") if next_sales else None) or "Baroda"
            section = section_pref or (next_sales.get("section") if next_sales else None) or "Men"
            
            init_note = f"SYSTEM: New lead captured via WhatsApp ({source}). Campaign: {campaign}."
            if message_text: init_note += f" Message: {message_text}"
            init_note += f" Assigned to {assigned_to_name or 'Unassigned'}."

            lid = new_id()
            doc = {
                "id": lid,
                "lead_number": f"LD-WA-{int(time.time())}",
                "name": name,
                "phone": phone if phone.startswith("+") else f"+{phone}",
                "branch": branch,
                "section": section,
                "source": source,
                "campaign": campaign,
                "status": "new",
                "grade": "Hot",
                "assigned_to": assigned_to,
                "assigned_to_name": assigned_to_name,
                "notes": [{"text": init_note, "author": "System", "timestamp": now_iso()}],
                "created_by": "WhatsApp",
                "created_at": now_iso(),
                "updated_at": now_iso()
            }
            supabase.table("leads").insert(doc).execute()
            return {"status": "success", "action": "created", "lead_id": lid}
        else:
            lead_id = existing_doc["id"]
            
            note_content = f"SYSTEM: Customer sent a WhatsApp message: {message_text}" if message_text else "SYSTEM: Customer messaged again on WhatsApp."
            note = {
                "text": note_content,
                "author": "WhatsApp",
                "timestamp": now_iso()
            }
            
            notes = existing_doc.get("notes") or []
            notes.append(note)
            
            update_payload = {
                "updated_at": now_iso(),
                "notes": notes
            }
            
            if not existing_doc.get("assigned_to"):
                next_sales = get_next_salesperson()
                if next_sales:
                    update_payload["assigned_to"] = next_sales["id"]
                    update_payload["assigned_to_name"] = next_sales["name"]
            
            supabase.table("leads").update(update_payload).eq("id", lead_id).execute()
            return {"status": "updated", "action": "message_appended", "lead_id": lead_id}
            
    return {"status": "ignored", "message": "Payload format not recognized"}
