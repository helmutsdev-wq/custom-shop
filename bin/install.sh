#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# Custom Shop — Magento 2 Installation Script
# ──────────────────────────────────────────────
# Run this INSIDE the php container:
#   docker compose exec php bash /var/www/html/bin/install.sh
# ──────────────────────────────────────────────

MAGENTO_VERSION="${MAGENTO_VERSION:-2.4.6-p8}"
COMPOSER_HOME="${COMPOSER_HOME:-/home/magento/.composer}"

MARIADB_DATABASE="${MARIADB_DATABASE:-magento}"
MARIADB_USER="${MARIADB_USER:-magento}"
MARIADB_PASSWORD="${MARIADB_PASSWORD:-magento123}"
MARIADB_ROOT_PASSWORD="${MARIADB_ROOT_PASSWORD:-root123}"

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@custom-shop.local}"
ADMIN_FIRSTNAME="${ADMIN_FIRSTNAME:-Admin}"
ADMIN_LASTNAME="${ADMIN_LASTNAME:-User}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123}"
ADMIN_PATH="${ADMIN_PATH:-admin}"

APP_DOMAIN="${APP_DOMAIN:-custom-shop.local}"

echo ""
echo "  Custom Shop — Magento Installation"
echo "  ───────────────────────────────────"
echo "  Version:    ${MAGENTO_VERSION}"
echo "  Domain:     ${APP_DOMAIN}"
echo "  DB:         ${MARIADB_DATABASE}"
echo ""

if [ ! -f "composer.json" ]; then
    echo "==> Creating Magento project..."
    composer create-project \
        --repository=https://repo.magento.com/ \
        "magento/project-community-edition:${MAGENTO_VERSION}" \
        /tmp/magento-tmp

    shopt -s dotglob
    cp -r /tmp/magento-tmp/* /var/www/html/
    rm -rf /tmp/magento-tmp
    shopt -u dotglob
else
    echo "==> composer.json exists — running composer install..."
    composer install --no-interaction --prefer-dist
fi

echo "==> Setting filesystem permissions..."
find var vendor pub/static pub/media app/etc -type f -exec chmod g+w {} + 2>/dev/null || true
find var vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} + 2>/dev/null || true
chown -R magento:magento /var/www/html

echo "==> Waiting for MariaDB..."
until nc -z mariadb 3306; do sleep 2; done
echo "    MariaDB is ready."

echo "==> Installing Magento..."
bin/magento setup:install \
    --base-url="http://${APP_DOMAIN}/" \
    --base-url-secure="https://${APP_DOMAIN}/" \
    --admin-firstname="${ADMIN_FIRSTNAME}" \
    --admin-lastname="${ADMIN_LASTNAME}" \
    --admin-email="${ADMIN_EMAIL}" \
    --admin-user=admin \
    --admin-password="${ADMIN_PASSWORD}" \
    --backend-frontname="${ADMIN_PATH}" \
    --db-host=mariadb \
    --db-name="${MARIADB_DATABASE}" \
    --db-user="${MARIADB_USER}" \
    --db-password="${MARIADB_PASSWORD}" \
    --search-engine=opensearch \
    --opensearch-host=opensearch \
    --opensearch-port=9200 \
    --opensearch-index-prefix=magento2 \
    --opensearch-enable-auth=0 \
    --session-save=redis \
    --session-save-redis-host=redis \
    --session-save-redis-port=6379 \
    --session-save-redis-db=2 \
    --cache-backend=redis \
    --cache-backend-redis-server=redis \
    --cache-backend-redis-db=0 \
    --cache-backend-redis-port=6379 \
    --page-cache=redis \
    --page-cache-redis-server=redis \
    --page-cache-redis-db=1 \
    --page-cache-redis-port=6379 \
    --amqp-host=rabbitmq \
    --amqp-port=5672 \
    --amqp-user="${RABBITMQ_DEFAULT_USER}" \
    --amqp-password="${RABBITMQ_DEFAULT_PASSWORD}" \
    --use-rewrites=1 \
    --use-secure=0 \
    --use-secure-admin=0 \
    --cleanup-database

echo ""
echo "==> Configuring development mode..."
bin/magento deploy:mode:set developer

echo "==> Disabling modules that are not needed..."
bin/magento module:disable Magento_TwoFactorAuth Magento_AdminAdobeImsTwoFactorAuth || true

echo "==> Configuring GraphQL..."
bin/magento config:set graphql/session/disable_cookie_check 1

echo "==> Configuring mail..."
bin/magento config:set system/smtp/disable 1
bin/magento config:set system/smtp/host mailpit
bin/magento config:set system/smtp/port 1025

echo "==> Reindexing..."
bin/magento indexer:reindex

echo "==> Flushing cache..."
bin/magento cache:flush

echo ""
echo "  ✅ Installation complete!"
echo "  ─────────────────────────"
echo "  Frontend:  http://${APP_DOMAIN}/"
echo "  Admin:     http://${APP_DOMAIN}/${ADMIN_PATH}"
echo "  Admin user: admin / ${ADMIN_PASSWORD}"
echo "  GraphQL:   http://${APP_DOMAIN}/graphql"
echo "  DB Admin:  http://localhost:8080"
echo ""
