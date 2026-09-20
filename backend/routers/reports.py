from fastapi import APIRouter, Depends, Query
from typing import Optional
from ..db import supabase
from ..utils import require_admin, require_employee, now_iso

router = APIRouter(tags=["reports"])

@router.get("/admin/payroll")
def get_payroll(month: Optional[str] = Query(None), user: dict = Depends(require_admin)):
    filter_val = month if month else now_iso()[:7]
    
    # Fetch all employees
    emp_res = supabase.table("users").select("*").in_("role", ["employee", "sales", "service"]).execute()
    employees = emp_res.data
    
    # We will compute daily commissions for each employee
    # 1. Manual sales (service commission)
    try:
        ms_res = supabase.table("manual_sales").select("*").ilike("date", f"{filter_val}%").execute()
        manual_sales = ms_res.data
    except:
        manual_sales = []
    
    # 2. Leads payments (sales commission)
    leads_res = supabase.table("leads").select("id,name,data,assigned_to,status").execute()
    all_payments = []
    for lead in leads_res.data:
        emp_id = lead.get("assigned_to")
        if not emp_id or emp_id == "walkin" or lead.get("status") not in ["converted", "closed"]:
            continue
            
        payments = lead.get("data", {}).get("payments") or []
        for p in payments:
            if isinstance(p, dict):
                p_type = (p.get("type") or "").strip().lower()
                if p_type == "token":
                    continue
                ts = p.get("timestamp") or ""
                if ts.startswith(filter_val):
                    p_copy = dict(p)
                    p_copy["recorded_by_id"] = emp_id
                    p_copy["lead_id"] = lead.get("id")
                    p_copy["client_name"] = lead.get("name")
                    all_payments.append(p_copy)
                    
    payroll_data = []
    
    for emp in employees:
        emp_id = emp.get("id")
        emp_manual = [s for s in manual_sales if s.get("employee_id") == emp_id]
        emp_payments = [p for p in all_payments if p.get("recorded_by_id") == emp_id]
        
        daily_comms = []
        
        for m in emp_manual:
            daily_comms.append({
                "date": m.get("date")[:10] if m.get("date") else "",
                "type": "service",
                "name": m.get("item_name") or "Service",
                "client_name": m.get("client_name") or "Walk-in",
                "price": m.get("amount") or 0,
                "commission": m.get("amount") or 0, # Manual sales already represent the commission amount
                "order_id": m.get("order_id"),
                "item_idx": m.get("item_idx")
            })
            
        for p in emp_payments:
            amt = float(p.get("amount") or 0)
            comm_rate = float(emp.get("commission_rate") or 0)
            comm = amt * comm_rate if comm_rate > 0 else 0
            
            daily_comms.append({
                "date": p.get("timestamp")[:10] if p.get("timestamp") else "",
                "type": "sales",
                "name": p.get("payment_method") or "Payment",
                "client_name": p.get("client_name"),
                "price": amt,
                "commission": comm,
                "lead_id": p.get("lead_id"),
                "payment_id": p.get("id")
            })
            
        # Group daily comms by date for frontend rendering
        grouped_by_date = {}
        for c in daily_comms:
            d = c["date"]
            if d not in grouped_by_date:
                grouped_by_date[d] = {
                    "date": d,
                    "items": [],
                    "services_count": 0,
                    "total_sales": 0,
                    "total_commission": 0
                }
            grouped_by_date[d]["items"].append(c)
            grouped_by_date[d]["services_count"] += 1
            grouped_by_date[d]["total_sales"] += c["price"]
            grouped_by_date[d]["total_commission"] += c["commission"]
            
        grouped_list = list(grouped_by_date.values())
        grouped_list.sort(key=lambda x: x["date"], reverse=True)
        
        total_comm = sum(c["commission"] for c in daily_comms)
        
        emp_data = dict(emp)
        emp_data.pop("password_hash", None)
        emp_data["daily_commissions"] = grouped_list
        emp_data["total_daily_commission"] = total_comm
        
        payroll_data.append(emp_data)
        
    return payroll_data


@router.get("/admin/reports")
def get_reports(month: Optional[str] = Query(None), branch: Optional[str] = None, user: dict = Depends(require_admin)):
    filter_val = month if month else now_iso()[:7]
    
    emp_query = supabase.table("users").select("*").in_("role", ["employee", "sales", "service"])
    if branch and branch != "All Branches":
        emp_query = emp_query.eq("branch", branch)
    employees = emp_query.execute().data
    
    # 1. Fetch manual sales
    try:
        ms_query = supabase.table("manual_sales").select("*").ilike("date", f"{filter_val}%")
        if branch and branch != "All Branches":
            ms_query = ms_query.eq("branch", branch)
        manual_sales = ms_query.execute().data
    except:
        manual_sales = []
    
    # 2. Fetch leads
    leads_query = supabase.table("leads").select("id,assigned_to,source,payments,status,created_at,updated_at,branch,section,is_repeated")
    if branch and branch != "All Branches":
        leads_query = leads_query.eq("branch", branch)
    leads = leads_query.execute().data
    
    # 3. Fetch calls
    calls_query = supabase.table("calls").select("user_id,timestamp").ilike("timestamp", f"{filter_val}%")
    calls = calls_query.execute().data
    
    leads_by_emp = {}
    all_payments = []
    
    for d in leads:
        emp_id = d.get("assigned_to")
        lead_source = (d.get("source") or "").strip().lower()
        lead_status = (d.get("status") or "").strip().lower()
        is_repeated = bool(d.get("is_repeated")) or ("repeat" in lead_source) or ("repeated" in lead_source)
        
        if not emp_id or emp_id == "walkin": continue
        if lead_source in ["walk-in", "walkin", "direct", "walk in", "billing"]: continue
        if is_repeated: continue
        if lead_status not in ["converted", "closed"]: continue
        
        created_at = d.get("created_at") or ""
        if created_at.startswith(filter_val) and emp_id:
            leads_by_emp.setdefault(emp_id, []).append(d)
            
        payments = d.get("payments") or []
        for p in payments:
            if isinstance(p, dict):
                p_type = (p.get("type") or "").strip().lower()
                if p_type == "token": continue
                ts = p.get("timestamp") or d.get("updated_at") or ""
                p_copy = dict(p)
                p_copy["timestamp"] = ts
                p_copy["recorded_by_id"] = emp_id
                all_payments.append(p_copy)
                
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
            "target": 100000 # Default target
        })
        
    return reports
