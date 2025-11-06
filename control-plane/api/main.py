"""
HECS Control Plane - Main Application
"""
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime
import os

# Version info
VERSION = os.getenv("APP_VERSION", "1.0.0-alpha")
APP_NAME = os.getenv("APP_NAME", "HECS Control Plane")

# Create FastAPI app
app = FastAPI(
    title=APP_NAME,
    description="HECS (Haguenau Edge Control System) Control Plane API",
    version=VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
