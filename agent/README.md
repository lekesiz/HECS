# HECS Agent

HECS Agent is the edge component that runs on Raspberry Pi devices in customer networks.

## Features

- 🔒 Secure communication with control plane
- 📊 Real-time metrics and monitoring
- 🔄 Auto-update capability (GitOps)
- 🎯 Task execution engine
- 🌐 MQTT messaging
- 💾 Local data caching

## Building

```bash
# Build for local development
make build

# Build for Raspberry Pi (ARM64)
make build-linux-arm

# Run tests
make test

# Run with hot reload
make run-dev
```

## Running

```bash
# Run with default config
./hecs-agent

# Run with custom config
./hecs-agent --config ./config/custom.yaml

# Run in development mode
make run
```

## Configuration

Configuration is loaded from YAML files. See `config/default.yaml` for all available options.

Environment variables can override config values:
- `HECS_AGENT_ID` - Agent ID
- `HECS_LOG_LEVEL` - Log level (debug, info, warn, error)
- `HECS_CONTROL_PLANE_URL` - Control plane URL
- `HECS_MQTT_BROKER` - MQTT broker URL

## API Endpoints

The agent exposes the following HTTP endpoints:

- `GET /health` - Health check (returns 200 if healthy)
- `GET /ready` - Readiness check
- `GET /version` - Version information
- `GET /metrics` - Prometheus metrics

## Development

```bash
# Install dependencies
make install

# Run linters
make lint

# Format code
make fmt

# Run tests with coverage
make test-coverage

# Build Docker image
make docker-build
```

## Architecture

```
┌─────────────────────────────────┐
│       HECS Agent                │
│                                 │
│  ┌──────────┐   ┌───────────┐  │
│  │  HTTP    │   │   MQTT    │  │
│  │  Server  │   │  Client   │  │
│  └──────────┘   └───────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │   Task Executor          │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │   Local Storage          │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
         │             │
         ▼             ▼
  Control Plane    MQTT Broker
```

## License

Proprietary - Netz Informatique
