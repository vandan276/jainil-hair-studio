import requests
resp = requests.get("https://new-hair-saloon-nl40k2z86-vandan-panchals-projects.vercel.app/api/admin/users")
print(resp.json())
