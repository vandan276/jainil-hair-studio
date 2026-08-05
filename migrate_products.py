import sys
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

def main():
    root_dir = Path(__file__).parent
    json_file = root_dir / 'api' / 'firebase-adminsdk.json'
    if not json_file.exists():
        json_file = root_dir / 'backend' / 'firebase-adminsdk.json'
        
    if not json_file.exists():
        print("Error: firebase-adminsdk.json not found")
        sys.exit(1)
        
    cred = credentials.Certificate(str(json_file))
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    
    print("Fetching products...")
    products = list(db.collection('products').stream())
    print(f"Found {len(products)} products.")
    
    count = 0
    for p in products:
        p.reference.update({'show_in_online_shop': True})
        print(f"Updated: {p.to_dict().get('name')}")
        count += 1
        
    print(f"Migration finished. Successfully updated {count} products.")

if __name__ == '__main__':
    main()
