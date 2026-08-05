import os
import json
import sys
from pathlib import Path

try:
    import firebase_admin
    from firebase_admin import credentials, storage
    from google.cloud import storage as gcs_storage
except ImportError:
    print("Error: Required libraries not found. Please run:")
    print("pip install firebase-admin google-cloud-storage")
    sys.exit(1)

def fix_cors():
    # Try to find credentials
    creds_path = None
    possible_paths = [
        "backend/firebase-adminsdk.json",
        "api/firebase-adminsdk.json",
        "firebase-adminsdk.json",
        "eminence-e436f-firebase-adminsdk-fbsvc-44d9c3978a.json"
    ]
    
    for p in possible_paths:
        if os.path.exists(p):
            creds_path = p
            break
            
    if not creds_path:
        print("Error: Could not find firebase-adminsdk.json")
        return

    print(f"Using credentials from: {creds_path}")
    
    # Initialize GCS client
    storage_client = gcs_storage.Client.from_service_account_json(creds_path)
    
    # Auto-detect bucket
    buckets = list(storage_client.list_buckets())
    if not buckets:
        print("Error: No buckets found in this project.")
        return
        
    bucket = buckets[0]
    bucket_name = bucket.name
    print(f"Found bucket: {bucket_name}")

    # Define CORS policy
    cors_policy = [
        {
            "origin": ["*"],
            "method": ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
            "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"],
            "maxAgeSeconds": 3600
        }
    ]

    bucket.cors = cors_policy
    bucket.update()

    print(f"✅ CORS policy updated for bucket: {bucket_name}")
    print("Direct uploads from the browser should now work on Vercel!")

if __name__ == "__main__":
    fix_cors()
