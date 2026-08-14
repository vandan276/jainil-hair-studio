import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('firebase-adminsdk.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

leads = list(db.collection('leads').where('phone', '==', '9099879346').stream())
print("Found leads count:", len(leads))
for l in leads:
    ld = l.to_dict()
    print("Lead ID:", l.id)
    print("Packages length:", len(ld.get('packages', [])))
    print("created_at:", ld.get('created_at'))
