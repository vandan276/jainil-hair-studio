import os
import uuid
import bcrypt
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, firestore

# ----- Firebase Init -----
# Using the same credentials moved to api/
current_dir = os.path.dirname(os.path.abspath(__file__))
cred_file = os.path.join(current_dir, 'api', 'firebase-adminsdk.json')

if os.path.exists(cred_file):
    cred = credentials.Certificate(cred_file)
    firebase_admin.initialize_app(cred)
else:
    # Try current directory if run from root
    cred_file = 'firebase-adminsdk.json'
    if os.path.exists(cred_file):
        cred = credentials.Certificate(cred_file)
        firebase_admin.initialize_app(cred)
    else:
        print("❌ Firebase credentials not found. Please check paths.")
        exit(1)

db = firestore.client()

def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def seed_admin():
    email = "admin@eminence.com"
    password = "Admin@123"
    
    print(f"🚀 Seeding Admin user: {email}...")
    
    # Check if exists
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
            "name": "Admin",
            "email": email,
            "password_hash": hash_password(password),
            "phone": "9999999999",
            "role": "admin",
            "created_at": now_iso()
        }
        db.collection("users").document(uid).set(user_doc)
        print(f"✅ Admin user created successfully!")

if __name__ == "__main__":
    seed_admin()
