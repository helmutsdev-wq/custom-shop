.DEFAULT_GOAL := help

.PHONY: help build up down install magento-setup frontend-dev shell bash logs ps \
        cache-clean reindex di-compile setup-upgrade

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Docker Lifecycle ──────────────────────────

build: ## Build all Docker images
	docker compose build

up: ## Start all services (detached)
	docker compose up -d

down: ## Stop and remove all containers
	docker compose down

down-v: ## Stop and remove containers + volumes (⚠️ deletes data)
	docker compose down -v

ps: ## Show running containers
	docker compose ps

logs: ## Tail logs from all services
	docker compose logs -f

logs-php: ## Tail PHP logs
	docker compose logs -f php

logs-nuxt: ## Tail Nuxt logs
	docker compose logs -f nuxt

# ─── Magento ────────────────────────────────────

magento-install: ## Install Magento (run after composer auth is set up)
	docker compose exec php bash /var/www/html/bin/install.sh

magento-shell: ## Open a bash shell in the PHP container
	docker compose exec php bash

magento-bash: ## Alias for magento-shell
	docker compose exec php bash

magento-mage: ## Run bin/magento (usage: make mage CMD="cache:flush")
	docker compose exec php php bin/magento $(CMD)

mage: ## Alias for magento-mage
	docker compose exec php php bin/magento $(CMD)

cache-clean: ## Flush Magento cache
	docker compose exec php php bin/magento cache:clean

cache-flush: ## Flush Magento cache
	docker compose exec php php bin/magento cache:flush

reindex: ## Reindex all indexes
	docker compose exec php php bin/magento indexer:reindex

di-compile: ## Run DI compilation
	docker compose exec php php bin/magento setup:di:compile

setup-upgrade: ## Run setup upgrade and compile
	docker compose exec php php bin/magento setup:upgrade --keep-generated

deploy-static: ## Deploy static content
	docker compose exec php php bin/magento setup:static-content:deploy -f

admin-fix: ## Fix broken admin styles after module changes (deploy static + flush cache)
	docker compose exec php php bin/magento setup:static-content:deploy -f
	docker compose exec php php bin/magento cache:flush

module-enable: ## Enable a module (usage: make module-enable MOD=My_Module)
	docker compose exec php php bin/magento module:enable $(MOD)

module-disable: ## Disable a module (usage: make module-disable MOD=My_Module)
	docker compose exec php php bin/magento module:disable $(MOD)

# ─── Composer ───────────────────────────────────

composer-install: ## Run composer install
	docker compose exec php composer install --no-interaction --prefer-dist

composer-update: ## Run composer update
	docker compose exec php composer update --no-interaction

composer-require: ## Require a package (usage: make composer-require PKG=namespace/package)
	docker compose exec php composer require $(PKG)

# ─── Database ───────────────────────────────────

db-dump: ## Dump Magento database to file
	docker compose exec mariadb mysqldump -u$$MARIADB_USER -p$$MARIADB_PASSWORD $$MARIADB_DATABASE > dump.sql

db-restore: ## Restore Magento database from file (usage: make db-restore FILE=dump.sql)
	docker compose exec -T mariadb mysql -u$$MARIADB_USER -p$$MARIADB_PASSWORD $$MARIADB_DATABASE < $(FILE)

db-shell: ## Open MariaDB shell
	docker compose exec mariadb mysql -u$$MARIADB_USER -p$$MARIADB_PASSWORD $$MARIADB_DATABASE

# ─── Frontend ───────────────────────────────────

frontend-dev: ## Start Nuxt dev mode with HMR
	cd frontend && npm run dev

frontend-build: ## Build Nuxt for production
	cd frontend && npm run build

frontend-lint: ## Lint frontend code
	cd frontend && npm run lint

frontend-typecheck: ## Type-check frontend code
	cd frontend && npm run typecheck

# ─── Xdebug ─────────────────────────────────────

xdebug-enable: ## Enable Xdebug
	docker compose exec php bash -c 'echo "xdebug.mode=debug,develop" > /usr/local/etc/php/conf.d/xdebug.ini && pkill -USR2 php-fpm'

xdebug-disable: ## Disable Xdebug
	docker compose exec php bash -c 'echo "xdebug.mode=off" > /usr/local/etc/php/conf.d/xdebug.ini && pkill -USR2 php-fpm'

# ─── Utilities ──────────────────────────────────

composer-auth: ## Copy auth.json from template
	cp auth.json.template auth.json

composer-auth-edit: ## Edit auth.json with your Magento keys
	@echo "Edit auth.json with your Magento marketplace keys"
	@echo "  Public key:  your public key"
	@echo "  Private key: your private key"
