import sys
sys.path.append('.')
from api.firestore_client import init, list_docs

# Initialize Firestore
init(creds_file='eminence-e436f-firebase-adminsdk-fbsvc-44d9c3978a.json')

products = list_docs('products')
for p in products[:5]:
    print(f"{p['name']}: {p.get('image_url')}")
