import sys
import os
sys.path.append('.')
from api.firestore_client import init, list_docs, update_doc

# Use absolute path for credentials
base_path = '/Users/panchalvandan/Desktop/hair-saloon3/New-hair-saloon'
creds_file = os.path.join(base_path, 'eminence-e436f-firebase-adminsdk-fbsvc-44d9c3978a.json')

print(f"Initializing Firestore with: {creds_file}")
init(creds_file=creds_file)

print("Fetching products...")
products = list_docs('products')
print(f"Found {len(products)} products.")

for p in products:
    updates = {}
    name = p.get('name', 'Unknown')
    
    # Fix image_url
    if p.get('image_url') and 'localhost' in p['image_url']:
        old = p['image_url']
        updates['image_url'] = '/' + old.split('localhost:8000/')[-1].split('localhost:3000/')[-1].lstrip('/')
        if not updates['image_url'].startswith('/api'):
            updates['image_url'] = '/api/files/' + updates['image_url'].lstrip('/')
        print(f"  Fixing image_url for {name}: {old} -> {updates['image_url']}")
        
    # Fix video_url
    if p.get('video_url') and 'localhost' in p['video_url']:
        old = p['video_url']
        updates['video_url'] = '/' + old.split('localhost:8000/')[-1].split('localhost:3000/')[-1].lstrip('/')
        if not updates['video_url'].startswith('/api'):
            updates['video_url'] = '/api/files/' + updates['video_url'].lstrip('/')
        print(f"  Fixing video_url for {name}: {old} -> {updates['video_url']}")
        
    # Fix images list
    if p.get('images'):
        new_images = []
        changed = False
        for img in p['images']:
            if 'localhost' in img:
                fixed = '/' + img.split('localhost:8000/')[-1].split('localhost:3000/')[-1].lstrip('/')
                if not fixed.startswith('/api'):
                    fixed = '/api/files/' + fixed.lstrip('/')
                new_images.append(fixed)
                changed = True
            else:
                new_images.append(img)
        if changed:
            updates['images'] = new_images
            print(f"  Fixing images list for {name}")
            
    if updates:
        update_doc('products', p['id'], updates)
        print(f"  Updated document in Firestore for: {name}")

print("Done fixing database URLs.")

