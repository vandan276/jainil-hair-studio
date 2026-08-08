import os
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("api/firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

docs = db.collection("products").stream()
cached_products = [d.to_dict() for d in docs]

# Simulate GET /products?all_products=true&branch=Surat for an admin whose branch is Baroda
admin_user = {"role": "admin", "email": "admin@baroda.com", "branch": "Baroda"}
requested_branch = "Surat"

# Bug in line 1079:
branch = requested_branch
if admin_user and admin_user.get("role") == "admin" and admin_user.get("email", "").lower() != "superadmin@eminence.com":
    branch = admin_user.get("branch") # OVERWRITTEN TO Baroda!

print(f"Requested branch: {requested_branch}, but active branch filter became: {branch}")

items = [dict(item) for item in cached_products]
for i in items:
    b_stock_dict = i.get("branch_stock", {})
    if branch:
        if b_stock_dict:
            i["stock"] = b_stock_dict.get(branch, 0)
        else:
            orig_branch = i.get("branch", "Baroda")
            i["stock"] = i.get("stock", 0) if orig_branch == branch else 0

surat_prods = [i for i in items if i.get("name") in ["GP 4 No ", "GP 3 No"]]
for p in surat_prods:
    print(f"Product: '{p.get('name')}', Doc Branch: '{p.get('branch')}', Evaluated Stock: {p.get('stock')}")
