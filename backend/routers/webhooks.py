import re
import asyncio
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import PlainTextResponse
import time
from datetime import datetime, timezone, timedelta
from ..db import supabase
from ..utils import new_id, now_iso, unpack_data

router = APIRouter(tags=["webhooks"])

# In-memory lock per phone number to serialize rapid concurrent webhooks
_phone_locks = {}
_locks_mutex = asyncio.Lock()

async def get_phone_lock(key: str) -> asyncio.Lock:
    async with _locks_mutex:
        if key not in _phone_locks:
            _phone_locks[key] = asyncio.Lock()
        return _phone_locks[key]

def get_next_salesperson():
    res = supabase.table("users").select("*").eq("role", "sales").order("id").execute()
    sales_users = res.data or []
    if not sales_users:
        return None

    # Attach employee metadata (is_active, leaves, branch, section)
    try:
        meta_res = supabase.table("settings").select("*").like("id", "emp_meta_%").execute()
        meta_map = {m["id"].replace("emp_meta_", ""): m.get("data", {}) for m in (meta_res.data or [])}
        for u in sales_users:
            u.update(meta_map.get(u["id"], {}))
    except Exception:
        pass

    ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    today_str = ist_now.strftime("%Y-%m-%d")

    available = []
    for u in sales_users:
        # Check if active and not on leave today
        if u.get("is_active") is not False:
            leaves = u.get("leaves") or []
            if today_str not in leaves:
                available.append(u)

    if not available:
        available = [u for u in sales_users if u.get("is_active") is not False]

    if not available:
        available = sales_users

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

def normalize_phone(phone: str):
    """Normalizes any phone string into (clean_digits, last10, formatted_phone)."""
    if not phone:
        return "", "", ""
    raw = str(phone).strip()
    # Strip WhatsApp specific suffixes and prefixes
    raw = re.sub(r"@.*$", "", raw)
    raw = re.sub(r"^whatsapp:", "", raw, flags=re.IGNORECASE)
    clean_digits = re.sub(r"\D", "", raw)
    if not clean_digits or len(clean_digits) < 5:
        return "", "", ""

    if len(clean_digits) == 10:
        last10 = clean_digits
        formatted = f"+91{last10}"
    elif len(clean_digits) == 12 and clean_digits.startswith("91"):
        last10 = clean_digits[2:]
        formatted = f"+91{last10}"
    elif len(clean_digits) == 11 and clean_digits.startswith("0"):
        last10 = clean_digits[1:]
        formatted = f"+91{last10}"
    elif len(clean_digits) > 10:
        last10 = clean_digits[-10:]
        formatted = f"+{clean_digits}"
    else:
        last10 = clean_digits
        formatted = f"+{clean_digits}"

    return clean_digits, last10, formatted

def find_existing_lead(phone: str):
    """Finds an existing lead regardless of formatting (spaces, country code, hyphens, etc.)."""
    if not phone:
        return None
    clean_digits, last10, formatted = normalize_phone(phone)
    if not clean_digits:
        return None

    # Strategy 1: Wildcard ILIKE query across phone column
    # Matches spaced numbers like "12345 67890", "+91 12345 67890", "12345-67890", trailing spaces, etc.
    patterns = []
    if len(last10) == 10:
        patterns.append(f"phone.ilike.%{last10[:5]}%{last10[5:]}%")
        patterns.append(f"phone.ilike.%{last10}%")
    else:
        patterns.append(f"phone.ilike.%{clean_digits}%")

    or_filter = ",".join(patterns)
    try:
        res = (
            supabase.table("leads")
            .select("*")
            .or_(or_filter)
            .order("created_at", desc=False)
            .limit(10)
            .execute()
        )
        candidates = res.data or []
        for c in candidates:
            c_phone = re.sub(r"\D", "", str(c.get("phone") or ""))
            if len(last10) == 10:
                if len(c_phone) >= 10 and c_phone[-10:] == last10:
                    return c
            else:
                if c_phone == clean_digits or c_phone.endswith(clean_digits) or clean_digits.endswith(c_phone):
                    return c
    except Exception as e:
        print(f"Error querying candidate leads by ilike: {e}")

    # Strategy 2: Direct variations match (in_ filter)
    variations = [str(phone).strip(), clean_digits, formatted]
    if len(last10) == 10:
        variations.extend([
            last10, f"+91{last10}", f"91{last10}", f"0{last10}",
            f"{last10[:5]} {last10[5:]}", f"+91 {last10[:5]} {last10[5:]}"
        ])
    try:
        res2 = (
            supabase.table("leads")
            .select("*")
            .in_("phone", list(set(variations)))
            .order("created_at", desc=False)
            .limit(5)
            .execute()
        )
        if res2.data:
            return res2.data[0]
    except Exception as e:
        pass

    return None

