#!/bin/bash

# A script to initialize the application after 'docker-compose up'.

echo -e "\n========================================"
echo " Post-Docker Setup Script"
echo "========================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please run: cp .env.example .env"
    exit 1
fi

# Check if APP_KEY already exists
APP_KEY_VALUE=$(grep "^APP_KEY=" .env | cut -d '=' -f2)

if [ ! -z "$APP_KEY_VALUE" ] && [ "$APP_KEY_VALUE" != "" ]; then
    echo "⚠️  Warning: APP_KEY already exists in .env"
    echo "Current value: $APP_KEY_VALUE"
    read -p "Do you want to regenerate it? This will invalidate existing encrypted data. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        SKIP_KEY_GENERATION=true
    fi
fi

echo -e "\nThis script will run the initial setup steps."
echo "Ensure all containers are in the 'Up' state before proceeding."
echo ""
read -p "Press Enter to continue..."

echo -e "\n[STEP 1] Checking container status..."
docker-compose ps
echo ""
read -p "Verify all services are 'Up', then press Enter to continue..."

echo -e "\n⏳ Waiting 30 seconds for MySQL to initialize..."
sleep 30

echo -e "\n[STEP 2] Installing Composer dependencies..."
docker-compose exec app composer install
if [ $? -ne 0 ]; then
    echo "❌ Composer install failed!"
    exit 1
fi
echo "✓ Done"

echo -e "\n[STEP 3] Generating Application Key..."
if [ "$SKIP_KEY_GENERATION" = true ]; then
    echo "⏭️  Skipped (keeping existing key)"
else
    docker-compose exec app php artisan key:generate
    if [ $? -ne 0 ]; then
        echo "❌ Key generation failed!"
        exit 1
    fi
    echo "✓ Done"
fi

echo -e "\n[STEP 4] Running database migrations..."
docker-compose exec app php artisan migrate --force
if [ $? -ne 0 ]; then
    echo "❌ Migration failed! Check database connection."
    echo "Try running: docker-compose logs mysql"
    exit 1
fi
echo "✓ Done"

echo -e "\n[STEP 5] Seeding the database..."
docker-compose exec app php artisan db:seed --force
if [ $? -ne 0 ]; then
    echo "⚠️  Seeding encountered issues (this may be normal if data exists)"
fi
echo "✓ Done"

echo -e "\n[STEP 6] Creating storage symbolic link..."
docker-compose exec app php artisan storage:link
echo "✓ Done"

echo -e "\n[STEP 7] Fixing storage and cache permissions..."
docker-compose exec app chmod -R 777 storage bootstrap/cache
echo "✓ Done"

echo -e "\n[STEP 8] Clearing application caches..."
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan route:clear
docker-compose exec app php artisan view:clear
echo "✓ Done"

echo -e "\n========================================"
echo "✅ Setup Complete!"
echo "========================================"

echo -e "\n📌 Access Information:"
echo "   - Application: http://localhost:8000"
echo "   - Vite Dev:    http://localhost:5173"
echo "   - Mailpit UI:  http://localhost:8025 📧"

echo -e "\n🔐 Default Login Credentials:"
echo "   - Email:    admin@example.com"
echo "   - Password: password"
echo "   (Change these in .env before setup if desired)"

echo -e "\n📧 Email Testing:"
echo "   - All emails are captured by Mailpit (no real emails sent)"
echo "   - View emails at: http://localhost:8025"
echo "   - Test features: User registration, OTP verification, password reset"

echo -e "\n📝 Useful Commands:"
echo "   - View logs:      docker-compose logs -f app"
echo "   - View emails:    Open http://localhost:8025 in browser"
echo "   - Stop all:       docker-compose down"
echo "   - Restart:        docker-compose restart"

echo ""
