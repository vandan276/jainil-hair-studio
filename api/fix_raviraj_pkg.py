import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta

cred = credentials.Certificate('firebase-adminsdk.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

phone = "9099879346"

# Get lead
leads = list(db.collection('leads').where('phone', '==', phone).limit(1).stream())
if not leads:
    print("No lead found")
    exit(1)

lead_ref = leads[0].reference
lead_data = leads[0].to_dict()

packages = lead_data.get('packages', [])
has_10_services = any(p.get('name') == '10 SERVICES PACKAGE' for p in packages)

if not has_10_services:
    # Fetch package details
    pkg_doc = db.collection('packages').document('0bde4fae-8fff-42fd-a8c4-ae9fb8da5bcf').get()
    if pkg_doc.exists:
        prod = pkg_doc.to_dict()
        duration = prod.get("duration_days", 180)
        expires_at = (datetime.now() + timedelta(days=duration)).isoformat()[:10]
        
        pkg_services = []
        for s_item in prod.get("services", []):
            pkg_services.append({
                "category": s_item.get("category", ""),
                "service_name": s_item.get("service_name", ""),
                "total_quantity": s_item.get("quantity", 1),
                "remaining_quantity": s_item.get("quantity", 1),
                "price": s_item.get("price", 0)
            })
            
        new_pkg = {
            "id": "fixed-pkg-001",
            "package_id": "0bde4fae-8fff-42fd-a8c4-ae9fb8da5bcf",
            "name": prod.get('name'),
            "purchased_at": "2026-07-27",
            "expires_at": expires_at,
            "services": pkg_services,
            "status": "active"
        }
        packages.append(new_pkg)
        
        # Remove simulated package if it's there
        packages = [p for p in packages if p.get('id') != 'simulated_pkg']
        
        lead_ref.update({'packages': packages})
        print("Successfully added missing package to Raviraj")
    else:
        print("Package doc not found")
else:
    print("Raviraj already has the package")
