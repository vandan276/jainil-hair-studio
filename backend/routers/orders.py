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
        traceback.print_exc()
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
    res = supabase.table("orders").select("*").eq("id", oid).execute()
    if not res.data:
        raise HTTPException(404, "Order not found")

    row = res.data[0]
    od = row.get("order_data") or {}

    full_name = od.get("full_name") or od.get("user_name") or "Client"
    phone = od.get("phone") or row.get("phone") or "—"
    branch = od.get("branch") or "Jainil Hair Studio"
    payment_method = od.get("payment_method") or "Cash"
    discount = float(od.get("discount") or 0)
    total = float(od.get("total") or row.get("total_amount") or 0)
    notes = od.get("notes") or ""
    items = od.get("items") or []
    split_payments = od.get("split_payments") or []
    created_at = row.get("created_at") or ""
    bill_date = created_at[:10] if created_at else "—"
    employee_name = od.get("employee_name") or "—"

    # ---- Build PDF with reportlab ----
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=15*mm, rightMargin=15*mm,
                            topMargin=15*mm, bottomMargin=15*mm)

    styles = getSampleStyleSheet()
    gold = colors.HexColor("#7B5B38")
    dark = colors.HexColor("#1A1A1A")
    light_gray = colors.HexColor("#F5F5F5")
    mid_gray = colors.HexColor("#888888")

    h1 = ParagraphStyle("h1", fontSize=22, textColor=gold, alignment=TA_CENTER, fontName="Helvetica-Bold", spaceAfter=2)
    h2 = ParagraphStyle("h2", fontSize=9, textColor=mid_gray, alignment=TA_CENTER, fontName="Helvetica", spaceAfter=6)
    label_s = ParagraphStyle("label", fontSize=8, textColor=mid_gray, fontName="Helvetica")
    val_s = ParagraphStyle("val", fontSize=10, textColor=dark, fontName="Helvetica-Bold")
    small_s = ParagraphStyle("small", fontSize=8, textColor=mid_gray, fontName="Helvetica")

    elems = []

    # Header
    elems.append(Paragraph("JAINIL HAIR STUDIO", h1))
    elems.append(Paragraph(f"{branch}  |  jainilhairstudio.com", h2))
    elems.append(HRFlowable(width="100%", thickness=1, color=gold, spaceAfter=8))

    # Invoice meta + client info side by side
    inv_id = oid[:8].upper()
    meta = [
        ["INVOICE", f"#{inv_id}"],
        ["DATE", bill_date],
        ["CLIENT", full_name],
        ["CONTACT", phone],
        ["SERVICED BY", employee_name],
    ]
    meta_table = Table(meta, colWidths=[35*mm, 80*mm])
    meta_table.setStyle(TableStyle([
        ("FONT", (0, 0), (0, -1), "Helvetica-Bold", 8),
        ("FONT", (1, 0), (1, -1), "Helvetica", 9),
        ("TEXTCOLOR", (0, 0), (0, -1), mid_gray),
        ("TEXTCOLOR", (1, 0), (1, -1), dark),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(meta_table)
    elems.append(Spacer(1, 6*mm))

    # Items table
    header_row = ["#", "Item / Service", "Qty", "Price", "Disc", "Total"]
    rows = [header_row]
    subtotal = 0
    for i, item in enumerate(items, 1):
        name = item.get("name") or item.get("item_name") or "—"
        qty = item.get("quantity") or item.get("qty") or 1
        price = float(item.get("price") or 0)
        disc_raw = float(item.get("discount") or 0)
        disc_type = item.get("discount_type") or "INR"
        line_total = price * qty
        disc_amt = (line_total * disc_raw / 100) if disc_type == "%" else disc_raw
        net = max(0, line_total - disc_amt)
        subtotal += net
        rows.append([
            str(i),
            name,
            str(qty),
            f"₹{price:.0f}",
            f"₹{disc_amt:.0f}" if disc_amt else "—",
            f"₹{net:.0f}",
        ])

    col_w = [10*mm, 80*mm, 15*mm, 25*mm, 20*mm, 25*mm]
    t = Table(rows, colWidths=col_w, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), gold),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, light_gray]),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#DDDDDD")),
        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
    ]))
    elems.append(t)
    elems.append(Spacer(1, 4*mm))

    # Totals block
    paid_total = sum(float(p.get("amount") or 0) for p in split_payments) if split_payments else total
    pending = max(0, total - paid_total)

    totals_data = [
        ["SUBTOTAL", f"₹{subtotal:.2f}"],
        ["DISCOUNT", f"- ₹{discount:.2f}"],
        ["TOTAL", f"₹{total:.2f}"],
        ["PAID", f"₹{paid_total:.2f}"],
        ["PENDING", f"₹{pending:.2f}"],
    ]
    totals_table = Table(totals_data, colWidths=[130*mm, 35*mm])
    totals_table.setStyle(TableStyle([
        ("FONT", (0, 0), (0, -1), "Helvetica", 9),
        ("FONT", (1, 0), (1, -1), "Helvetica", 9),
        ("FONT", (0, 2), (1, 2), "Helvetica-Bold", 11),
        ("TEXTCOLOR", (0, 2), (1, 2), gold),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("LINEABOVE", (0, 2), (-1, 2), 1, gold),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(totals_table)

    # Payment breakdown
    if split_payments:
        elems.append(Spacer(1, 3*mm))
        elems.append(Paragraph("PAYMENT BREAKDOWN", ParagraphStyle("ph", fontSize=8, textColor=mid_gray, fontName="Helvetica-Bold")))
        for p in split_payments:
            elems.append(Paragraph(
                f"  {p.get('method','—')} — ₹{float(p.get('amount',0)):.2f}" + (f"  (TXN: {p['txn_id']})" if p.get('txn_id') else ""),
                small_s))

    elems.append(Spacer(1, 8*mm))
    elems.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#DDDDDD")))
    elems.append(Spacer(1, 2*mm))
    elems.append(Paragraph("Thank you for visiting Jainil Hair Studio! We look forward to seeing you again.", 
                            ParagraphStyle("footer", fontSize=8, textColor=mid_gray, alignment=TA_CENTER, fontName="Helvetica")))

    doc.build(elems)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="Jainil_Invoice_{inv_id}.pdf"'}
    )
