import os
from dotenv import load_dotenv
from pathlib import Path
from supabase import create_client, Client

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: SUPABASE_URL or SUPABASE_SERVICE_KEY not set in .env")

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None
