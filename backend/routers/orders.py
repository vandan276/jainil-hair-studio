from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import io

from ..db import supabase
from ..utils import new_id, now_iso, get_current_user, require_employee, require_admin, unpack_data

router = APIRouter(tags=["orders_bookings"])

class BookingIn(BaseModel):
    service_id: str
    stylist_id: Optional[str] = None
    date: str
    time: str
    notes: Optional[str] = ""

class CartItem(BaseModel):
    product_id: str
    quantity: int
    package_id: Optional[str] = None
    service_provider: Optional[str] = None
    discount: Optional[float] = 0.0

class OrderIn(BaseModel):
    items: List[CartItem]
    full_name: str
    phone: str
    address: str
    city: str = "Vadodara"
    pincode: str
    notes: Optional[str] = ""
    payment_method: Optional[str] = None
    discount: Optional[float] = 0.0
    branch: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

# ----- BOOKINGS -----

@router.get("/bookings")
def get_bookings(user: dict = Depends(get_current_user)):
    if user.get("role") in ["admin", "receptionist"]:
        res = supabase.table("bookings").select("*").execute()
    else:
        res = supabase.table("bookings").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
    return res.data

@router.post("/bookings")
def create_booking(data: BookingIn, user: dict = Depends(get_current_user)):
    bid = new_id()
    doc = {
        "id": bid,
        "user_id": user["id"],
        "user_name": user.get("name"),
        "service_id": data.service_id,
        "stylist_id": data.stylist_id,
        "date": data.date,
        "time": data.time,
        "notes": data.notes,
        "status": "pending",
        "created_at": now_iso()
    }
    
    # Conflict check
    if data.stylist_id:
        conflict = supabase.table("bookings").select("id") \
            .eq("stylist_id", data.stylist_id) \
            .eq("date", data.date) \
            .eq("time", data.time) \
            .execute()
        if conflict.data:
            raise HTTPException(400, "Stylist is already booked at this time")
            
    supabase.table("bookings").insert(doc).execute()
    return doc

@router.patch("/bookings/{bid}/status")
def update_booking_status(bid: str, data: StatusUpdate, user: dict = Depends(require_employee)):
    res = supabase.table("bookings").select("id").eq("id", bid).execute()
    if not res.data:
        raise HTTPException(404, "Booking not found")
        
    supabase.table("bookings").update({"status": data.status, "updated_at": now_iso()}).eq("id", bid).execute()
    return {"ok": True, "status": data.status}

# ----- ORDERS -----

@router.post("/orders")
async def create_order(request: Request, user: dict = Depends(get_current_user)):
    try:
        data = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON")
        
    try:
        oid = new_id()
        
        # Store everything in order_data
        doc = {
            "id": oid,
            "phone": data.get("phone"),
            "total_amount": float(data.get("total", 0) or 0),
            "status": data.get("status", "pending"),
            "created_at": data.get("created_at") or now_iso(),
            "updated_at": data.get("created_at") or now_iso(),
            "order_data": data
        }
        supabase.table("orders").insert(doc).execute()
        
        # Decrement stock for products
        items = data.get("items", [])
        for item in items:
            if not item.get("package_id"):
                prod_id = item.get("product_id") or item.get("item_id")
                qty = int(item.get("quantity") or item.get("qty") or 1)
                if prod_id:
                    prod_res = supabase.table("products").select("stock").eq("id", prod_id).execute()
                    if prod_res.data:
                        current_stock = prod_res.data[0].get("stock")
                        if current_stock is not None:
                            new_stock = max(0, int(current_stock) - qty)
                            supabase.table("products").update({"stock": new_stock}).eq("id", prod_id).execute()
                        
        return {"id": oid, "order_id": oid, **doc}
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        try:
            supabase.table("leads").insert({"phone": "+9999999999", "name": "ERROR_LOG", "wallet": 0, "data": {"error": err_msg}}).execute()
        except:
            pass
        raise HTTPException(500, detail=f"Server error: {str(e)}")

