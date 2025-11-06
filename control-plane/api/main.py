"""
HECS Control Plane - Main Application
"""
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from datetime import datetime
import os

from database import init_db, close_db
from routes import auth, devices, tasks, customers, websocket

# Version info
VERSION = os.getenv("APP_VERSION", "1.0.0-alpha")
APP_NAME = os.getenv("APP_NAME", "HECS Control Plane")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 Starting HECS Control Plane...")
    try:
        await init_db()
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️  Database initialization failed: {e}")

    yield

    # Shutdown
    print("🛑 Shutting down HECS Control Plane...")
    await close_db()
    print("✅ Database connections closed")

# Create FastAPI app
app = FastAPI(
    title=APP_NAME,
    description="HECS (Haguenau Edge Control System) Control Plane API",
    version=VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(devices.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(customers.router, prefix="/api/v1")
app.include_router(websocket.router)  # WebSocket has no prefix (uses /ws)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "name": APP_NAME,
        "version": VERSION,
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": VERSION,
    }


@app.get("/api/v1/status", tags=["API"])
async def api_status():
    """API status endpoint"""
    return {
        "api_version": "v1",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "docs": "/api/docs",
            "redoc": "/api/redoc",
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/metrics", tags=["Monitoring"])
async def metrics():
    """Prometheus metrics endpoint (placeholder)"""
    # TODO: Implement proper Prometheus metrics
    return {"message": "Metrics endpoint - to be implemented"}


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "Not Found",
            "message": f"The requested resource was not found",
            "path": str(request.url.path),
        },
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
        },
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
