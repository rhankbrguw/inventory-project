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
  A modern, Docker-based inventory solution powered by Laravel and React.
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

- Modular and service-oriented backend architecture
- Role-based access control (Admin/User)
- Product, supplier, stock, transaction, and reporting modules
- Transaction-safe inventory operations & logging
- Hot reload for both backend and frontend

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

## 🔐 Default Admin Credentials

| Email               | Password   |
| ------------------- | ---------- |
| `admin@example.com` | `password` |

For production, update these values in `.env` before running the setup script.

Note:
Mailpit is enabled by default for development environments, you can use that default user.
If SMTP is preferred (e.g., Gmail, SendGrid, SES), update the `MAIL_*` values in `.env`.

No code changes required — the application follows the environment configuration.

---

## 🛠️ Daily Useful Commands

```bash
docker compose up -d
docker compose down
docker compose logs -f app
docker compose exec app php artisan migrate
docker compose exec node npm run build
```

---

## 🔍 Troubleshooting

| Issue                        | Action                                                   |
| ---------------------------- | -------------------------------------------------------- |
| Database initializing slowly | `docker compose logs mysql`                              |
| APP_KEY missing              | `docker compose exec app php artisan key:generate`       |
| Emails not appearing         | `php artisan config:clear` and ensure Mailpit is running |
| Frontend not updating        | `docker compose exec node npm install && npm run build`  |

---

## 🏗️ Architecture Summary

- Repository/Service pattern
- FormRequest validation and API Resources
- Component-based UI with shadcn
- Secure session authentication with Inertia
- Fully isolated Docker development environment

---

## 🤝 Contribution

Contributions, issues, and feature requests are welcome.

---

## 📄 License

MIT — free for personal, commercial, and educational use.
