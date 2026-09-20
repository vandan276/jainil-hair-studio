from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from ..db import supabase
from ..utils import require_admin, now_iso
import calendar

router = APIRouter(tags=["reports"])

PAYROLL_SETTINGS_ID = "payroll_config"

def get_payroll_config() -> dict:
    try:
        res = supabase.table("settings").select("data").eq("id", PAYROLL_SETTINGS_ID).execute()
        if res.data:
            return res.data[0].get("data") or {}
    except:
        pass
    return {}

def save_payroll_config(config: dict):
    try:
        res = supabase.table("settings").select("id").eq("id", PAYROLL_SETTINGS_ID).execute()
        if res.data:
            supabase.table("settings").update({"data": config, "updated_at": now_iso()}).eq("id", PAYROLL_SETTINGS_ID).execute()
        else:
            supabase.table("settings").insert({"id": PAYROLL_SETTINGS_ID, "data": config, "updated_at": now_iso()}).execute()
    except Exception as e:
        print("Error saving payroll config:", e)


@router.patch("/admin/employees/{uid}/payroll")
def update_employee_payroll(uid: str, body: dict, user: dict = Depends(require_admin)):
    config = get_payroll_config()
    emp_cfg = config.get(uid) or {}
    for field in ["base_salary", "commission_rate", "allowed_weekoffs",
                  "product_commission_rate", "package_commission_rate", "membership_commission_rate"]:
        if field in body:
            emp_cfg[field] = body[field]
    config[uid] = emp_cfg
    save_payroll_config(config)
    return {"ok": True}


