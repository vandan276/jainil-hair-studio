import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv(".env.production.local")

firebase_creds_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
firebase_creds_json = firebase_creds_json.replace('\\n', '\n')
creds_dict = json.loads(firebase_creds_json)

cred = credentials.Certificate(creds_dict)
firebase_admin.initialize_app(cred)
db = firestore.client()

print("Connecting to Firestore...")
try:
    doc = db.collection("settings").document("maintenance").get()
    print("Success:", doc.exists)
except Exception as e:
    print("Error:", e)
