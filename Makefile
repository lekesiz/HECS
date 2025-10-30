.PHONY: help install dev build test lint clean docker-up docker-down deploy

# Variables
PYTHON := python3
GO := go
RUST := cargo
NPM := npm
DOCKER := docker
DOCKER_COMPOSE := docker-compose

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)HECS - Haguenau Edge Control System$(NC)"
	@echo "$(GREEN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	@echo "Installing Python dependencies..."
	cd control-plane/api && $(PYTHON) -m pip install -r requirements.txt
	@echo "Installing Node dependencies..."
	cd control-plane/ui && $(NPM) install
	@echo "Installing Go dependencies..."
	cd agent && $(GO) mod download
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

dev: ## Start development environment
	@echo "$(GREEN)Starting development environment...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✓ Development environment started$(NC)"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "Grafana: http://localhost:3001"
	@echo "Prometheus: http://localhost:9090"

build: ## Build all components
	@echo "$(GREEN)Building all components...$(NC)"
	@echo "Building backend..."
	cd control-plane/api && $(PYTHON) -m build
	@echo "Building frontend..."
	cd control-plane/ui && $(NPM) run build
	@echo "Building agent..."
	cd agent && $(GO) build -o ../build/hecs-agent ./cmd/agent
	@echo "$(GREEN)✓ All components built$(NC)"

test: ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"
	@echo "Testing backend..."
	cd control-plane/api && $(PYTHON) -m pytest tests/ -v
	@echo "Testing frontend..."
	cd control-plane/ui && $(NPM) test -- --watchAll=false
	@echo "Testing agent..."
	cd agent && $(GO) test -v ./...
	@echo "$(GREEN)✓ All tests passed$(NC)"

test-coverage: ## Run tests with coverage
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	cd control-plane/api && $(PYTHON) -m pytest tests/ --cov=. --cov-report=html
	cd control-plane/ui && $(NPM) test -- --coverage --watchAll=false
	cd agent && $(GO) test -v -coverprofile=coverage.out ./...
	@echo "$(GREEN)✓ Coverage reports generated$(NC)"

lint: ## Run linters
	@echo "$(GREEN)Running linters...$(NC)"
	@echo "Linting Python..."
	cd control-plane/api && $(PYTHON) -m flake8 . && $(PYTHON) -m black --check .
	@echo "Linting TypeScript..."
	cd control-plane/ui && $(NPM) run lint
	@echo "Linting Go..."
	cd agent && $(GO) vet ./... && golangci-lint run
	@echo "$(GREEN)✓ All linters passed$(NC)"

format: ## Format code
	@echo "$(GREEN)Formatting code...$(NC)"
	cd control-plane/api && $(PYTHON) -m black .
	cd control-plane/ui && $(NPM) run format
	cd agent && $(GO) fmt ./...
	@echo "$(GREEN)✓ Code formatted$(NC)"

clean: ## Clean build artifacts
	@echo "$(GREEN)Cleaning build artifacts...$(NC)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "build" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	cd agent && $(GO) clean
	@echo "$(GREEN)✓ Build artifacts cleaned$(NC)"

docker-build: ## Build Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	$(DOCKER_COMPOSE) build
	@echo "$(GREEN)✓ Docker images built$(NC)"

docker-up: ## Start Docker containers
	@echo "$(GREEN)Starting Docker containers...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✓ Docker containers started$(NC)"

docker-down: ## Stop Docker containers
	@echo "$(GREEN)Stopping Docker containers...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ Docker containers stopped$(NC)"

docker-logs: ## Show Docker logs
	$(DOCKER_COMPOSE) logs -f

docker-ps: ## Show running containers
	$(DOCKER_COMPOSE) ps

db-migrate: ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	cd control-plane/api && alembic upgrade head
	@echo "$(GREEN)✓ Migrations applied$(NC)"

db-rollback: ## Rollback last migration
	@echo "$(GREEN)Rolling back last migration...$(NC)"
	cd control-plane/api && alembic downgrade -1
	@echo "$(GREEN)✓ Migration rolled back$(NC)"

