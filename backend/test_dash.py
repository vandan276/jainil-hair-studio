from datetime import datetime
docs = [
    {"status": "new", "follow_up_date": "2026-05-04"},
    {"status": "converted"},
    {"status": "dead"}
]
today = "2026-05-04"
stats = {
    "open": {
        "overdues": len([d for d in docs if d.get("follow_up_date") and d.get("follow_up_date") < today and d.get("status") not in ["converted", "dead"]]),
        "due_today": len([d for d in docs if d.get("follow_up_date") == today and d.get("status") not in ["converted", "dead"]]),
        "total_assigned": len(docs),
        "opportunities": len([d for d in docs if d.get("grade") in ["Hot", "Warm"] and d.get("status") not in ["converted", "dead"]]),
    }
}
print(stats)
