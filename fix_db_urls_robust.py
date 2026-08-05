import sys
import time
sys.path.append('.')
from api.firestore_client import init, list_docs, update_doc

# Initialize Firestore
init(creds_file='eminence-e436f-firebase-adminsdk-fbsvc-44d9c3978a.json')

def fix_urls():
    print("Fetching products...")
    try:
        products = list_docs('products')
    except Exception as e:
        print(f"Error fetching products: {e}")
        return False

    for p in products:
        updates = {}
        
        # Check image_url
        url = p.get('image_url')
        if url and 'localhost:8000' in url:
            updates['image_url'] = url.split('localhost:8000')[-1]
            
        # Check video_url
        vurl = p.get('video_url')
        if vurl and 'localhost:8000' in vurl:
            updates['video_url'] = vurl.split('localhost:8000')[-1]
            
        # Check images list
        if p.get('images'):
            new_images = []
            changed = False
            for img in p['images']:
                if 'localhost:8000' in img:
                    new_images.append(img.split('localhost:8000')[-1])
                    changed = True
                else:
                    new_images.append(img)
            if changed:
                updates['images'] = new_images
                
        if updates:
            print(f"Fixing {p['name']}...")
            try:
                update_doc('products', p['id'], updates)
                print(f"Successfully updated {p['name']}")
            except Exception as e:
                print(f"Failed to update {p['name']}: {e}")

    return True

# Retry loop
for i in range(3):
    if fix_urls():
        print("All URLs fixed!")
        break
    print(f"Retry {i+1}...")
    time.sleep(5)
