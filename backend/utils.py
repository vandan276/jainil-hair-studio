import os
import uuid
import bcrypt
import jwt
import time
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import HTTPException, Depends, Request
from .db import supabase

JWT_SECRET = os.environ.get('JWT_SECRET', 'secret')
JWT_ALGO = "HS256"

# ----- Helpers -----
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False


def create_access_token(uid: str, email: str, role: str) -> str:
    payload = {"sub": uid, "email": email, "role": role,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


# ---- In-memory cache to reduce reads ----
_cache: dict = {}

def cache_get(key: str):
    """Return cached value if not expired, else None."""
    entry = _cache.get(key)
    if entry and (time.time() - entry["ts"]) < entry["ttl"]:
        return entry["val"]
    return None

def cache_set(key: str, value, ttl: int = 300):
    """Store value in cache with given TTL in seconds."""
    _cache[key] = {"val": value, "ts": time.time(), "ttl": ttl}

def cache_bust(key: str):
    """Invalidate a specific cache key."""
    _cache.pop(key, None)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
        
    res = supabase.table("users").select("*").eq("id", payload["sub"]).execute()
    if not res.data:
        raise HTTPException(401, "User not found")
        
    user = res.data[0]
    # If there's an is_active field you can check it here
    user.pop("password_hash", None)
    return user


async def get_optional_user(request: Request) -> Optional[dict]:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        res = supabase.table("users").select("*").eq("id", payload["sub"]).execute()
        if res.data:
            user = res.data[0]
            user.pop("password_hash", None)
            return user
    except:
        pass
    return None


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(403, "Admin access required")
    return user


async def require_receptionist(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") not in ["admin", "super_admin", "receptionist"]:
        raise HTTPException(403, "Receptionist or Admin access required")
    return user


async def require_employee(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") not in ["admin", "super_admin", "employee", "sales", "service", "receptionist"]:
        raise HTTPException(403, "Staff or Admin access required")
    return user
