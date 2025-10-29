# Inventory Management System

A modern, containerized **Inventory Management System** built with **Laravel 11**, **React 18**, and **Docker**.

---

## 🧰 Tech Stack

- **Backend:** Laravel 11 (PHP 8.3)
- **Frontend:** React 18 + Vite + Inertia.js
- **UI:** Tailwind CSS, shadcn/ui
- **Database:** MySQL 8.0
- **Container:** Docker & Docker Compose

---

## ⚙️ Prerequisites

- **WSL2 (Ubuntu)**
- **Docker Desktop** (with WSL2 integration)
- **Git**

---

## 🚀 Quick Start

Run all commands **inside your WSL terminal**.

```bash
# 1. Clone repository
git clone https://github.com/MCN-maganger/inventory-management-system-laravel-react.git
cd inventory-management-system-laravel-react

# 2. Copy environment file
cp .env.example .env

# 3. Start containers
docker-compose up -d --build

# 4. Run setup (wait for containers to be fully up)
chmod +x setup.sh
./setup.sh
```

**Access the app:**

- Application: [http://localhost:8000](http://localhost:8000)
- Vite Dev: [http://localhost:5173](http://localhost:5173)

---

## 🔧 Daily Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f app

# Run artisan commands
docker-compose exec app php artisan [command]
```

---

## 🛠️ Troubleshooting

**Database connection errors:**

```bash
# Wait 30-60 seconds for MySQL initialization
docker-compose logs mysql
```

**Permission errors:**

```bash
docker-compose exec app chmod -R 777 storage bootstrap/cache
```

**APP_KEY errors:**

```bash
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan config:clear
```

**Rebuild containers:**

```bash
docker-compose down
docker-compose up -d --build
```

---

## 🏗️ Architecture

- **Lean Controllers** - Logic in Models, FormRequests, Resources
- **Component-Based Frontend** - Modular React components
- **Docker-First** - Consistent dev environment

---

## 📄 License

Open source - created for educational purposes.

---
