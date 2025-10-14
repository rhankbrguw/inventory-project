---

# Inventory Management System

A modern, containerized **Inventory Management System** built with **Laravel 11**, **React 18**, and **Docker**.
The project follows clean architecture principles, ensuring scalability and maintainability.

---

## 🧰 Tech Stack

* **Backend:** Laravel 11 (PHP 8.3)
* **Frontend:** React 18 + Vite
* **UI:** Inertia.js, Tailwind CSS, shadcn/ui
* **Database:** MySQL 8.0
* **Containerization:** Docker & Docker Compose
* **Dev Environment:** WSL2 (Ubuntu)

---

## ⚙️ Prerequisites

Make sure you have:

1. **WSL2 (Ubuntu)**
2. **Docker Desktop** (with WSL2 integration enabled)
3. **Git** installed inside WSL

---

## 🚀 Quick Start

All commands are run **inside your WSL terminal**.

### 1. Clone the Repository

```bash
git clone https://github.com/MCN-maganger/inventory-management-system-laravel-react.git
cd inventory-management-system-laravel-react
```

### 2. Copy Environment File

```bash
cp .env.example .env
```

### 3. Build & Start Containers

```bash
docker-compose up -d --build
```

### 4. Run Setup Script

Once all containers are up, initialize the app:

```bash
chmod +x setup.sh
./setup.sh
```

This script automatically:

* Installs Composer dependencies
* Generates the app key
* Runs migrations & seeders
* Links storage
* Fixes permissions & clears cache

---

## 🌐 Access the App

* **App:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **Vite Dev Server:** [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🧩 Daily Workflow

Start your environment:

```bash
docker-compose up -d
```

Stop all containers:

```bash
docker-compose down
```

View logs:

```bash
docker-compose logs -f app
```

---

## 🏗️ Architecture Principles

* **Lean Controllers:** Only handle HTTP; logic lives in Models, FormRequests, and Resources.
* **Component-Based Frontend:** Modular, reusable React components for consistency.
* **Strict Validation:** Centralized business rules via Form Requests.

---

## 📄 License

This project is open source and created for internship learning purposes.

---
