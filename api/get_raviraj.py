import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('firebase-adminsdk.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

leads = list(db.collection('leads').where('phone', '==', '9099879346').limit(1).stream())
ld = leads[0].to_dict()
print("created_at:", ld.get('created_at'))
print("first_visit:", ld.get('first_visit'))
