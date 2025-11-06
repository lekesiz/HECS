#!/bin/bash

# HECS Secret Generation Script
# This script generates secure random secrets for the HECS platform

set -e

echo "🔐 HECS Secret Generation"
echo "=========================="
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  Warning: .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
    # Backup existing .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✓ Backed up existing .env"
fi

echo "Generating secure secrets..."
echo ""

# Generate secrets
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr -d '=')
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr -d '=')
MQTT_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr -d '=')
GRAFANA_PASSWORD=$(openssl rand -base64 16 | tr -d '\n' | tr -d '=')

# Create .env file
cat > .env << EOF
# HECS Environment Variables
# Generated on: $(date)
# ⚠️  Keep this file secure and never commit it to version control!

# Environment
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# Application
APP_NAME=HECS Control Plane
APP_VERSION=1.0.0-alpha
API_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql+asyncpg://hecs:${POSTGRES_PASSWORD}@postgres:5432/hecs
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DB_ECHO=false
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10

# Redis
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_MAX_CONNECTIONS=50

# MQTT
MQTT_BROKER=mqtt://mqtt:1883
MQTT_USERNAME=hecs
MQTT_PASSWORD=${MQTT_PASSWORD}
MQTT_CLIENT_ID=hecs-backend

# Security & Authentication
JWT_SECRET_KEY=${JWT_SECRET}
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Password hashing
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
CORS_ALLOW_CREDENTIALS=true

# Haguenau.pro Integration
HAGUENAU_API_URL=https://api.haguenau.pro
HAGUENAU_API_KEY=YOUR_HAGUENAU_API_KEY_HERE
HAGUENAU_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# File Upload
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=/app/uploads

# Monitoring
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090

# Grafana
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}

# Logging
LOG_FORMAT=json
LOG_FILE=/app/logs/hecs.log

# Background Tasks
CELERY_BROKER_URL=redis://:${REDIS_PASSWORD}@redis:6379/1
CELERY_RESULT_BACKEND=redis://:${REDIS_PASSWORD}@redis:6379/2
EOF

echo "✅ Secrets generated successfully!"
echo ""
echo "📋 Summary:"
echo "  - JWT Secret: ✓ (64 bytes)"
echo "  - PostgreSQL Password: ✓ (32 bytes)"
echo "  - Redis Password: ✓ (32 bytes)"
echo "  - MQTT Password: ✓ (32 bytes)"
echo "  - Grafana Password: ✓ (16 bytes)"
echo ""
echo "📄 .env file created in project root"
echo ""
echo "⚠️  IMPORTANT:"
echo "  1. Never commit .env to git (already in .gitignore)"
echo "  2. Update HAGUENAU_API_KEY with your actual API key"
echo "  3. Change ENVIRONMENT=production for production deployment"
echo "  4. Consider using a secret manager (Vault, AWS Secrets Manager) for production"
echo ""
echo "🚀 You can now run: make dev"
