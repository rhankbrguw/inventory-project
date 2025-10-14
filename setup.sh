#!/bin/bash
# A script to initialize the application after 'docker-compose up'.

echo -e "\n========================================"
echo " Post-Docker Setup Script"
echo "========================================"
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
docker-compose exec app php artisan key:generate
echo "✓ Done"

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
echo "   - Application: http://127.0.0.1:8000"
echo "   - Vite Dev:    http://127.0.0.1:5173"

echo -e "\n📝 Useful Commands:"
echo "   - View logs: docker-compose logs -f app"
echo "   - Stop all:  docker-compose down"
echo "   - Restart:   docker-compose restart"
echo ""
