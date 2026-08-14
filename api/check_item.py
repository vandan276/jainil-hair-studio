import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('firebase-adminsdk.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

item_id = '0bde4fae-8fff-42fd-a8c4-ae9fb8da5bcf'
p = db.collection('products').document(item_id).get()
s = db.collection('services').document(item_id).get()
pkg = db.collection('packages').document(item_id).get()

print("In products:", p.exists)
print("In services:", s.exists)
print("In packages:", pkg.exists)
