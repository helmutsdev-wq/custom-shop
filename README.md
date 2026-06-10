# Custom Shop — Headless Magento 2 + Nuxt 3

A modern, headless e-commerce platform built with **Magento 2.4.6 (LTS)**, **Nuxt 3**, and **GraphQL** — fully containerized with Docker.

## Architecture

```
                    ┌──────────────┐
                    │   Nuxt 3     │  :3000
                    │  (Frontend)  │
                    └──────┬───────┘
                           │ GraphQL
                    ┌──────▼───────┐
                    │   Nginx      │  :80 / :443
                    └──────┬───────┘
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼────┐ ┌────▼───┐ ┌──────▼──────┐
       │  PHP-FPM  │ │ Redis  │ │  RabbitMQ   │
       │ (Magento) │ │  Cache │ │   Message   │
       └──────┬────┘ │  Sess  │ │    Queue    │
              │      └────────┘ └─────────────┘
       ┌──────▼──────┐
       │   MariaDB   │
       └─────────────┘
```

## Services

| Service     | Container    | Port  | Description               |
|-------------|-------------|-------|---------------------------|
| Frontend    | nuxt        | 3000  | Nuxt 3 (SSR)              |
| Web Server  | nginx       | 80    | Nginx + SSL               |
| Backend     | php         | 9000  | PHP-FPM 8.2 + Magento     |
| Database    | mariadb     | 3306  | MariaDB 10.6              |
| Search      | opensearch  | 9200  | OpenSearch 2.x            |
| Cache       | redis       | 6379  | Redis 7                   |
| Queue       | rabbitmq    | 5672  | RabbitMQ + Management UI  |
| Mail        | mailpit     | 8025  | SMTP test server + UI     |
| DB Admin    | adminer     | 8080  | Web-based DB admin        |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Magento Marketplace access keys ([get them here](https://marketplace.magento.com/customer/accessKeys/))

### 1. Clone and configure

```bash
git clone <repo-url> custom-shop
cd custom-shop
cp .env.example .env
```

Edit `.env` and set your Magento authentication keys:

```env
MAGENTO_REPO_PUBLIC_KEY=your_public_key
MAGENTO_REPO_PRIVATE_KEY=your_private_key
```

### 2. Set up composer auth

```bash
make composer-auth
```

Then edit `auth.json` and paste your Magento Marketplace keys.

### 3. Build and start

```bash
make build
make up
```

### 4. Install Magento

```bash
make magento-install
```

This runs the interactive script inside the php container. Wait ~10 minutes for the full installation.

### 5. Access the stores

| URL                          | Description       |
|------------------------------|-------------------|
| `http://custom-shop.local`  | Magento Frontend  |
| `http://custom-shop.local/admin` | Magento Admin |
| `http://custom-shop.local/graphql` | GraphQL API  |
| `http://localhost:3000`     | Nuxt Frontend     |
| `http://localhost:8080`     | Adminer (DB)      |
| `http://localhost:8025`     | Mailpit           |
| `http://localhost:15672`    | RabbitMQ Admin    |

## Common Commands

```bash
# Docker
make build       # Build images
make up          # Start containers
make down        # Stop containers
make logs        # Tail all logs

# Magento
make mage CMD="cache:flush"       # Run any bin/magento command
make cache-clean                  # Flush cache
make reindex                      # Reindex
make di-compile                   # DI compilation
make setup-upgrade                # Setup upgrade

# Database
make db-shell                     # MySQL shell
make db-dump                      # Dump database
make db-restore FILE=dump.sql     # Restore database

# Frontend
make frontend-dev                 # Nuxt dev mode (HMR)
make frontend-build               # Production build
```

## Development

### Adding a custom Magento module

```bash
# Create module structure
mkdir -p backend/app/code/CustomShop/Example

# Enable it
make module-enable MOD=CustomShop_Example
make setup-upgrade
```

### Xdebug

Enable for PHPStorm / VS Code:

```bash
make xdebug-enable
```

Then set a breakpoint and trigger a request with `XDEBUG_TRIGGER=1` cookie or query param.

## Why This Stack?

- **Magento 2.4.6 LTS** — Enterprise-grade e-commerce with long-term support
- **Nuxt 3** — Modern Vue 3 framework with SSR, file-based routing, and excellent DX
- **GraphQL** — Magento's native GraphQL API for headless storefronts
- **MariaDB** — Proven, performant relational database
- **Docker** — Reproducible environment, easy onboarding

## License

MIT
