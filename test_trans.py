import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("api/firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

docs = db.collection("product_transfers").get()
for doc in docs:
    print(doc.id, doc.to_dict())
