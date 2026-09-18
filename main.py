from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import os

# Import routers from the new Supabase architecture
from backend.routers import auth, leads, products, orders, admin, reports, admin_dashboard, consultations, webhooks

app = FastAPI(title="Jainil Hair Studio API (Supabase Edition)")

# CORS
origins = [
    os.environ.get('FRONTEND_URL', 'http://localhost:3000'),
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
api = APIRouter(prefix="/api")

# Hook up the new modular routers
api.include_router(auth.router)
api.include_router(leads.router)
api.include_router(products.router)
api.include_router(orders.router)
api.include_router(admin.router)
api.include_router(reports.router)
api.include_router(admin_dashboard.router)
api.include_router(consultations.router)
app.include_router(webhooks.router)

# Mount the api router to the main app
app.include_router(api)