db-reset: ## Reset database
	@echo "$(RED)⚠ This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(DOCKER_COMPOSE) down -v; \
		$(DOCKER_COMPOSE) up -d postgres; \
		sleep 5; \
		cd control-plane/api && alembic upgrade head; \
		echo "$(GREEN)✓ Database reset$(NC)"; \
	fi

seed-db: ## Seed database with test data
	@echo "$(GREEN)Seeding database...$(NC)"
	cd control-plane/api && $(PYTHON) scripts/seed_db.py
	@echo "$(GREEN)✓ Database seeded$(NC)"

agent-build: ## Build HECS agent
	@echo "$(GREEN)Building HECS agent...$(NC)"
	cd agent && $(GO) build -o ../build/hecs-agent ./cmd/agent
	@echo "$(GREEN)✓ Agent built: build/hecs-agent$(NC)"

agent-run: ## Run HECS agent locally
	@echo "$(GREEN)Running HECS agent...$(NC)"
	cd build && ./hecs-agent --config ../agent/config/dev.yaml

image-build: ## Build Raspberry Pi image
	@echo "$(GREEN)Building Raspberry Pi image...$(NC)"
	cd edge-os && sudo ./build-image.sh
	@echo "$(GREEN)✓ Image built: edge-os/hecs-agent-v1.0.0.img$(NC)"

deploy-staging: ## Deploy to staging
	@echo "$(GREEN)Deploying to staging...$(NC)"
	./deployment/scripts/deploy-staging.sh
	@echo "$(GREEN)✓ Deployed to staging$(NC)"

deploy-prod: ## Deploy to production
	@echo "$(RED)⚠ Deploying to PRODUCTION!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		./deployment/scripts/deploy-prod.sh; \
		echo "$(GREEN)✓ Deployed to production$(NC)"; \
	fi

docs: ## Generate documentation
	@echo "$(GREEN)Generating documentation...$(NC)"
	cd control-plane/api && $(PYTHON) -m mkdocs build
	cd agent && $(GO) doc -all > ../docs/agent-api.md
	@echo "$(GREEN)✓ Documentation generated$(NC)"

docs-serve: ## Serve documentation locally
	@echo "$(GREEN)Serving documentation...$(NC)"
	cd control-plane/api && $(PYTHON) -m mkdocs serve

security-scan: ## Run security scans
	@echo "$(GREEN)Running security scans...$(NC)"
	@echo "Scanning Python dependencies..."
	cd control-plane/api && $(PYTHON) -m safety check
	@echo "Scanning Node dependencies..."
	cd control-plane/ui && $(NPM) audit
	@echo "Scanning Go dependencies..."
	cd agent && $(GO) list -json -m all | nancy sleuth
	@echo "$(GREEN)✓ Security scans completed$(NC)"

benchmark: ## Run performance benchmarks
	@echo "$(GREEN)Running benchmarks...$(NC)"
	cd agent && $(GO) test -bench=. -benchmem ./...
	@echo "$(GREEN)✓ Benchmarks completed$(NC)"

ci: lint test ## Run CI checks (lint + test)
	@echo "$(GREEN)✓ All CI checks passed$(NC)"

setup: install db-migrate seed-db ## Initial project setup
	@echo "$(GREEN)✓ Project setup completed$(NC)"

status: ## Show project status
	@echo "$(BLUE)HECS Project Status$(NC)"
	@echo ""
	@echo "$(GREEN)Docker Containers:$(NC)"
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "$(GREEN)Git Status:$(NC)"
	@git status -s
	@echo ""
	@echo "$(GREEN)Recent Commits:$(NC)"
	@git log --oneline -5

version: ## Show version information
	@echo "$(BLUE)HECS Version Information$(NC)"
	@echo "Python: $$($(PYTHON) --version)"
	@echo "Go: $$($(GO) version)"
	@echo "Node: $$(node --version)"
	@echo "npm: $$($(NPM) --version)"
	@echo "Docker: $$($(DOCKER) --version)"
	@echo "Docker Compose: $$($(DOCKER_COMPOSE) --version)"