@router.get("/orders")
def get_orders(user: dict = Depends(get_current_user)):
    if user.get("role") in ["admin", "receptionist", "sales"]:
        res = supabase.table("orders").select("*").order("created_at", desc=True).limit(500).execute()
    else:
        res = supabase.table("orders").select("*").eq("user_id", user["id"]).order("created_at", desc=True).limit(100).execute()
    return unpack_data(res.data, "order_data")

@router.patch("/orders/{oid}/status")
def update_order_status(oid: str, data: StatusUpdate, user: dict = Depends(require_employee)):
    res = supabase.table("orders").select("id").eq("id", oid).execute()
    if not res.data:
        raise HTTPException(404, "Order not found")
        
    supabase.table("orders").update({"status": data.status, "updated_at": now_iso()}).eq("id", oid).execute()
    return {"ok": True, "status": data.status}

@router.get("/orders/{oid}/invoice")
def download_invoice(oid: str, user: dict = Depends(get_current_user)):
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import mm
    from io import BytesIO
    from datetime import datetime, timezone, timedelta
    from fastapi.responses import StreamingResponse

    res = supabase.table("orders").select("*").eq("id", oid).execute()
    if not res.data:
        raise HTTPException(404, "Order not found")

    row = res.data[0]
    od = row.get("order_data") or {}

    # Fetch all employees/stylists to map IDs to names
    employees_map = {}
    try:
        emp_res = supabase.table("users").select("id, name, branch").in_("role", ["sales", "service", "employee", "admin", "receptionist", "provider"]).execute()
        for d in emp_res.data:
            employees_map[d["id"]] = d.get("name", "")
    except Exception as e:
        print("Error fetching employees map:", e)

    # Resolve customer wallet balance by looking up lead
    phone = od.get("phone", row.get("phone", ""))
    lead_wallet = 0.0
    if phone:
        clean_phone = phone
        if not clean_phone.startswith("+"):
            clean_phone = "+" + clean_phone
        leads_res = supabase.table("leads").select("wallet, data").eq("phone", clean_phone).limit(1).execute()
        if not leads_res.data:
            leads_res = supabase.table("leads").select("wallet, data").eq("phone", phone).limit(1).execute()
        if leads_res.data:
            lead_data = leads_res.data[0].get("data") or {}
            lead_wallet = float(leads_res.data[0].get("wallet") or lead_data.get("wallet", 0.0))

    phone_number = phone
    if phone_number.startswith("+91"):
        phone_number = phone_number[3:]

    # Resolve branch name
    branch_name = od.get("branch", "Subhanpura")
    branch_contact = "7405088809"
    if branch_name.lower() == "surat":
        branch_contact = "8799288809"

    # Invoice sequence number formatting (E.g. 0948/B2C/26-27)
    try:
        hex_val = int(oid.replace("-", "")[:8], 16)
        serial = str(hex_val % 10000).zfill(4)
    except:
        serial = "0001"

    created_str = row.get("created_at", "")
    dt = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    if created_str:
        try:
            dt = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
            ist = timezone(timedelta(hours=5, minutes=30))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            dt = dt.astimezone(ist)
        except:
            pass

    year = dt.year
    if dt.month >= 4:
        fy_start = str(year)[2:]
        fy_end = str(year + 1)[2:]
    else:
        fy_start = str(year - 1)[2:]
        fy_end = str(year)[2:]
    fy_str = f"{fy_start}-{fy_end}"
    invoice_no = f"{serial}/B2C/{fy_str}"
    invoice_date = dt.strftime("%d-%m-%Y %I:%M %p")

    # Math calculations
    items = od.get("items", [])
    subtotal_before_tax_and_disc = 0
    for it in items:
        p = float(it.get("price", 0))
        q = float(it.get("quantity", it.get("qty", 1)))
        subtotal_before_tax_and_disc += (p * q)
        
    point_discount = float(od.get("discount", 0.0))
    grand_total = float(od.get("total", row.get("total_amount", 0.0)))

    # Amount Paid and Due
    total_paid = 0.0
    split_payments = od.get("split_payments", [])
    if split_payments:
        total_paid = sum(float(p.get("amount", 0.0)) for p in split_payments)
    else:
        total_paid = grand_total
    amount_due = max(0.0, grand_total - total_paid)

    # Dynamic page height calculation based on item name and provider text lengths
    def wrap_text(text, max_chars):
        if not text:
            return [""]
        words = text.split()
        lines = []
        curr_line = ""
        for w in words:
            if len(curr_line) + len(w) + 1 <= max_chars:
                curr_line = curr_line + (" " if curr_line else "") + w
            else:
                lines.append(curr_line)
                curr_line = w
        if curr_line:
            lines.append(curr_line)
        return lines

    # Calculate height contribution of rows
    row_heights_sum = 0
    for it in items:
        name_lines = len(wrap_text(it.get("name", ""), 18))
        providers = []
        p1 = it.get("service_provider")
        p2 = it.get("service_provider_2")
        if p1: providers.append(employees_map.get(p1, p1))
        if p2: providers.append(employees_map.get(p2, p2))
        for extra_id in it.get("extra_providers", []):
            if extra_id: providers.append(employees_map.get(extra_id, extra_id))
        provider_name = ", ".join(providers) if providers else "—"
        provider_lines = len(wrap_text(provider_name, 14))
        num_lines = max(name_lines, provider_lines)
        row_heights_sum += num_lines * 9 + 4

    page_width = 280
    page_height = 360 + row_heights_sum

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=(page_width, page_height))

    # Helper function for drawing dashed separators
    def draw_dashed_line(y_pos):
        c.setLineWidth(0.5)
        c.setStrokeColorRGB(0.5, 0.5, 0.5)
        c.setDash(2, 2)
        c.line(12, y_pos, page_width - 12, y_pos)
        c.setDash()

    # ── HEADER (Centered) ──────────────────────────────────────────────────
    c.setFont("Helvetica", 7.5)
    c.setFillColorRGB(0.1, 0.1, 0.1)
    header_lines = [
        "GF-7 SHRINATH COMPLEX, NR RELIANCE",
        "PETROL PUMP, HIGH TENSION ROAD,",
        "SUBHANPURA VADODARA",
        f"Contact : {branch_contact}",
        "Email : info@jainilhairstudio.com",
        "Website : jainil-hair-studio.vercel.app",
        "GST No : 24AGAPV1520E1ZX"
    ]
    hy = page_height - 15
    for line in header_lines:
        c.drawCentredString(page_width / 2, hy, line)
        hy -= 10

    hy -= 4
    c.setFont("Helvetica-Bold", 10.5)
    c.drawCentredString(page_width / 2, hy, "SALES INVOICE")
    hy -= 11
    c.setFont("Helvetica", 8)
    c.drawCentredString(page_width / 2, hy, f"(Branch : {branch_name})")

    # ── CUSTOMER DETAILS ───────────────────────────────────────────────────
    y = page_height - 120
    c.setFont("Helvetica", 8)

    c.drawString(12, y, "Customer Name")
    c.drawString(90, y, ": " + str(od.get("full_name", row.get("user_name", "—"))))
    y -= 11

    c.drawString(12, y, "Mobile No")
    c.drawString(90, y, ": " + str(phone_number))
    y -= 11

    c.drawString(12, y, "Wallet Balance")
    c.drawString(90, y, f": INR {lead_wallet:.2f} /-")
    y -= 11

    c.drawString(12, y, "Invoice No")
    c.drawString(90, y, ": " + invoice_no)
    y -= 11

    c.drawString(12, y, "Invoice Date")
    c.drawString(90, y, ": " + invoice_date)
    y -= 10

    # Separator
    draw_dashed_line(y)

    # ── TABLE HEADERS ──────────────────────────────────────────────────────
    y -= 10
    c.setFont("Helvetica-Bold", 8)
    c.drawString(12, y, "Service &")
    c.drawString(100, y, "Provider")
    c.drawRightString(200, y, "Rate")
    c.drawRightString(224, y, "Dis")
    c.drawRightString(242, y, "Qty")
    c.drawRightString(268, y, "Total")

    y -= 9
    c.drawString(12, y, "Product")
    y -= 4

    draw_dashed_line(y)

    # ── TABLE ROWS ─────────────────────────────────────────────────────────
    y -= 2
    c.setFont("Helvetica", 7.5)
    for it in items:
        name_lines = wrap_text(it.get("name", ""), 18)
        providers = []
        p1 = it.get("service_provider")
        p2 = it.get("service_provider_2")
        if p1: providers.append(employees_map.get(p1, p1))
        if p2: providers.append(employees_map.get(p2, p2))
        for extra_id in it.get("extra_providers", []):
            if extra_id: providers.append(employees_map.get(extra_id, extra_id))
        provider_name = ", ".join(providers) if providers else "—"
        provider_lines = wrap_text(provider_name, 14)

        num_lines = max(len(name_lines), len(provider_lines))
        row_h = num_lines * 9 + 4

        # Draw names
        ny = y - 8
        for line in name_lines:
            c.drawString(12, ny, line)
            ny -= 9
        # Draw providers
        py = y - 8
        for line in provider_lines:
            c.drawString(100, py, line)
            py -= 9

        # Draw values
        price = float(it.get("price", 0))
        disc_raw = float(it.get("discount", 0))
        qty = float(it.get("quantity", it.get("qty", 1)))
        disc_type = it.get("discount_type", "INR")
        
        line_total_base = price * qty
        disc = (line_total_base * disc_raw / 100) if disc_type == "%" else disc_raw
        total_val = max(0, line_total_base - disc)

        c.drawRightString(200, y - 8, f"{price:.2f}")
        c.drawRightString(224, y - 8, f"{disc:.0f}" if disc == int(disc) else f"{disc:.2f}")
        c.drawRightString(242, y - 8, f"{qty:.0f}" if qty == int(qty) else f"{qty:.2f}")
        c.drawRightString(268, y - 8, f"{total_val:.2f}")

        y -= row_h

    # Separator
    draw_dashed_line(y)

    # ── TOTALS & SUMMARY BLOCK ─────────────────────────────────────────────
    # Left Details
    ly = y - 10
    c.setFont("Helvetica", 7.5)
    total_qty = sum(float(it.get("quantity", it.get("qty", 1))) for it in items)
    c.drawString(12, ly, f"Total Qty      : {total_qty:.0f}" if total_qty == int(total_qty) else f"Total Qty      : {total_qty:.2f}")
    ly -= 11
    c.drawString(12, ly, "Payment Mode :")
    ly -= 10

    pay_method = od.get("payment_method", "Cash")
    if split_payments:
        pay_method = ", ".join([p.get("method", "Cash") for p in split_payments])

    pay_lines = wrap_text(pay_method, 16)
    for line in pay_lines:
        c.drawString(12, ly, line)
        ly -= 9

    # Right Details
    ry = y - 10
    def draw_summary_row(label, val_str, bold=False):
        nonlocal ry
        if bold:
            c.setFont("Helvetica-Bold", 7.5)
        else:
            c.setFont("Helvetica", 7.5)
        c.drawRightString(215, ry, label)
        c.drawRightString(268, ry, val_str)
        ry -= 10.5

    draw_summary_row("Subtotal :", f"{subtotal_before_tax_and_disc:.2f}")
    if point_discount > 0:
        draw_summary_row("Discount :", f"{point_discount:.2f}")
    draw_summary_row("Total :", f"{grand_total:.2f}", bold=True)
    draw_summary_row("Amount Paid :", f"{total_paid:.2f}")
    if amount_due > 0:
        draw_summary_row("Amount Due :", f"{amount_due:.2f}", bold=True)

    # Dashed separator at bottom
    fy = min(ly, ry) - 6
    draw_dashed_line(fy)

    # Footer Centered Note
    fy -= 12
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(page_width / 2, fy, "****THANK YOU. PLEASE VISIT AGAIN****")

    c.save()
    buffer.seek(0)
    
    inv_id_hex = oid.replace("-", "")[:8].upper()
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="Jainil_Invoice_{inv_id_hex}.pdf"'}
    )
