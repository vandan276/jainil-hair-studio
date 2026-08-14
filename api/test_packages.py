import requests

url = "http://localhost:8000/leads"
resp = requests.get(url)
if resp.status_code == 200:
    leads = resp.json()
    if leads:
        lead_id = leads[0]["id"]
        print(f"Found lead {lead_id}")
        
        # assign a fake package
        update = {
            "packages": [
                {
                    "id": "testpkg123",
                    "package_id": "pkg-1",
                    "name": "Hair Therapy Package",
                    "purchased_at": "2026-08-10",
                    "expires_at": "2027-02-10",
                    "services": [
                        {
                            "category": "Hair",
                            "service_name": "Hair Spa",
                            "total_quantity": 3,
                            "remaining_quantity": 3,
                            "price": 1000
                        }
                    ],
                    "status": "active"
                }
            ]
        }
        r = requests.patch(f"{url}/{lead_id}", json=update)
        print("PATCH status:", r.status_code)
        
        r2 = requests.get(f"{url}/{lead_id}")
        if r2.status_code == 200:
            print("GET pkgs:", r2.json().get("packages"))
        else:
            print("GET failed", r2.status_code)
    else:
        print("No leads found")
else:
    print("GET leads failed", resp.status_code, resp.text)
