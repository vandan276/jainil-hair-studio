import os
import uuid
import bcrypt
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, firestore

current_dir = os.path.dirname(os.path.abspath(__file__))
cred_file = os.path.join(current_dir, 'api', 'firebase-adminsdk.json')

if os.path.exists(cred_file):
    cred = credentials.Certificate(cred_file)
    firebase_admin.initialize_app(cred)
else:
    cred_file = 'firebase-adminsdk.json'
    if os.path.exists(cred_file):
        cred = credentials.Certificate(cred_file)
        firebase_admin.initialize_app(cred)
    else:
        print("❌ Firebase credentials not found.")
        exit(1)

db = firestore.client()

def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def seed_super_admin():
    email = "superadmin@eminence.com"
    password = "SuperAdmin@123"
    
    print(f"🚀 Seeding Super Admin user: {email}...")
    
    docs = db.collection("users").where("email", "==", email).limit(1).get()
    if docs:
        print(f"⚠️ User {email} already exists. Updating password...")
        uid = docs[0].id
        db.collection("users").document(uid).update({
            "password_hash": hash_password(password),
            "updated_at": now_iso()
        })
    else:
        uid = str(uuid.uuid4())
        user_doc = {
            "id": uid,
            "name": "Super Admin",
            "email": email,
            "password_hash": hash_password(password),
            "phone": "8888888888",
            "role": "admin", # Role is admin so it passes all backend endpoints
            "created_at": now_iso()
        }
        db.collection("users").document(uid).set(user_doc)
        print(f"✅ Super Admin user created successfully!")

if __name__ == "__main__":
    seed_super_admin()
