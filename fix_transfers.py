import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("api/firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Get all products in Surat
surat_prods = list(db.collection("products").where("branch", "==", "Surat").stream())
surat_prod_names = {p.to_dict().get("name", "").strip().lower(): p for p in surat_prods}

# Get all transfers to Surat
transfers = list(db.collection("product_transfers").where("destination", "==", "Surat").stream())

expected_stock = {}
for t in transfers:
    td = t.to_dict()
    name = td.get("product_name", "").strip().lower()
    if name not in expected_stock:
        expected_stock[name] = {"qty": 0, "source_id": td.get("product_id"), "real_name": td.get("product_name")}
    expected_stock[name]["qty"] += td.get("quantity", 0)

for name, data in expected_stock.items():
    if name not in surat_prod_names:
        print(f"Missing in Surat: {data['real_name']}, qty: {data['qty']}")
        # Need to create it!
        source_doc = db.collection("products").document(data["source_id"]).get()
        if source_doc.exists:
            sd = source_doc.to_dict()
            new_pid = db.collection("products").document().id
            new_prod = {
                **sd,
                "id": new_pid,
                "stock": data["qty"],
                "branch": "Surat",
                "branch_stock": {"Surat": data["qty"]}
            }
            db.collection("products").document(new_pid).set(new_prod)
            print(f"Created {data['real_name']} in Surat with stock {data['qty']}")
    else:
        # Check stock
        p = surat_prod_names[name]
        pd = p.to_dict()
        if pd.get("stock", 0) != data["qty"]:
            print(f"Mismatch for {data['real_name']}: expected {data['qty']}, got {pd.get('stock', 0)}")
            db.collection("products").document(p.id).update({"stock": data["qty"]})

