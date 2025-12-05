# Inventory Management System

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Laravel](https://img.shields.io/badge/laravel-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Mailpit](https://img.shields.io/badge/Mailpit-Email_Testing-orange?style=for-the-badge)

A modern, containerized **Inventory Management System** built with **Laravel 11**, **React 18**, and **Docker**.

---

## 🧰 Tech Stack

- **Backend:** Laravel 11 (PHP 8.3)
- **Frontend:** React 18 + Vite + Inertia.js
- **UI:** Tailwind CSS, shadcn/ui
- **Database:** MySQL 8.0
- **Mail Testing:** Mailpit (Development)
- **Container:** Docker & Docker Compose

---

## ⚙️ Prerequisites

- **WSL2 (Ubuntu)** or **Linux**
- **Docker Desktop** (with WSL2 integration)
- **Git**

---

## 🚀 Quick Start

Run all commands **inside your WSL/Linux terminal**.

```bash
# 1. Clone repository
git clone https://github.com/MCN-maganger/inventory-management-system-laravel-react.git
cd inventory-management-system-laravel-react

# 2. Copy environment file
cp .env.example .env

# 3. Start containers
docker-compose up -d --build

# 4. Run setup script (waits for containers to be fully ready)
chmod +x setup.sh
./setup.sh
```

**Access the application:**

- **Application:** [http://localhost:8000](http://localhost:8000)
- **Vite Dev Server:** [http://localhost:5173](http://localhost:5173)
- **Mailpit UI:** [http://localhost:8025](http://localhost:8025) _(email testing)_

---

## 🔐 Default Admin Credentials

After running the setup script, you can log in with:

- **Email:** `admin@example.com`
- **Password:** `password`

> **⚠️ Security Note:** Change these credentials immediately in production by modifying the `.env` file **before** running `./setup.sh`:
>
> ```env
> ADMIN_NAME="Your Name"
> ADMIN_EMAIL=your-email@example.com
> ADMIN_PASSWORD=your-secure-password
> ```

---

## 📧 Email Configuration

### 🎯 For Users (Default Setup)

By default, the application uses **Mailpit** for email testing. This means:

- ✅ **Zero configuration required** - works out of the box
- ✅ **No real emails sent** - all emails are captured locally
- ✅ **View all emails** at [http://localhost:8025](http://localhost:8025)
- ✅ **Test OTP codes, password resets, and notifications** safely

**Perfect for:**

- Developers getting started quickly
- Testing email features without SMTP setup
- Avoiding accidental email sends during development

### 🔧 For Production or Real Email Testing

To send **real emails** (Gmail, SendGrid, AWS SES, etc.):

1. **Open your `.env` file**
2. **Replace the MAIL section** with your SMTP credentials:

```env
# Example: Gmail SMTP
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="${MAIL_USERNAME}"
MAIL_FROM_NAME="Your App Name"
```

3. **Restart the app container:**

```bash
docker-compose restart app
```

> **📌 Gmail Users:** You need to generate an [App Password](https://support.google.com/accounts/answer/185833) (not your regular Gmail password).

**When to use real SMTP:**

- Production deployments
- Staging environments
- Testing with real email delivery
- Integration with email services

---

## 🔧 Daily Commands

```bash
# Start all containers
docker-compose up -d

# Stop all containers
docker-compose down

# View application logs
docker-compose logs -f app

# View email logs (Mailpit)
docker-compose logs -f mailpit

# Run Laravel artisan commands
docker-compose exec app php artisan [command]

# Access MySQL database
docker-compose exec mysql mysql -u inventory_user -p inventory_system
```

---

## 🛠️ Troubleshooting

### Database Connection Errors

```bash
# Wait 30-60 seconds for MySQL to fully initialize
docker-compose logs mysql

# Check MySQL health
docker-compose ps mysql
```

### Permission Errors

```bash
docker-compose exec app chmod -R 777 storage bootstrap/cache
```

### APP_KEY Not Generated

```bash
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan config:clear
```

### Emails Not Appearing in Mailpit

```bash
# Check if Mailpit is running
docker-compose ps mailpit

# Check MAIL_HOST in .env
grep MAIL_HOST .env
# Should output: MAIL_HOST=mailpit

# Clear config cache
docker-compose exec app php artisan config:clear
docker-compose restart app
```

### Frontend Not Loading

```bash
# Check Node container
docker-compose logs node

# Rebuild assets
docker-compose exec node npm install
docker-compose exec node npm run build
```

### Complete Rebuild

```bash
# Nuclear option: clean rebuild
docker-compose down -v
docker-compose up -d --build
./setup.sh
```

---

## 🏗️ Architecture

- **Lean Controllers** - Business logic in Models, FormRequests, and Resources
- **Component-Based Frontend** - Modular React components with shadcn/ui
- **Docker-First** - Consistent development environment across machines
- **Email Testing** - Mailpit for local email capture and debugging
- **Role-Based Access** - Spatie Laravel Permission for authorization
- **API Resources** - Clean data transformation layer

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

Open source - created for educational purposes.

## 🆘 Need Help?

- Check the [Issues](https://github.com/MCN-maganger/inventory-management-system-laravel-react/issues) page
- Review Docker logs: `docker-compose logs -f`
- Ensure all containers are running: `docker-compose ps`

---
