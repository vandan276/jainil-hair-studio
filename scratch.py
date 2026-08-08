import os
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("api/firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

all_prods = db.collection("products").stream()
for p in all_prods:
    d = p.to_dict()
    name = d.get("name", "")
    if "4 No" in name or "3 No" in name or "GP 4" in name or "GP 3" in name:
        print(f"DocID: {p.id}, ID: {d.get('id')}, Name: repr({repr(name)}), Branch: repr({repr(d.get('branch'))}), Stock: {d.get('stock')}")
