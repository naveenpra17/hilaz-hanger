# Hilaz Hanger — Premium Fashion E-Commerce

Full-stack boutique e-commerce matching the Hilaz Hanger UI: burgundy, gold, and cream minimal-luxury design.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 18+, Tailwind CSS |
| Backend | Spring Boot 3, JWT |
| Database | PostgreSQL |
| Images | Cloudinary |
| Payments | Razorpay |

## Project Structure

```
hilaz-hanger/
├── frontend/          # Angular customer + admin UI
├── backend/           # Spring Boot REST API
├── database/          # PostgreSQL schema & seed data
└── docker-compose.yml # Local dev (Postgres + API)
```

## Quick Start

### Prerequisites

- Node.js 20+ with npm
- Java 17+
- Maven 3.9+
- Docker (optional, for PostgreSQL)

### 1. Database

```bash
docker compose up -d postgres
# Or run database/schema.sql in your PostgreSQL instance
```

### 2. Backend

```bash
cd backend
# Copy application-local.yml.example and set JWT + DB + Cloudinary keys
mvn spring-boot:run
```

API: `http://localhost:8080/api`

### 3. Frontend

**Easiest on Windows (avoids PowerShell script errors):**

```cmd
cd frontend
start-dev.cmd
```

**Or use `npm.cmd` instead of `npm` in PowerShell:**

```powershell
cd frontend
npm.cmd install
npm.cmd start
```

**Option — PowerShell script** (uses `npm.cmd` internally):

```powershell
cd frontend
.\setup-and-run.ps1
```

App: **http://localhost:4200**

> **Error: `npm.ps1 cannot be loaded because running scripts is disabled`**  
> PowerShell runs `npm.ps1` when you type `npm`. Use **`npm.cmd`** or **`start-dev.cmd`** instead.

> If Node.js is not installed globally, download portable Node once:
> `tools/node/` is created automatically when using the commands above from this repo.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hilazhanger.com | Admin@123 |
| Customer | customer@hilazhanger.com | Customer@123 |

## Features

### Customer
- Home with promo bar, carousel, bottom nav
- Shop, search, filters
- Product detail (gallery, sizes, colors, cart)
- Cart & checkout
- Auth (register/login)

### Admin
- Dashboard (charts, recent orders)
- All products (filters, pagination)
- Create / edit product (sizes, labels, preview)
- Offline orders modal
- Order management

## Phases 2–4 (implemented)

| Phase | Feature |
|-------|---------|
| **2** | Live API (`useMock: false`), checkout, Razorpay verify |
| **3** | Cloudinary upload on admin create product |
| **4** | `DEPLOYMENT.md`, `render.yaml`, `backend/Dockerfile`, Vercel config |

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step Vercel + Render setup.

## Deployment

- **Frontend:** Vercel — root `frontend`, output `dist/hilaz-hanger/browser`
- **Backend:** Render — Docker from `backend/Dockerfile`
- Set `apiUrl` + `razorpayKey` in `environment.prod.ts`
- Set Cloudinary + Razorpay secrets on Render

## Environment Variables

See `backend/src/main/resources/application.yml` and `frontend/src/environments/environment.ts`.
