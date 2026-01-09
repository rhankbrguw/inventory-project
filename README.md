## 📦 Inventory Management System

<p align="center">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Laravel_11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" />
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Inertia.js-7952B3?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tailwind-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL_8.0-005C84?style=for-the-badge&logo=mysql&logoColor=white" />
</p>

<p align="center">
  A modern, Docker-based inventory solution with automated setup wizard, powered by Laravel and React.
</p>

---

## 🚀 Tech Overview

| Layer            | Stack                                           |
| ---------------- | ----------------------------------------------- |
| Backend          | Laravel 11 (PHP 8.3)                            |
| Frontend         | React 18, Vite, Inertia.js, shadcn/ui           |
| Database         | MySQL 8.0                                       |
| Email            | Mailpit by default (SMTP selectable via `.env`) |
| Containerization | Docker & Docker Compose                         |

Key capabilities:

- **Setup Wizard** - No hardcoded credentials, guided first-time installation
- **Role-based Access Control** - Super Admin, Admin, Manager, Staff with granular permissions
- **Multi-location Support** - Manage inventory across multiple warehouses/stores
- **Transaction Management** - Purchase, Sell, Transfer, Stock Adjustment with full audit trail
- **Real-time Dashboard** - Live stock monitoring, transaction reports, and analytics
- **Mobile Responsive** - Optimized UI for desktop, tablet, and mobile devices
- **Hot Reload** - Fast development workflow with Vite HMR

---

## ⚙️ Prerequisites

- WSL2 (Ubuntu) or Linux
- Docker Desktop (or native Docker)
- Git

---

## 🚀 Quick Start

```bash
git clone https://github.com/MCN-maganger/inventory-management-system-laravel-react.git
cd inventory-management-system-laravel-react

cp .env.example .env

docker compose up -d --build

chmod +x setup.sh
./setup.sh
```

Access points:

