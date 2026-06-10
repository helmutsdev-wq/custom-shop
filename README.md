# Custom Shop — Headless Magento 2 + Nuxt 3

A modern, headless e-commerce platform built with **Magento 2.4.6-p8 (LTS)**, **Nuxt 3**, and **GraphQL** — fully containerized with Docker.

## Architecture

```
                     ┌──────────────┐
                     │   Nuxt 3     │  :3000
                     │  (Frontend)  │  (internal only)
                     └──────┬───────┘
                            │ GraphQL
                     ┌──────▼───────┐
                     │   Nginx      │  :80 / :443 (entry point)
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

| Service     | Container    | Port    | Description               |
|-------------|-------------|---------|---------------------------|
| Web Server  | nginx       | 80/443  | Nginx + SSL (entry point) |
| Frontend    | nuxt        | 3000    | Nuxt 3 SSR (internal)     |
| Backend     | php         | 9000    | PHP-FPM 8.2 + Magento     |
| Database    | mariadb     | 3306    | MariaDB 10.6              |
| Search      | opensearch  | 9200    | OpenSearch 2.x            |
| Cache       | redis       | 6379    | Redis 7                   |
| Queue       | rabbitmq    | 5672    | RabbitMQ + Management UI  |
| Mail        | mailpit     | 8025    | SMTP test server + UI     |
| DB Admin    | adminer     | 8080    | Web-based DB admin        |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Magento Marketplace access keys ([get them here](https://marketplace.magento.com/customer/accessKeys/))

### 1. Clone and configure

```bash
git clone git@github.com:helmutsdev-wq/custom-shop.git
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

This runs the interactive installer inside the php container. Wait \~10 minutes for the full installation.

### 5. Install sample data (optional)

```bash
make sample-data
```

Deploys Magento sample data with 181 products across 6 categories.

### 6. Access

| URL                                    | Description            |
|----------------------------------------|------------------------|
| `https://localhost/`                   | Nuxt Storefront (SSR)  |
| `https://localhost/admin`              | Magento Admin          |
| `https://localhost/graphql`            | GraphQL API            |
| `http://localhost:8080`                | Adminer (DB)           |
| `http://localhost:8025`                | Mailpit                |
| `http://localhost:15672`               | RabbitMQ Admin         |

Admin credentials: `admin` / `Admin123`

## Common Commands

```bash
# Docker
make build       # Build images
make up          # Start containers
make down        # Stop containers
make logs        # Tail all logs
make shell       # Shell into php container

# Magento
make mage CMD="cache:flush"       # Run any bin/magento command
make cache-clean                  # Flush cache
make reindex                      # Reindex all
make di-compile                   # DI compilation
make setup-upgrade                # Setup upgrade
make static-deploy                # Deploy static content

# Database
make db-shell                     # MySQL shell
make db-dump                      # Dump database
make db-restore FILE=dump.sql     # Restore database

# Frontend
make frontend-dev                 # Nuxt dev mode (HMR)
make frontend-build               # Production build

# Images
make images-resize                # Pre-generate cached product images
```

## Development

### Hot Module Replacement (HMR)

Nuxt source files in `./frontend/` are bind-mounted into the container. Any changes reflect immediately — no rebuild needed.

```bash
make frontend-dev
```

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

### GraphQL Playground

The Nuxt Apollo client uses two endpoints:
- **SSR (server-side):** `http://nginx/graphql` (internal Docker network)
- **Browser (client-side):** `https://localhost/graphql`

## Project Structure

```
custom-shop/
├── backend/           # Magento 2 root (bind-mounted)
│   ├── app/           # Magento app code
│   ├── pub/           # Public entry point, media, static
│   └── var/           # Generated files (gitignored)
├── frontend/          # Nuxt 3 application (bind-mounted)
│   ├── pages/         # File-based routing
│   ├── components/    # Vue components
│   ├── composables/   # Shared composables
│   ├── stores/        # Pinia state stores
│   ├── graphql/       # GraphQL queries/mutations
│   └── layouts/       # Page layouts
├── docker/            # Docker configs
│   ├── nginx/         # Nginx config + SSL certs
│   └── php/           # PHP Dockerfile + php.ini
├── bin/               # Utility scripts
├── docker-compose.yml
└── Makefile
```

## Features

- **Headless storefront** — Nuxt 3 with Apollo GraphQL, Pinia state management, Tailwind CSS
- **Product browsing** — Category pages with filters, product detail with configurable options
- **Search** — Autocomplete in header, dedicated search results page
- **Shopping cart** — Full cart lifecycle via GraphQL mutations, persisted in Pinia
- **Checkout flow** — Guest checkout with address and payment steps
- **SSL by default** — Self-signed cert for HTTPS localhost development
- **Media fallback** — Missing cached product images generated on-the-fly via Magento's `get.php`
- **6 categories** — Women, Men, Gear, Training, Sale, What's New (with sample data)

## Why This Stack?

- **Magento 2.4.6-p8 LTS** — Enterprise-grade e-commerce with long-term support
- **Nuxt 3** — Modern Vue 3 framework with SSR, file-based routing, and excellent DX
- **GraphQL** — Magento's native GraphQL API for headless storefronts
- **MariaDB** — Proven, performant relational database
- **Docker** — Reproducible environment, easy onboarding

## License

MIT