def extract_contact_info(data: dict):
    """Extracts phone, name, and message from various webhook payload structures."""
    if not isinstance(data, dict):
        return None, None, None, None, None, None, None

    phone = None
    name = None
    message_text = ""
    source = data.get("source") or "WhatsApp"
    campaign = data.get("campaign") or "Make.com Flow"
    branch_pref = data.get("branch")
    section_pref = data.get("section")

    # Check Meta WhatsApp Cloud API format:
    if "entry" in data and isinstance(data["entry"], list) and len(data["entry"]) > 0:
        entry = data["entry"][0]
        changes = entry.get("changes", [])
        if changes and isinstance(changes, list) and len(changes) > 0:
            val = changes[0].get("value", {})
            messages = val.get("messages", [])
            if messages and isinstance(messages, list) and len(messages) > 0:
                msg = messages[0]
                phone = msg.get("from")
                if msg.get("type") == "text":
                    message_text = msg.get("text", {}).get("body", "")
                elif msg.get("type") == "image":
                    message_text = "[image]"
                elif msg.get("type"):
                    message_text = f"[{msg.get('type')}]"
            contacts = val.get("contacts", [])
            if contacts and isinstance(contacts, list) and len(contacts) > 0:
                profile = contacts[0].get("profile", {})
                name = profile.get("name")
                if not phone:
                    phone = contacts[0].get("wa_id")

    # Check nested dictionary structures:
    if not phone:
        for nested_key in ["contact", "data", "lead", "customer", "body"]:
            if nested_key in data and isinstance(data[nested_key], dict):
                sub = data[nested_key]
                if not phone:
                    phone = (
                        sub.get("phone") or sub.get("phone_number") or sub.get("customer_phone") or
                        sub.get("mobile") or sub.get("wa_id") or sub.get("number")
                    )
                if not name:
                    name = sub.get("name") or sub.get("full_name") or sub.get("customer_name")
                if not message_text:
                    message_text = sub.get("message") or sub.get("text") or sub.get("body")

    # Check flat root-level keys:
    if not phone:
        phone = (
            data.get("phone") or 
            data.get("phone_number") or 
            data.get("customer_phone") or 
            data.get("mobile") or 
            data.get("from") or 
            data.get("wa_id") or 
            data.get("number") or 
            data.get("sender") or 
            data.get("contact_number") or 
            data.get("chatId") or 
            data.get("chat_id")
        )

    if not name:
        name = (
            data.get("name") or 
            data.get("full_name") or 
            data.get("customer_name") or 
            data.get("sender_name") or 
            data.get("profile_name")
        )

    if not message_text:
        message_text = (
            data.get("message") or 
            data.get("text") or 
            data.get("body") or 
            data.get("last_message") or 
            data.get("msg") or 
            ""
        )

    if phone:
        phone = str(phone).strip()

    return phone, name, message_text, source, campaign, branch_pref, section_pref

