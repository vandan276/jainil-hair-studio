from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List

from ..db import supabase
from ..utils import unpack_data, new_id, now_iso, get_current_user, require_admin, require_employee

router = APIRouter(tags=["products_services"])

class ProductIn(BaseModel):
    name: str
    category: str
    description: Optional[str] = ""
    price: Optional[float] = 0.0
    stock: int = 100
    target_audience: Optional[str] = "Women"
    image_url: Optional[str] = None
    is_retail: Optional[bool] = True

class ServiceIn(BaseModel):
    name: str
    category: str
    description: Optional[str] = ""
    price: float
    duration_min: int
    image_url: Optional[str] = None
    service_for: Optional[str] = "Men & Women"

class PackageIn(BaseModel):
    name: str
    duration_days: int
    price: float
    services: List[dict] = []

# ----- PRODUCTS -----

@router.get("/products")
def list_products():
    res = supabase.table("products").select("*").execute()
    return res.data

@router.post("/products")
def create_product(data: ProductIn, user: dict = Depends(require_admin)):
    pid = new_id()
    doc = {
        "id": pid,
        "name": data.name,
        "category": data.category,
        "description": data.description,
        "price": data.price,
        "stock": data.stock,
        "target_audience": data.target_audience,
        "image_url": data.image_url,
        "is_retail": data.is_retail,
        "created_at": now_iso()
    }
    supabase.table("products").insert(doc).execute()
    return doc

@router.get("/products/{pid}")
def get_product(pid: str):
    res = supabase.table("products").select("*").eq("id", pid).execute()
    if not res.data:
        raise HTTPException(404, "Product not found")
    return res.data[0]


@router.patch("/products/{pid}")
def update_product(pid: str, data: dict, user: dict = Depends(require_admin)):
    res = supabase.table("products").select("id").eq("id", pid).execute()
    if not res.data:
        raise HTTPException(404, "Product not found")
        
    update_data = {"updated_at": now_iso()}
    for key, value in data.items():
        update_data[key] = value
        
    res = supabase.table("products").update(update_data).eq("id", pid).execute()
    return res.data[0] if res.data else {}

# ----- SERVICES -----

@router.get("/services")
def list_services():
    res = supabase.table("services").select("*").execute()
    return unpack_data(res.data)

@router.post("/services")
def create_service(data: ServiceIn, user: dict = Depends(require_admin)):
    sid = new_id()
    doc = {
        "id": sid,
        "name": data.name,
        "category": data.category,
        "description": data.description,
        "price": data.price,
        "duration_min": data.duration_min,
        "image_url": data.image_url,
        "service_for": data.service_for,
        "created_at": now_iso()
    }
    supabase.table("services").insert(doc).execute()
    return doc

@router.patch("/services/{sid}")
def update_service(sid: str, data: dict, user: dict = Depends(require_admin)):
    res = supabase.table("services").select("id").eq("id", sid).execute()
    if not res.data:
        raise HTTPException(404, "Service not found")
        
    update_data = {"updated_at": now_iso()}
    for key, value in data.items():
        update_data[key] = value
        
    res = supabase.table("services").update(update_data).eq("id", sid).execute()
    return res.data[0] if res.data else {}

# ----- PACKAGES -----

@router.get("/packages")
def list_packages():
    res = supabase.table("packages").select("*").execute()
    return unpack_data(res.data)

@router.post("/packages")
def create_package(data: PackageIn, user: dict = Depends(require_admin)):
    pkid = new_id()
    doc = {
        "id": pkid,
        "name": data.name,
        "duration_days": data.duration_days,
        "price": data.price,
        "services": data.services, # JSONB field
        "created_at": now_iso()
    }
    supabase.table("packages").insert(doc).execute()
    return doc

@router.delete("/packages/{pkid}")
def delete_package(pkid: str, user: dict = Depends(require_admin)):
    supabase.table("packages").delete().eq("id", pkid).execute()
    return {"ok": True}
