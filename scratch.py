import os
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("api/firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

docs = db.collection("users").where("name", "==", "Chandan Bhai").get()
for d in docs:
    print(d.to_dict())
