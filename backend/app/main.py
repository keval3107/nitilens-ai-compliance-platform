"""
NitiLens FastAPI Application Entry Point

Run with:
    uvicorn app.main:app --reload --port 8000

API docs available at:
    http://localhost:8000/docs  (Swagger UI)
    http://localhost:8000/redoc (ReDoc)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.policies import router as policies_router
from app.api.datasets import router as datasets_router
from app.api.compliance import router as compliance_router
from app.api.reviews import router as reviews_router
from app.core.scheduler import start_scheduler, stop_scheduler

app = FastAPI(
    title="NitiLens — AI Compliance Platform",
    description=(
        "API for the NitiLens AI-powered policy compliance platform. "
        "Ingests AML/GDPR policy PDFs, extracts rules, and scans "
        "IBM AML transaction data for compliance violations."
    ),
    version="1.0.0",
    contact={"name": "NitiLens Team", "url": "https://github.com/GDG-Cloud-New-Delhi/hackfest-2.0"},
    license_info={"name": "MIT"},
)

# Allow the Vite dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(policies_router)
app.include_router(datasets_router)
app.include_router(compliance_router)
app.include_router(reviews_router)


@app.on_event("startup")
async def on_startup():
    start_scheduler()


@app.on_event("shutdown")
async def on_shutdown():
    stop_scheduler()


@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "NitiLens API",
        "version": "1.0.0",
        "docs": "/docs",
        "dataset": "IBM AML Transactions (CDLA-Sharing-1.0)",
    }


@app.get("/api", tags=["Health"])
def api_root():
    return {
        "endpoints": {
            "policies": "/api/policies",
            "datasets": "/api/datasets",
            "compliance": "/api/compliance",
            "reviews": "/api/reviews",
        }
    }
