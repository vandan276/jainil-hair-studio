import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('firebase-adminsdk.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

phone = "9099879346"

# Check the lead
leads = list(db.collection('leads').where('phone', '==', phone).limit(1).stream())
ld = leads[0].to_dict()
print("Packages:", ld.get('packages'))
print("Pending Payment:", ld.get('pending_payment'))

