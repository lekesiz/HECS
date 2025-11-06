.PHONY: help build test clean run install lint fmt

BINARY_NAME=hecs-agent
BUILD_DIR=../build
VERSION?=1.0.0-alpha
COMMIT=$(shell git rev-parse --short HEAD)
BUILD_TIME=$(shell date -u '+%Y-%m-%d_%H:%M:%S')

help: ## Show this help message
	@echo "HECS Agent - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build the agent binary
	@echo "Building HECS Agent..."
	@mkdir -p $(BUILD_DIR)
	go build -ldflags="-X main.Version=$(VERSION) -X main.Commit=$(COMMIT) -X main.BuildTime=$(BUILD_TIME)" \
		-o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/agent
	@echo "✓ Built: $(BUILD_DIR)/$(BINARY_NAME)"

build-linux-arm: ## Build for Raspberry Pi (ARM)
	@echo "Building for Raspberry Pi (ARM64)..."
	@mkdir -p $(BUILD_DIR)
	GOOS=linux GOARCH=arm64 go build -ldflags="-X main.Version=$(VERSION) -X main.Commit=$(COMMIT) -X main.BuildTime=$(BUILD_TIME)" \
		-o $(BUILD_DIR)/$(BINARY_NAME)-arm64 ./cmd/agent
	@echo "✓ Built: $(BUILD_DIR)/$(BINARY_NAME)-arm64"

install: ## Install dependencies
	@echo "Installing dependencies..."
	go mod download
	go mod verify
	@echo "✓ Dependencies installed"

test: ## Run tests
	@echo "Running tests..."
	go test -v -race -coverprofile=coverage.txt -covermode=atomic ./...
	@echo "✓ Tests completed"

test-coverage: ## Run tests with coverage report
	@echo "Running tests with coverage..."
	go test -v -race -coverprofile=coverage.txt -covermode=atomic ./...
	go tool cover -html=coverage.txt -o coverage.html
	@echo "✓ Coverage report: coverage.html"

lint: ## Run linters
	@echo "Running linters..."
	go vet ./...
	golangci-lint run ./...
	@echo "✓ Linting completed"

fmt: ## Format code
	@echo "Formatting code..."
	go fmt ./...
	gofmt -s -w .
	@echo "✓ Code formatted"

clean: ## Clean build artifacts
	@echo "Cleaning..."
	rm -rf $(BUILD_DIR)
	rm -f coverage.txt coverage.html
	go clean
	@echo "✓ Cleaned"

run: ## Run the agent
	@echo "Running HECS Agent..."
	go run ./cmd/agent --config ./config/dev.yaml

run-dev: ## Run with hot reload (requires air)
	@echo "Running with hot reload..."
	air

bench: ## Run benchmarks
	@echo "Running benchmarks..."
	go test -bench=. -benchmem ./...

docker-build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t hecs-agent:$(VERSION) -f ../deployment/docker/Dockerfile.agent .

deps-update: ## Update dependencies
	@echo "Updating dependencies..."
	go get -u ./...
	go mod tidy
	@echo "✓ Dependencies updated"
