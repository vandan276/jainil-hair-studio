import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('firebase-adminsdk.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

phone = "9099879346"

# Create a test pending order for this phone
order_ref = db.collection('orders').document()
order_ref.set({
    'id': order_ref.id,
    'phone': phone,
    'total': 1000,
    'status': 'placed',
    'created_at': '2026-08-10T12:00:00Z',
    'split_payments': [{'method': 'Cash', 'amount': 265}]
})
print(f"Created pending order {order_ref.id} with 735 unpaid")
