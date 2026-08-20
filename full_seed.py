import os
import uuid
import random
from datetime import datetime, timezone, timedelta
import firebase_admin
from firebase_admin import credentials, firestore

# Use the service account file found in the root
cred_file = "jainil-e436f-firebase-adminsdk-fbsvc-44d9c3978a.json"
if os.path.exists(cred_file):
    cred = credentials.Certificate(cred_file)
    firebase_admin.initialize_app(cred)
else:
    # Fallback to default or backend/ local creds
    backend_creds = "backend/firebase-adminsdk.json"
    if os.path.exists(backend_creds):
        cred = credentials.Certificate(backend_creds)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()

db = firestore.client()

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def new_id():
    return str(uuid.uuid4())

SAMPLE_EMPLOYEES = [
    {"name": "Vikram Singh", "email": "vikram@jainil.com", "role": "sales", "branch": "Surat", "section": "Men"},
    {"name": "Sanya Malhotra", "email": "sanya@jainil.com", "role": "sales", "branch": "Baroda", "section": "Female"},
    {"name": "Arjun Kapoor", "email": "arjun@jainil.com", "role": "sales", "branch": "Surat", "section": "Men"},
    {"name": "Priya Sharma", "email": "priya@jainil.com", "role": "sales", "branch": "Baroda", "section": "Female"},
]

def seed_everything():
    print("🚀 Starting Full Database Seed...")

    # 1. Seed Employees
    print("👥 Seeding Employees...")
    emp_ids = []
    for emp in SAMPLE_EMPLOYEES:
        if not db.collection("users").where("email", "==", emp["email"]).limit(1).get():
            uid = new_id()
            doc = {
                "id": uid,
                **emp,
                "password_hash": "$2b$12$LQv3c1V.N1A.R1A.R1A.R1O1v7.6.6.6.6.6.6.6.6.6.6", # Dummy hash
                "created_at": now_iso(),
                "monthly_target": random.choice([50000, 100000, 150000, 200000])
            }
            db.collection("users").document(uid).set(doc)
            emp_ids.append(uid)
            print(f"   Created employee: {emp['name']}")
        else:
            doc = db.collection("users").where("email", "==", emp["email"]).limit(1).get()[0].to_dict()
            emp_ids.append(doc["id"])
            print(f"   Employee {emp['name']} already exists.")

    # 2. Seed Leads
    print("📈 Seeding Leads...")
    cities = ["Surat", "Baroda", "Ahmedabad", "Mumbai"]
    sources = ["Facebook Ads", "Instagram", "Website", "Walk-in"]
    statuses = ["new", "in process", "visit", "recycled", "dead", "converted"]
    
    for i in range(20):
        lid = new_id()
        status = random.choice(statuses)
        assigned_to = random.choice(emp_ids) if status != "new" else None
        
        doc = {
            "id": lid,
            "lead_number": f"LD-2026{str(i).zfill(4)}",
            "name": f"Client {i}",
            "phone": f"+9198765{str(random.randint(10000, 99999))}",
            "branch": random.choice(["Surat", "Baroda"]),
            "section": random.choice(["Men", "Female"]),
            "source": random.choice(sources),
            "status": status,
            "grade": random.choice(["Hot", "Warm", "Cold"]),
            "city": random.choice(cities),
            "assigned_to": assigned_to,
            "created_at": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat() + "Z",
        }
        db.collection("leads").document(lid).set(doc)
        
        # If converted, add a payment
        if status == "converted":
            db.collection("leads").document(lid).update({
                "payments": [{
                    "amount": random.randint(5000, 20000),
                    "timestamp": now_iso(),
                    "note": "Initial Conversion Payment"
                }]
            })

    # 3. Seed Manual Sales
    print("💰 Seeding Manual Sales...")
    for _ in range(10):
        sid = new_id()
        db.collection("manual_sales").document(sid).set({
            "id": sid,
            "employee_id": random.choice(emp_ids),
            "amount": random.randint(1000, 5000),
            "date": (datetime.now() - timedelta(days=random.randint(0, 5))).strftime("%Y-%m-%d"),
            "note": "Manual Seed Entry",
            "timestamp": now_iso()
        })

    print("✅ Seed Complete!")

if __name__ == "__main__":
    seed_everything()
