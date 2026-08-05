import time
import random
from datetime import datetime, timedelta
import sys
sys.path.append('.') # Ensure backend imports work
from backend.server import db, new_id, now_iso

def seed_leads():
    print("Seeding demo CRM data...")
    
    cities = ["Surat", "Baroda", "Ahmedabad", "Mumbai"]
    hair_conditions = ["Thinning", "Hair Loss", "Dry Scalp", "Looking for volume", "Post-pregnancy hair loss"]
    sources = ["Facebook Ads", "Instagram", "Website", "Walk-in", "Referral"]
    names = ["Rahul Sharma", "Priya Patel", "Amit Kumar", "Neha Desai", "Vikas Singh", 
             "Anjali Mehta", "Rohit Verma", "Kavita Shah", "Suresh Nair", "Pooja Gupta"]
    
    statuses = ["new", "in process", "visit", "recycled", "dead", "converted"]
    grades = ["Hot", "Warm", "Cold"]
    
    today = datetime.now()
    
    # We will create 15 leads
    for i in range(15):
        lid = new_id()
        name = random.choice(names) + f" {i}"
        status = random.choice(statuses)
        branch = random.choice(["Surat", "Baroda"])
        section = random.choice(["Men", "Female"])
        
        # Follow up dates: some today, some past, some future
        days_offset = random.choice([-2, -1, 0, 0, 1, 3, 5])
        follow_up_date = (today + timedelta(days=days_offset)).strftime("%Y-%m-%d")
        
        if status in ["new", "dead", "converted"]:
            follow_up_date = None # typically no follow up if new or closed
            
        doc = {
            "id": lid,
            "lead_number": f"LD-2026{str(i).zfill(4)}",
            "name": name,
            "phone": f"+9198765{str(random.randint(10000, 99999))}",
            "branch": branch,
            "section": section,
            "source": random.choice(sources),
            "campaign": "Spring Promo 2026",
            "status": status,
            "grade": random.choice(grades),
            "city": random.choice(cities),
            "hair_condition": random.choice(hair_conditions),
            "assigned_to": None,
            "assigned_to_name": None,
            "notes": [
                {
                    "text": "Client inquired about permanent hair extensions.",
                    "author": "Automation",
                    "timestamp": now_iso()
                }
            ],
            "follow_up_date": follow_up_date,
            "follow_up_time": "14:30" if follow_up_date else None,
            "follow_up_type": random.choice(["Call", "WhatsApp", "Visit"]) if follow_up_date else None,
            "is_favorite": random.choice([True, False, False]),
            "created_by": "System Seed",
            "created_at": (today - timedelta(days=random.randint(0, 10))).isoformat() + "Z",
            "updated_at": now_iso()
        }
        
        db.collection("leads").document(lid).set(doc)
        print(f"Created lead: {name} ({status}) -> {branch}/{section}")

    print("Seed complete!")

if __name__ == "__main__":
    seed_leads()
