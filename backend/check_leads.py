import firebase_admin
from firebase_admin import credentials, firestore
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
local_creds = ROOT_DIR / 'firebase-adminsdk.json'
cred = credentials.Certificate(str(local_creds))
firebase_admin.initialize_app(cred)
db = firestore.client()

print("--- LEADS ---")
leads = db.collection("leads").stream()
for l in leads:
    d = l.to_dict()
    print(f"ID: {d.get('id')} | Name: {d.get('name')} | AssignedTo: {d.get('assigned_to')} | Branch: {d.get('branch')} | Section: {d.get('section')}")

print("\n--- USERS ---")
users = db.collection("users").stream()
for u in users:
    d = u.to_dict()
    print(f"ID: {d.get('id')} | Name: {d.get('name')} | Email: {d.get('email')} | Role: {d.get('role')} | Branch: {d.get('branch')} | Section: {d.get('section')}")