@router.get("/admin/payroll")
def get_payroll(month: Optional[str] = Query(None), user: dict = Depends(require_admin)):
    filter_val = month if month else now_iso()[:7]

    try:
        year, mon = int(filter_val[:4]), int(filter_val[5:7])
        days_in_month = calendar.monthrange(year, mon)[1]
        next_month_year = year if mon < 12 else year + 1
        next_month_mon = mon + 1 if mon < 12 else 1
        next_month_start = f"{next_month_year}-{next_month_mon:02d}-01"
        month_start = f"{filter_val}-01"
    except:
        days_in_month = 30
        next_month_start = filter_val + "-32"
        month_start = filter_val + "-01"

    payroll_cfg = get_payroll_config()

    emp_res = supabase.table("users").select("*").in_("role", ["employee", "sales", "service"]).execute()
    employees = emp_res.data

    orders_res = supabase.table("orders").select("*").gte("created_at", month_start).lt("created_at", next_month_start).execute()
    orders = orders_res.data

    try:
        ms_res = supabase.table("manual_sales").select("*").gte("date", month_start).lt("date", next_month_start).execute()
        manual_sales = ms_res.data
    except:
        manual_sales = []

    leads_res = supabase.table("leads").select("id,name,data,assigned_to,status").execute()
    all_lead_payments = []
    for lead in leads_res.data:
        emp_id = lead.get("assigned_to")
        if not emp_id or emp_id == "walkin":
            continue
        payments = (lead.get("data") or {}).get("payments") or []
        for p in payments:
            if isinstance(p, dict):
                if (p.get("type") or "").strip().lower() == "token":
                    continue
                ts = p.get("timestamp") or ""
                if ts.startswith(filter_val):
                    pc = dict(p)
                    pc["recorded_by_id"] = emp_id
                    pc["lead_id"] = lead.get("id")
                    pc["client_name"] = lead.get("name")
                    all_lead_payments.append(pc)

    try:
        att_res = supabase.table("attendance").select("*").execute()
        all_attendance = att_res.data
    except:
        all_attendance = []

    payroll_data = []

    for emp in employees:
        emp_id = emp.get("id")
        cfg = payroll_cfg.get(emp_id) or {}

        base_salary = float(cfg.get("base_salary") or 0)
        comm_rate = float(cfg.get("commission_rate") or 0)
        allowed_weekoffs = int(cfg.get("allowed_weekoffs") or 2)
        product_comm_rate = float(cfg.get("product_commission_rate") or 0)
        package_comm_rate = float(cfg.get("package_commission_rate") or 0)
        membership_comm_rate = float(cfg.get("membership_commission_rate") or 0)

        service_commission = 0.0
        product_commission = 0.0
        package_commission = 0.0
        membership_commission = 0.0
        sales_commission = 0.0
        monthly_sales = 0.0
        daily_comms = []

        for order in orders:
            od = order.get("order_data") or {}
            items = od.get("items") or []
            client_name = od.get("user_name") or od.get("client_name") or "Walk-in"
            order_date = (order.get("created_at") or "")[:10]

            for idx, item in enumerate(items):
                sp = item.get("service_provider")
                sp2 = item.get("service_provider_2")
                if sp != emp_id and sp2 != emp_id:
                    continue

                item_type = (item.get("type") or "").lower()
                line_total = float(item.get("line_total") or item.get("price") or 0)
                monthly_sales += line_total

                if item_type == "product":
                    comm = line_total * product_comm_rate
                    product_commission += comm
                    daily_comms.append({"date": order_date, "type": "product",
                        "name": item.get("name") or "Product", "client_name": client_name,
                        "price": line_total, "commission": comm,
                        "order_id": order.get("id"), "item_idx": idx})
                elif item.get("is_package"):
                    comm = line_total * package_comm_rate
                    package_commission += comm
                    daily_comms.append({"date": order_date, "type": "package",
                        "name": item.get("name") or "Package", "client_name": client_name,
                        "price": line_total, "commission": comm,
                        "order_id": order.get("id"), "item_idx": idx})
                elif item.get("is_membership") or item_type == "membership":
                    comm = line_total * membership_comm_rate
                    membership_commission += comm
                    daily_comms.append({"date": order_date, "type": "membership",
                        "name": item.get("name") or "Membership", "client_name": client_name,
                        "price": line_total, "commission": comm,
                        "order_id": order.get("id"), "item_idx": idx})
                else:
                    comm = line_total * comm_rate if comm_rate > 0 else 0
                    service_commission += comm
                    daily_comms.append({"date": order_date, "type": "service",
                        "name": item.get("name") or "Service", "client_name": client_name,
                        "price": line_total, "commission": comm,
                        "order_id": order.get("id"), "item_idx": idx})

        for m in [s for s in manual_sales if s.get("employee_id") == emp_id]:
            amt = float(m.get("amount") or 0)
            monthly_sales += amt
            service_commission += amt
            daily_comms.append({"date": (m.get("date") or "")[:10], "type": "service",
                "name": m.get("item_name") or "Service", "client_name": m.get("client_name") or "Walk-in",
                "price": amt, "commission": amt,
                "order_id": m.get("order_id"), "item_idx": m.get("item_idx")})

        for p in [p for p in all_lead_payments if p.get("recorded_by_id") == emp_id]:
            amt = float(p.get("amount") or 0)
            comm = amt * comm_rate if comm_rate > 0 else 0
            sales_commission += comm
            monthly_sales += amt
            daily_comms.append({"date": (p.get("timestamp") or "")[:10], "type": "sales",
                "name": p.get("payment_method") or "Payment", "client_name": p.get("client_name"),
                "price": amt, "commission": comm,
                "lead_id": p.get("lead_id"), "payment_id": p.get("id")})

        total_daily_commission = service_commission + product_commission + package_commission + membership_commission + sales_commission

        # Attendance
        emp_att = []
        for att in all_attendance:
            att_data = att.get("data") or {}
            if att_data.get("user_id") == emp_id:
                d = att_data.get("date") or ""
                if d.startswith(filter_val):
                    emp_att.append(att_data)

        present_days = len([a for a in emp_att if a.get("status") == "present"])
        leave_days = len([a for a in emp_att if a.get("status") in ["leave", "approved_leave"]])
        weekoff_days = len([a for a in emp_att if a.get("status") == "weekoff"])
        late_days = len([a for a in emp_att if a.get("is_late")])

        unpaid_leaves = max(0, days_in_month - present_days - leave_days - weekoff_days)
        weekoffs_cancelled = unpaid_leaves >= 5
        late_penalty = max(0, (late_days - 3)) * 100 if late_days > 3 else 0
        per_day = base_salary / days_in_month if days_in_month > 0 else 0
        attendance_deduction = per_day * unpaid_leaves
        total_payout = base_salary - attendance_deduction - late_penalty + total_daily_commission

        # Group by date
        grouped = {}
        for c in daily_comms:
            d = c["date"]
            if d not in grouped:
                grouped[d] = {"date": d, "items": [], "services_count": 0, "total_sales": 0.0, "total_commission": 0.0}
            grouped[d]["items"].append(c)
            grouped[d]["services_count"] += 1
            grouped[d]["total_sales"] += c["price"]
            grouped[d]["total_commission"] += c["commission"]

        grouped_list = sorted(grouped.values(), key=lambda x: x["date"], reverse=True)

        payroll_data.append({
            "id": emp_id,
            "name": emp.get("name"),
            "email": emp.get("email"),
            "role": emp.get("role") or "employee",
            "branch": cfg.get("branch") or emp.get("branch") or "Main",
            "base_salary": base_salary,
            "commission_rate": comm_rate,
            "product_commission_rate": product_comm_rate,
            "package_commission_rate": package_comm_rate,
            "membership_commission_rate": membership_comm_rate,
            "allowed_weekoffs": allowed_weekoffs,
            "monthly_sales": round(monthly_sales, 2),
            "service_commission": round(service_commission, 2),
            "product_commission": round(product_commission, 2),
            "package_commission": round(package_commission, 2),
            "membership_commission": round(membership_commission, 2),
            "total_daily_commission": round(total_daily_commission, 2),
            "attendance_deduction": round(attendance_deduction, 2),
            "late_penalty": round(late_penalty, 2),
            "total_payout": round(total_payout, 2),
            "attendance_details": {
                "present_days": present_days,
                "leave_days": leave_days,
                "weekoffs_taken": weekoff_days,
                "unpaid_leaves": unpaid_leaves,
                "late_days": late_days,
                "weekoffs_cancelled": weekoffs_cancelled,
            },
            "daily_commissions": grouped_list,
        })

    return payroll_data


