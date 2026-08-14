import firebase_admin
from firebase_admin import credentials, firestore
import json

cred = credentials.Certificate('firebase-adminsdk.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

doc = db.collection('orders').document('0619739c-977e-4174-b9ec-606307cf38de').get()
d = doc.to_dict()
print("Order created_at:", d.get('created_at'))
