import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("api/firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

prods = db.collection("products").where("name", "==", "GP 3 No").stream()
for p in prods:
    print(p.id, p.to_dict().get("branch"), p.to_dict().get("stock"))
