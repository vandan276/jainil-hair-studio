import os
from google.cloud import firestore

# Vercel or local doesn't have credentials? Wait, I'm in the workspace, I can just query the local server if it's running, or check firestore if credentials exist.
