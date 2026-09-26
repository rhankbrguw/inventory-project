# Inventory Project

Multi-tenant inventory, logistics, POS, and accounting system. Built with Laravel 11, Inertia.js, React, Tailwind CSS, Docker, OpenWA WhatsApp gateway, and Midtrans.

---

Clone it, copy `.env.example` to `.env`, then run `docker compose up -d` (or `composer install` && `npm install` for local).

Database: `php artisan migrate --seed` to scaffold tables, roles, locations, and system defaults.

Docker: `docker compose up -d` spins up the full stack (`app`, `web`, `db`, `openwa`, `mailpit`).

WhatsApp: Handled via OpenWA on `:2785`. Webhooks and notifications dispatch over Docker's network out of the box.

Frontend: `npm run dev` starts the Vite dev server on `:5173`.

Production: `php artisan test` && `npm run build` to verify tests and build assets.

---

PHP 8.3+, Node 20+, Composer, Docker.
