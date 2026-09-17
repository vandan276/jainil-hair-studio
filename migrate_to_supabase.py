import os
import json
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
from supabase import create_client, Client

load_dotenv()

# --- 1. Supabase Initialization ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 2. Firebase Initialization ---
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

VALID_USER_IDS = set()
VALID_LEAD_IDS = set()
VALID_PRODUCT_IDS = set()

def migrate_collection(collection_name, table_name, transform_func=None):
    print(f"Migrating {collection_name} to {table_name}...")
    docs = db.collection(collection_name).stream()
    
    records = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        
        if collection_name == "users":
            VALID_USER_IDS.add(doc.id)
        elif collection_name == "leads":
            VALID_LEAD_IDS.add(doc.id)
        elif collection_name == "products":
            VALID_PRODUCT_IDS.add(doc.id)
        
        if transform_func:
            data = transform_func(data)
            
        records.append(data)
        
        # Batch insert every 100 records
        if len(records) >= 100:
            supabase.table(table_name).upsert(records).execute()
            print(f"  Migrated {len(records)} records...")
            records = []
            
    # Insert remaining
    if len(records) > 0:
        supabase.table(table_name).upsert(records).execute()
        print(f"  Migrated {len(records)} records...")
        
    print(f"✅ Finished {collection_name}")

# --- Transformation functions ---
def clean_users(data):
    return {
        "id": data.get("id"),
        "name": data.get("name", "Unknown"),
        "email": data.get("email", ""),
        "password_hash": data.get("password_hash"),
        "phone": data.get("phone"),
        "role": data.get("role", "staff")
    }

def clean_products(data):
    return {
        "id": data.get("id"),
        "name": data.get("name", "Unknown Product"),
        "category": data.get("category"),
        "price": data.get("price", 0),
        "stock": data.get("stock", 0),
        "branch": data.get("branch", "Surat")
    }

def clean_leads(data):
    # Handle potentially bad foreign keys
    assigned_to = data.get("assigned_to")
    if assigned_to not in VALID_USER_IDS:
        assigned_to = None
        
    return {
        "id": data.get("id"),
        "name": data.get("name", "Unknown"),
        "phone": data.get("phone", ""),
        "branch": data.get("branch"),
        "status": data.get("status", "new"),
        "assigned_to": assigned_to,
        "notes": data.get("notes", [])
    }

def main():
    print("🚀 Starting Migration to Supabase...")
    
    # Due to foreign key constraints, migrate in this order:
    migrate_collection("users", "users", clean_users)
    migrate_collection("products", "products", clean_products)
    migrate_collection("leads", "leads", clean_leads)
    
    # Generic migrations using JSONB to capture everything
    migrate_collection("services", "services", lambda d: {"id": d.get("id"), "name": d.get("name", "Service"), "data": d})
    migrate_collection("packages", "packages", lambda d: {"id": d.get("id"), "name": d.get("name", "Package"), "data": d})
    migrate_collection("orders", "orders", lambda d: {"id": d.get("id"), "lead_id": d.get("lead_id") if d.get("lead_id") in VALID_LEAD_IDS else None, "order_data": d})
    
    print("🎉 All done!")

if __name__ == "__main__":
    main()