@router.get("/webhooks/whatsapp")
@router.get("/api/webhooks/whatsapp")
def whatsapp_verify(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    if mode and token and challenge:
        return PlainTextResponse(challenge)
    return {"status": "ok"}

@router.post("/webhooks/whatsapp")
@router.post("/api/webhooks/whatsapp")
async def whatsapp_webhook(request: Request):
    data = {}
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            data = await request.json()
        except Exception:
            return {"status": "error", "message": "Invalid JSON"}
    else:
        try:
            data = await request.json()
        except Exception:
            try:
                form = await request.form()
                data = dict(form)
            except Exception:
                return {"status": "error", "message": "Could not parse payload"}

    phone, name, message_text, source, campaign, branch_pref, section_pref = extract_contact_info(data)
    if not phone:
        return {"status": "ignored", "message": "No valid phone number found in payload"}

    clean_digits, last10, formatted_phone = normalize_phone(phone)
    if not clean_digits:
        return {"status": "error", "message": "Invalid phone number format"}

    phone_key = last10 if len(last10) == 10 else clean_digits
    lock = await get_phone_lock(phone_key)

    async with lock:
        # Check if lead already exists in DB
        existing_doc = find_existing_lead(phone)

        # Cross-instance concurrency guard using settings table for serverless / multi-worker setups
        lock_id = f"lead_create_lock_{phone_key}"
        acquired_db_lock = False

        if not existing_doc:
            try:
                supabase.table("settings").insert({
                    "id": lock_id,
                    "data": {"created_at": now_iso()}
                }).execute()
                acquired_db_lock = True
            except Exception:
                # Another process/worker is creating this lead right now!
                # Wait for the other worker to finish writing the lead to the DB
                for _ in range(5):
                    await asyncio.sleep(0.5)
                    existing_doc = find_existing_lead(phone)
                    if existing_doc:
                        break

        try:
            if not existing_doc:
                # Definitely a new customer! Create the lead
                next_sales = get_next_salesperson()
                assigned_to = next_sales["id"] if next_sales else None
                assigned_to_name = next_sales["name"] if next_sales else None
                branch = branch_pref or (next_sales.get("branch") if next_sales else None) or "Baroda"
                section = section_pref or (next_sales.get("section") if next_sales else None) or "Men"

                init_note = f"SYSTEM: New lead captured via WhatsApp ({source}). Campaign: {campaign}."
                if message_text:
                    init_note += f" Message: {message_text}"
                init_note += f" Assigned to {assigned_to_name or 'Unassigned'}."

                display_name = name or formatted_phone
                lid = new_id()
                doc = {
                    "id": lid,
                    "lead_number": f"LD-WA-{int(time.time())}",
                    "name": display_name,
                    "phone": formatted_phone,
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
                # Existing lead found! Update the existing lead with the new WhatsApp message
                lead_id = existing_doc["id"]

                note_content = (
                    f"SYSTEM: Customer sent a WhatsApp message: {message_text}"
                    if message_text
                    else "SYSTEM: Customer messaged again on WhatsApp."
                )
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

                # If existing lead has placeholder/empty name, and bot provided a real name, update it!
                existing_name = str(existing_doc.get("name") or "").strip()
                if name and (
                    not existing_name
                    or existing_name.lower() in ["whatsapp lead", "unknown", "customer"]
                    or existing_name.isdigit()
                    or re.sub(r"\D", "", existing_name) == clean_digits
                ):
                    update_payload["name"] = name

                # If existing lead has unformatted phone or trailing space, normalize it
                if existing_doc.get("phone") != formatted_phone and not str(existing_doc.get("phone") or "").startswith("+"):
                    update_payload["phone"] = formatted_phone

                # If lead had no assigned salesperson, assign via round robin
                if not existing_doc.get("assigned_to"):
                    next_sales = get_next_salesperson()
                    if next_sales:
                        update_payload["assigned_to"] = next_sales["id"]
                        update_payload["assigned_to_name"] = next_sales["name"]

                supabase.table("leads").update(update_payload).eq("id", lead_id).execute()
                return {"status": "updated", "action": "message_appended", "lead_id": lead_id}

        finally:
            if acquired_db_lock:
                try:
                    supabase.table("settings").delete().eq("id", lock_id).execute()
                except Exception:
                    pass

