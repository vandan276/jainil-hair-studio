from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

from ..db import supabase
from ..utils import (
    hash_password, verify_password, create_access_token, 
    new_id, now_iso, get_current_user
)

router = APIRouter(tags=["auth"])

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: Optional[str] = None
    branch: Optional[str] = None
    section: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

@router.post("/auth/register")
def register(data: RegisterIn, response: Response):
    email = data.email.lower()
    res = supabase.table("users").select("id").eq("email", email).limit(1).execute()
    if res.data:
        raise HTTPException(400, "Email already registered")
    
    uid = new_id()
    user_doc = {
        "id": uid,
        "name": data.name,
        "email": email,
        "password_hash": hash_password(data.password),
        "phone": data.phone or "",
        "role": "user",
        "created_at": now_iso(),
    }
    
    supabase.table("users").insert(user_doc).execute()
    token = create_access_token(uid, email, "user")
    
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=7 * 24 * 3600, path="/")
    user_doc.pop("password_hash", None)
    return {**user_doc, "token": token}


@router.post("/auth/login")
def login(data: LoginIn, response: Response):
    email = data.email.lower()
    res = supabase.table("users").select("*").eq("email", email).limit(1).execute()
    if not res.data:
        raise HTTPException(401, "Invalid email or password")
        
    user = res.data[0]
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
        
    token = create_access_token(user["id"], email, user.get("role", "user"))
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=7 * 24 * 3600, path="/")
    
    user.pop("password_hash", None)
    return {**user, "token": token}


@router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

# ----- User Leaves -----

@router.get("/users/me/leaves")
def get_my_leaves(user: dict = Depends(get_current_user)):
    res = supabase.table("users").select("leaves").eq("id", user["id"]).execute()
    if not res.data:
        raise HTTPException(404, "User not found")
        
    official_leaves = res.data[0].get("leaves") or []
    
    # Also fetch all their leave requests
    req_res = supabase.table("leave_requests").select("*").eq("user_id", user["id"]).execute()
    requests = req_res.data
    
    return {"leaves": official_leaves, "requests": requests}


@router.post("/users/me/leaves/request")
def request_my_leave(data: dict, user: dict = Depends(get_current_user)):
    date_str = data.get("date")
    if not date_str:
        raise HTTPException(400, "Date is required")
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(400, "Invalid date format. Expected YYYY-MM-DD")
        
    # Check if a request already exists for this date
    existing_res = supabase.table("leave_requests").select("id").eq("user_id", user["id"]).eq("date", date_str).execute()
    if existing_res.data:
        raise HTTPException(400, "A leave request or approved leave already exists for this date")
        
    rid = new_id()
    request_doc = {
        "id": rid,
        "user_id": user["id"],
        "user_name": user.get("name") or "Employee",
        "branch": user.get("branch") or "Baroda",
        "date": date_str,
        "status": "pending",
        "created_at": now_iso()
    }
    
    supabase.table("leave_requests").insert(request_doc).execute()
    return {"ok": True, "request": request_doc}


@router.post("/users/me/leaves/cancel")
def cancel_my_leave(data: dict, user: dict = Depends(get_current_user)):
    date_str = data.get("date")
    if not date_str:
        raise HTTPException(400, "Date is required")
        
    # Delete the leave request
    supabase.table("leave_requests").delete().eq("user_id", user["id"]).eq("date", date_str).execute()
        
    # Remove from official leaves array if it was approved
    user_res = supabase.table("users").select("leaves").eq("id", user["id"]).execute()
    if user_res.data:
        leaves = user_res.data[0].get("leaves") or []
        if date_str in leaves:
            leaves = [d for d in leaves if d != date_str]
            supabase.table("users").update({"leaves": leaves}).eq("id", user["id"]).execute()
            
    return {"ok": True}
