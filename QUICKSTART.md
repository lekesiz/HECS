# 🚀 HECS Quick Start Guide

Ce guide vous permettra de démarrer rapidement avec le projet HECS.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé:

- **Docker** (20.10+) et **Docker Compose** (2.0+)
- **Python** 3.11+
- **Go** 1.21+
- **Node.js** 18+
- **Git**
- **Make** (optionnel mais recommandé)

---

## ⚡ Démarrage Rapide (5 minutes)

### Option 1: Avec Make (Recommandé)

```bash
# 1. Cloner le repository
git clone https://github.com/lekesiz/HECS.git
cd HECS

# 2. Setup complet (install + migrate + seed)
make setup

# 3. Démarrer l'environnement de développement
make dev

# 4. Accéder aux services
# Backend API: http://localhost:8000
# Frontend UI: http://localhost:3000
# API Docs: http://localhost:8000/docs
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

### Option 2: Sans Make

```bash
# 1. Cloner le repository
git clone https://github.com/lekesiz/HECS.git
cd HECS

# 2. Créer fichier .env
cp .env.example .env
# Éditer .env avec vos paramètres

# 3. Démarrer avec Docker Compose
docker-compose up -d

# 4. Attendre que tous les services soient prêts
docker-compose ps

# 5. Appliquer les migrations
docker-compose exec backend alembic upgrade head

# 6. (Optionnel) Seed la base de données
docker-compose exec backend python scripts/seed_db.py
```

---

## 🏗️ Structure du Projet

```
HECS/
├── agent/                      # HECS Agent (Go/Rust)
│   ├── cmd/                   # Entry points
│   ├── core/                  # Core functionality
│   ├── modules/               # Modular components
│   └── config/                # Configuration
├── control-plane/             # Control Plane
│   ├── api/                  # FastAPI backend
│   │   ├── routes/           # API endpoints
│   │   ├── models/           # Database models
│   │   ├── services/         # Business logic
│   │   └── tests/            # Backend tests
│   ├── ui/                   # React frontend
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── pages/        # Page components
│   │   │   ├── hooks/        # Custom hooks
│   │   │   └── utils/        # Utilities
│   │   └── tests/            # Frontend tests
│   └── database/             # Database schemas
├── edge-os/                   # Custom OS images
├── deployment/                # Deployment configs
│   ├── docker/               # Dockerfiles
│   ├── kubernetes/           # K8s manifests
│   ├── monitoring/           # Monitoring configs
│   └── scripts/              # Deployment scripts
├── docs/                      # Documentation
├── tests/                     # Integration & E2E tests
└── scripts/                   # Utility scripts
```

---

## 🔧 Commandes Utiles

### Développement

```bash
# Démarrer l'environnement de dev
make dev

# Voir les logs
make docker-logs

# Arrêter l'environnement
make docker-down

# Rebuilder les images
make docker-build

# Voir le statut
make status
```

### Tests

```bash
# Lancer tous les tests
make test

# Tests avec coverage
make test-coverage

# Tests backend uniquement
cd control-plane/api && pytest tests/ -v

# Tests frontend uniquement
cd control-plane/ui && npm test

# Tests agent uniquement
cd agent && go test -v ./...
```

### Linting & Formatting

```bash
# Linter tout le code
make lint

# Formatter tout le code
make format

# Linter backend
cd control-plane/api && flake8 . && black --check .

# Linter frontend
cd control-plane/ui && npm run lint

# Linter agent
cd agent && golangci-lint run
```

### Base de Données

```bash
# Appliquer les migrations
make db-migrate

# Rollback dernière migration
make db-rollback

# Reset complet de la DB (⚠️ perte de données)
make db-reset

# Seed avec données de test
make seed-db
```

### Build

```bash
# Build tous les composants
make build

# Build agent uniquement
make agent-build

# Build image Raspberry Pi
make image-build
```

---

## 🎯 Premiers Pas

### 1. Créer un Compte Admin

```bash
# Via API
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@netz.fr",
    "password": "SecurePassword123!",
    "role": "admin"
  }'

# Ou via UI
open http://localhost:3000/register
```

### 2. Se Connecter

```bash
# Via API
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@netz.fr",
    "password": "SecurePassword123!"
  }'

# Sauvegarder le token JWT retourné
export TOKEN="eyJ..."

# Ou via UI
open http://localhost:3000/login
```

### 3. Enregistrer un Device

```bash
curl -X POST http://localhost:8000/api/v1/devices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Device",
    "location": "Office",
    "hardware_id": "rpi4-001"
  }'
```

### 4. Lister les Devices

```bash
curl http://localhost:8000/api/v1/devices \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Monitoring

### Accéder aux Dashboards

- **Grafana:** http://localhost:3001
  - Username: `admin`
  - Password: `admin` (changez-le au premier login)

- **Prometheus:** http://localhost:9090

- **API Metrics:** http://localhost:8000/metrics

### Dashboards Disponibles

1. **System Overview:** Vue d'ensemble du système
2. **Device Monitoring:** Monitoring des devices edge
3. **API Performance:** Performances des API
4. **Database Metrics:** Métriques PostgreSQL

---

## 🐛 Debugging

### Voir les Logs

```bash
# Tous les services
make docker-logs

# Service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Accéder à un Container

```bash
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec postgres psql -U hecs -d hecs
```

### Problèmes Courants

#### Port déjà utilisé

```bash
# Trouver le processus utilisant le port
sudo lsof -i :8000

# Tuer le processus
kill -9 <PID>
```

#### Containers ne démarrent pas

```bash
# Nettoyer et redémarrer
docker-compose down -v
docker-compose up -d --build
```

#### Erreurs de migration

```bash
# Reset la DB et réappliquer
make db-reset
```

---

## 🚀 Développer une Nouvelle Feature

### Workflow Recommandé

1. **Créer une branche**
   ```bash
   git checkout -b feature/ma-nouvelle-feature
   ```

2. **Utiliser YAGO pour générer le code** (optionnel)
   ```bash
   # Voir docs/YAGO_INTEGRATION.md
   ```

3. **Développer**
   - Backend: `control-plane/api/`
   - Frontend: `control-plane/ui/`
   - Agent: `agent/`

4. **Tester**
   ```bash
   make test
   make lint
   ```

5. **Commit**
   ```bash
   git add .
   git commit -m "feat: ma nouvelle feature"
   ```

6. **Push et créer PR**
   ```bash
   git push origin feature/ma-nouvelle-feature
   # Créer PR sur GitHub
   ```

---

## 📚 Documentation Complète

- [Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Guide Développeur](docs/DEVELOPER_GUIDE.md)
- [Guide Utilisateur](docs/USER_GUIDE.md)
- [Sécurité](docs/SECURITY.md)
- [Déploiement](docs/DEPLOYMENT.md)
- [Intégration YAGO](docs/YAGO_INTEGRATION.md)
- [Étude de Faisabilité](docs/FEASIBILITY_STUDY.md)

---

## 🆘 Besoin d'Aide?

- **Documentation:** Consultez le dossier `docs/`
- **Issues:** Créez une issue sur GitHub
- **Email:** support@netz.fr
- **Slack:** #hecs-dev (équipe interne)

---

## 📝 Prochaines Étapes

1. ✅ Lire la [documentation complète](docs/)
2. ✅ Explorer l'[API](http://localhost:8000/docs)
3. ✅ Consulter le [guide développeur](docs/DEVELOPER_GUIDE.md)
4. ✅ Rejoindre le channel Slack #hecs-dev
5. ✅ Participer au prochain daily standup

---

**Bon développement! 🚀**
