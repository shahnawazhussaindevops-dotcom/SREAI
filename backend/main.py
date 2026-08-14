from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db, async_session
from app.routers import auth, dashboard, services, incidents, cost, security, simulations, automation, ai, servers, websockets
from app.services.telemetry import collect_metrics
import asyncio


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and seed data
    await init_db()
    async with async_session() as session:
        from app.seed import seed_database
        seeded = await seed_database(session)
        if seeded:
            print("[OK] Database seeded with demo data")
        else:
            print("[INFO] Database already contains data, skipping seed")
    # Startup: spawn the telemetry collector
    telemetry_task = asyncio.create_task(collect_metrics())
    yield
    # Shutdown
    telemetry_task.cancel()
    # Shutdown
    print("SREAI shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Site Reliability Engineering Platform",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(cost.router, prefix="/api")
app.include_router(security.router, prefix="/api")
app.include_router(simulations.router, prefix="/api")
app.include_router(automation.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(servers.router, prefix="/api")
app.include_router(websockets.router)
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME, "version": settings.APP_VERSION}
