import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('firebase-adminsdk.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

phone = "9099879346"

# Get lead
leads = list(db.collection('leads').where('phone', '==', phone).limit(1).stream())
if not leads:
    print("No lead found")
    exit(1)

lead_ref = leads[0].reference

# Set a pending payment for testing
lead_ref.update({'pending_payment': 200})
print("Successfully set pending payment to 200 for test")
