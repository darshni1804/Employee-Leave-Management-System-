# Technodha LeaveMate
### Smart Employee Leave Management System

[![Django](https://img.shields.io/badge/Django-5.1-092E20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

A production-ready, full-stack **Technodha LeaveMate** enterprise platform built with **Django REST Framework (DRF)** and **React 19 + TypeScript + Tailwind CSS**.

The system enables employees to submit leave requests and track their leave history, while allowing managers and administrators to review, approve, or reject leave requests with real-time organizational statistics.

---

## 🌟 Key Features

### 🔐 Authentication & Access Control
- **Role-Based Access Control (RBAC):** `EMPLOYEE`, `MANAGER`, `ADMIN` roles.
- **JWT Authentication:** SimpleJWT tokens (Access & Refresh) with automatic frontend rotation and token blacklist on logout.
- **Dual Identifier Login:** Sign in using either **Email Address** or **Employee ID**.
- **Role Guards:** Strictly enforced object-level ownership and endpoint access controls (Employees get `403 Forbidden` on manager endpoints).

### 👨‍💼 Employee Module
- **Employee Dashboard:** Real-time metrics for Remaining Annual Leave (out of 20 days), Approved Leaves, Pending Leaves, and Recent Activity.
- **Apply for Leave:** React Hook Form + Zod validation enforcing:
  - Max 20 approved leave days per calendar year.
  - No past start dates.
  - End date on or after start date.
  - No overlap with existing approved leave requests.
- **Leave History:** Responsive table with status badges (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`), reason search, status filtering, date range pickers, and pagination.
- **Cancel Pending Leave:** Employees can cancel `PENDING` leave requests with confirmation modal.

### 👔 Manager Module
- **Manager Dashboard:** Real-time organizational metrics (Total Employees, Pending Requests, Approved Today, Approved Total, Rejected Total, Cancelled Total).
- **Manage Requests Table:** Review all employee requests with columns for Employee Name, Email, Employee ID, Department, Dates, Duration, Reason, Status, and Applied On date.
- **Approve / Reject Workflows:** One-click approval and rejection with optional reviewer comments (allowed strictly for `PENDING` requests).
- **Search & Filters:** Full-text search across employee name, ID, email, or reason, status filter dropdown, date range filtering, and pagination.

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Python 3.11+ / Django 5.1 / Django REST Framework 3.15
- **Authentication:** `rest_framework_simplejwt` (JWT)
- **Database:** PostgreSQL 16
- **Filtering & Search:** `django-filter`, DRF `SearchFilter`, DRF `OrderingFilter`
- **Documentation:** `drf-spectacular` (OpenAPI 3.0 / Swagger UI & ReDoc)

### Frontend
- **Framework:** React 19 + Vite 5 + TypeScript 5
- **Styling:** Vanilla Tailwind CSS v3 + Tailwind Animate
- **Form Handling:** React Hook Form + Zod Schema Validation
- **UI Primitives:** Radix UI Dialog + Lucide Icons + Sonner Toasts
- **HTTP Client:** Axios with JWT request/response interceptors & token refresh queue

---

## 📐 Project Architecture & Layering

The project adheres to a strict **Service Layer Pattern**:

```
                               ┌───────────────────────────┐
                               │     React 19 Frontend     │
                               └─────────────┬─────────────┘
                                             │ HTTP (JSON + JWT)
                                             ▼
                               ┌───────────────────────────┐
                               │  DRF ViewSets & Routers   │ (HTTP handling & validation)
                               └─────────────┬─────────────┘
                                             │ Delegates
                                             ▼
                               ┌───────────────────────────┐
                               │   Services Layer (py)     │ (100% Business Logic)
                               └─────────────┬─────────────┘
                                             │ ORM Queries
                                             ▼
                               ┌───────────────────────────┐
                               │    PostgreSQL Database    │
                               └───────────────────────────┘
```

> **Architecture Principle:** Views only handle HTTP request/response parsing and status codes. All business logic, validations, rules, and computations live exclusively inside `services.py`.

---

## 📁 Directory Structure

```
Employee Leave Management System/
├── backend/
│   ├── apps/
│   │   ├── accounts/          # User model, Auth serializers, views, permissions
│   │   ├── leaves/            # Leave models, services, serializers, views, tests
│   │   └── dashboard/         # Dashboard statistics services & APIs
│   ├── config/                # Settings (base, development, production), URLs, WSGI/ASGI
│   ├── core/                  # Exceptions, Pagination, Base Permissions
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios client & endpoints configuration
│   │   ├── components/        # Shared UI (StatusBadge, Skeleton, ConfirmDialog, Pagination)
│   │   ├── features/          # Feature modules (auth, leaves, manager)
│   │   ├── layouts/           # Role-based layouts (EmployeeLayout, ManagerLayout, AdminLayout)
│   │   ├── pages/             # Page components (LoginPage, DashboardPage, LeavesPage, ManagerDashboardPage)
│   │   ├── router/            # React Router 7 config & ProtectedRoute guards
│   │   └── types/             # Domain TypeScript interface definitions
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── docs/
│   ├── postman_collection.json # Complete Postman API collection
│   ├── database_schema.md      # PostgreSQL Schema & ER Diagram
│   └── screenshots/            # UI screenshots guide
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Python:** 3.11 or higher
- **Node.js:** 18 or higher (npm 9+)
- **PostgreSQL:** 16 (or SQLite / Docker)

---

### Option A: Local Development Setup

#### 1. Database & Environment Setup
Ensure PostgreSQL is running, then set up `.env` files:

```powershell
# Copy backend environment template
cp backend/.env.example backend/.env

# Copy frontend environment template
cp frontend/.env.example frontend/.env
```

#### 2. Demo Login Credentials
The system comes with a built-in command to seed a test manager and employee. If you execute the seeding command in the steps below, you can log in with:
- **Manager:** `manager@example.com` / `Password123!`
- **Employee:** `employee@example.com` / `Password123!`

#### 3. Backend Setup
```powershell
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # On Windows
# source venv/bin/activate    # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed initial test users (Employee, Manager, Admin)
python manage.py seed_users

# Start Django backend server
python manage.py runserver 8000
```
> 🌐 Backend API: `http://127.0.0.1:8000/api/v1/`  
> 📑 Swagger UI: `http://127.0.0.1:8000/api/schema/swagger-ui/`

#### 3. Frontend Setup
Open a new terminal window:
```powershell
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
> 🌐 Frontend Application: `http://localhost:5173/`

---

### Option B: Docker Compose Setup (Single Command)

To run the full stack (Frontend + Backend + PostgreSQL Database) in Docker:

```powershell
docker-compose up --build
```
- **Frontend App:** `http://localhost:5173`
- **Backend API:** `http://localhost:8000/api/v1/`
- **Swagger Docs:** `http://localhost:8000/api/schema/swagger-ui/`

---

## 🔑 Default Credentials

After seeding the database (`python manage.py seed_users`), use any of the following accounts:

| Role | Email / Identifier | Password | Access Level |
|---|---|---|---|
| **Employee** | `employee@example.com` / `EMP001` | `Password123!` | Employee Module (Apply, History, Cancel) |
| **Manager** | `manager@example.com` / `MGR001` | `Password123!` | Manager Module (Approve, Reject, Stats) |
| **Admin** | `admin@example.com` / `ADM001` | `Password123!` | Full Admin Panel & System Control |

---

## 🧪 Running Tests & Quality Verification

### Backend Tests (Django Test Suite)
```powershell
cd backend
python manage.py test
```
- **Output:** 34 tests passing (0 failures, 0 errors)

### Django System Check
```powershell
cd backend
python manage.py check
```

### Frontend Type Check (TypeScript)
```powershell
cd frontend
npm run type-check
```

### Frontend Production Build
```powershell
cd frontend
npm run build
```

---

## 📄 API Documentation & Postman Collection

- **Interactive Swagger UI:** `http://127.0.0.1:8000/api/schema/swagger-ui/`
- **ReDoc Documentation:** `http://127.0.0.1:8000/api/schema/redoc/`
- **Postman Collection File:** [docs/postman_collection.json](docs/postman_collection.json)
- **Database Schema Documentation:** [docs/database_schema.md](docs/database_schema.md)

---

## 📸 Visual Documentation

Explore our comprehensive visual guide:
- **[View Application Screenshots](docs/screenshots/README.md)**: A complete gallery covering the landing page, dashboards, forms, responsive design, and settings.
- **Screen Recordings**: Watch the full end-to-end workflows in the `docs/screen recording` directory.

---

## 🚀 Future Improvements

- **Email Notifications:** Send automated emails to employees when leave requests are approved or rejected.
- **Export Reports:** CSV/PDF export of team leave history for HR payroll integration.
- **Calendar View:** Interactive team calendar showing upcoming approved leaves across departments.