| Service         | URL                                            |
| --------------- | ---------------------------------------------- |
| Application     | [http://localhost:8000](http://localhost:8000) |
| Vite Dev Server | [http://localhost:5173](http://localhost:5173) |
| Mailpit         | [http://localhost:8025](http://localhost:8025) |

---

## 🎯 First Time Setup

### Automated Setup Wizard

After running `./setup.sh`, the application will automatically:

1. Install Composer dependencies
2. Install NPM dependencies
3. Generate APP_KEY
4. Run database migrations
5. Seed initial data (roles, locations, types)

**Access the application** at [http://localhost:8000](http://localhost:8000)

The system will automatically redirect you to the **Setup Wizard** (`/setup`) where you'll create your Super Admin account:

1. **Full Name**: Your name
2. **Email**: Valid email (will be your username)
3. **Password**: Minimum 8 characters with letters and numbers
4. **Confirm Password**: Re-enter password

After submission:

- ✅ Super Admin account created
- ✅ Email automatically verified (no OTP required for Super Admin)
- ✅ Automatic login to Dashboard
- ✅ Setup wizard becomes disabled (one-time only)

> **Important**: The setup wizard can only be accessed once. After Super Admin creation, the `/setup` route is automatically disabled for security.

---

## 🔐 Authentication

### No Default Credentials

Unlike traditional applications, this system **does not use hardcoded credentials**. Instead:

- First-time access triggers the Setup Wizard
- You create your own Super Admin credentials
- Setup wizard only runs once per installation
- All subsequent users are created through the admin panel

### Login After Setup

- **URL**: [http://localhost:8000/login](http://localhost:8000/login)
- **Username**: Email you registered during setup
- **Password**: Password you created during setup

### Email Configuration

**Development (Default):**

```env
MAIL_HOST=mailpit
MAIL_PORT=1025
```

- Access Mailpit at [http://localhost:8025](http://localhost:8025)
- All emails are captured locally (not sent to real addresses)

**Production (Real SMTP):**

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

No code changes required — the application follows the environment configuration.

---

## 🛠️ Daily Useful Commands

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# View logs
docker compose logs -f app

# Database operations
docker compose exec app php artisan migrate
docker compose exec app php artisan migrate:fresh --seed

# Build frontend
docker compose exec node npm run build

# Clear caches
docker compose exec app php artisan config:clear
docker compose exec app php artisan route:clear
docker compose exec app php artisan view:clear
docker compose exec app php artisan cache:clear
```

---

## 🏭 Production Deployment

### Prerequisites

- PHP 8.3+
- MySQL 8.0+
- Composer
- Node.js 20+ & NPM
- Web server (Nginx or Apache)
- SSL Certificate (recommended)

### Deployment Steps

```bash
# 1. Clone repository to server
git clone https://github.com/MCN-maganger/inventory-management-system-laravel-react.git
cd inventory-management-system-laravel-react

# 2. Copy and configure environment
cp .env.example .env
nano .env  # Update for production

# 3. Install dependencies
composer install --optimize-autoloader --no-dev
npm install

# 4. Generate application key
php artisan key:generate

# 5. Build frontend assets
npm run build

# 6. Run migrations and seeders
php artisan migrate --force
php artisan db:seed --force

# 7. Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 8. Set permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Production Environment

**Key `.env` Settings:**

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://inventory.yourcompany.com

# Database
DB_HOST=localhost
DB_DATABASE=inventory_production
DB_USERNAME=inventory_user
DB_PASSWORD=strong_password_here

# Mail (Real SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=inventory@yourcompany.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
```

### First Access in Production

1. Navigate to your domain (e.g., `https://inventory.yourcompany.com`)
2. System automatically redirects to `/setup`
3. Create your Super Admin account
4. Start managing inventory

---

## 🔍 Troubleshooting

| Issue                                 | Solution                                                            |
| ------------------------------------- | ------------------------------------------------------------------- |
| Setup wizard not appearing            | Check database: `SystemSetting::get('setup_completed')`             |
| Database initializing slowly          | `docker compose logs mysql`                                         |
| APP_KEY missing                       | `docker compose exec app php artisan key:generate`                  |
| Emails not appearing (development)    | Check Mailpit at [http://localhost:8025](http://localhost:8025)     |
| Emails not sending (production)       | Verify SMTP credentials in `.env`, test with `php artisan tinker`   |
| Frontend not updating                 | `docker compose exec node npm install && npm run build`             |
| Permission denied errors              | `chmod -R 775 storage bootstrap/cache`                              |
| Cannot access /setup after first run  | Setup wizard disables after Super Admin creation (security feature) |
| Internal(branch) customers isn't sync | `docker compose exec app php artisan customers:sync-internal`       |

### Resetting Setup (Development Only)

If you need to re-run the setup wizard during development:

```bash
docker compose exec app php artisan tinker
>>> SystemSetting::where('key', 'setup_completed')->delete()
>>> User::truncate()
>>> exit
```

Then refresh your browser and access `/setup` again.

---

## 🏗️ Architecture Summary

- Repository/Service pattern with clear separation of concerns
- FormRequest validation and API Resources for data transformation
- Component-based UI with shadcn/ui design system
- Secure session authentication with Inertia.js
- Role-based access control using Spatie Laravel Permissions
- Transaction-safe inventory operations with comprehensive logging
- Fully isolated Docker development environment
- Real-time stock tracking with automatic cost averaging
- Multi-language support (English & Indonesian)

---

## 👥 User Roles & Permissions

| Role        | Level | Capabilities                              |
| ----------- | ----- | ----------------------------------------- |
| Super Admin | 1     | Full system access, user management       |
| Admin       | 10    | Product, transaction, location management |
| Manager     | 20    | Transactions, reports, stock management   |
| Staff       | 30    | Basic transactions, view-only access      |

---

## 📚 Key Features

- ✅ **Setup Wizard** - Guided installation with no hardcoded credentials
- ✅ **Multi-location Inventory** - Manage stock across multiple warehouses
- ✅ **Purchase Management** - Supplier management, purchase orders, costing
- ✅ **Sales Management** - Customer management, point of sale, invoicing
- ✅ **Stock Transfers** - Inter-location transfers with audit trail
- ✅ **Stock Adjustments** - Manual adjustments with reason tracking
- ✅ **Real-time Dashboard** - Live metrics, charts, and analytics
- ✅ **Transaction History** - Complete audit trail for all movements
- ✅ **Advanced Filtering** - Filter by date range, location, category, status
- ✅ **Responsive Design** - Mobile-optimized for on-the-go management
- ✅ **Email Notifications** - OTP verification and system alerts
- ✅ **Role-based Access** - Granular permissions per user role

---

## 🤝 Contribution

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT — free for personal, commercial, and educational use.

---
