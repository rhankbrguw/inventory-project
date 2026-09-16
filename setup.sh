#!/bin/sh
set -e

if [ ! -f .env ]; then
    echo "Error: .env file not found. Copy .env.example to .env first." >&2
    exit 1
fi

echo "Initializing application environment..."

docker compose exec app composer install --no-interaction --prefer-dist

if ! grep -q "^APP_KEY=base64:" .env; then
    echo "Generating application key..."
    docker compose exec app php artisan key:generate
fi

echo "Running migrations..."
docker compose exec app php artisan migrate --force

echo "Seeding database..."
docker compose exec app php artisan db:seed --force || true

echo "Configuring storage links and permissions..."
docker compose exec app php artisan storage:link || true
docker compose exec app chmod -R 775 storage bootstrap/cache

echo "Clearing application cache..."
docker compose exec app php artisan optimize:clear

echo "Setup completed successfully."
echo "App:     http://localhost:8000"
echo "Mailpit: http://localhost:8025"