@router.get("/admin/reports")
def get_reports(month: Optional[str] = Query(None), branch: Optional[str] = None, user: dict = Depends(require_admin)):
    filter_val = month if month else now_iso()[:7]

    emp_query = supabase.table("users").select("*").in_("role", ["employee", "sales", "service"])
    if branch and branch != "All Branches":
        emp_query = emp_query.eq("branch", branch)
    employees = emp_query.execute().data

    try:
        ms_query = supabase.table("manual_sales").select("*").ilike("date", f"{filter_val}%")
        if branch and branch != "All Branches":
            ms_query = ms_query.eq("branch", branch)
        manual_sales = ms_query.execute().data
    except:
        manual_sales = []

    leads_query = supabase.table("leads").select("id,assigned_to,source,data,status,created_at,updated_at,branch,section,is_repeated")
    if branch and branch != "All Branches":
        leads_query = leads_query.eq("branch", branch)
    leads = leads_query.execute().data

    calls_query = supabase.table("calls").select("user_id,timestamp").ilike("timestamp", f"{filter_val}%")
    calls = calls_query.execute().data

    leads_by_emp = {}
    all_payments = []

    for d in leads:
        emp_id = d.get("assigned_to")
        lead_source = (d.get("source") or "").strip().lower()
        lead_status = (d.get("status") or "").strip().lower()
        is_repeated = bool(d.get("is_repeated")) or ("repeat" in lead_source)

        if not emp_id or emp_id == "walkin": continue
        if lead_source in ["walk-in", "walkin", "direct", "walk in", "billing"]: continue
        if is_repeated: continue
        if lead_status not in ["converted", "closed"]: continue

        created_at = d.get("created_at") or ""
        if created_at.startswith(filter_val) and emp_id:
            leads_by_emp.setdefault(emp_id, []).append(d)

        payments = (d.get("data") or {}).get("payments") or []
        for p in payments:
            if isinstance(p, dict):
                if (p.get("type") or "").strip().lower() == "token": continue
                ts = p.get("timestamp") or d.get("updated_at") or ""
                pc = dict(p)
                pc["timestamp"] = ts
                pc["recorded_by_id"] = emp_id
                all_payments.append(pc)

    calls_by_emp = {}
    for c in calls:
        uid = c.get("user_id")
        if uid:
            calls_by_emp[uid] = calls_by_emp.get(uid, 0) + 1

    reports = []
    for emp in employees:
        emp_id = emp.get("id")
        emp_payments = [p for p in all_payments if p.get("recorded_by_id") == emp_id and p.get("timestamp", "").startswith(filter_val)]
        emp_manual = [s for s in manual_sales if s.get("employee_id") == emp_id and s.get("date", "").startswith(filter_val)]

        total_sales = sum(float(p.get("amount") or 0) for p in emp_payments) + sum(float(s.get("amount") or 0) for s in emp_manual)
        total_calls = calls_by_emp.get(emp_id, 0)
        emp_leads = leads_by_emp.get(emp_id, [])
        conversion_rate = round((len(emp_leads) / total_calls * 100), 2) if total_calls > 0 else 0

        reports.append({
            "employee_id": emp_id,
            "employee_name": emp.get("name"),
            "role": emp.get("role"),
            "total_sales": total_sales,
            "total_calls": total_calls,
            "conversion_rate": conversion_rate,
            "target": 100000
        })

    return reports
