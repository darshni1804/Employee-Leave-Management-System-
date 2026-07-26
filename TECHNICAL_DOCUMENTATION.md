# Technical Documentation: Technodha LeaveMate

## 1. System Architecture Overview

Technodha LeaveMate is a full-stack enterprise web application designed to handle organizational leave management. The architecture strictly adheres to a decoupled client-server model.

### 1.1 High-Level Architecture
- **Frontend (Client):** Single Page Application (SPA) built with React 19, Vite, and TypeScript.
- **Backend (API):** RESTful JSON API built with Python 3.11 and Django REST Framework (DRF) 3.15.
- **Database:** PostgreSQL 16 relational database.
- **Containerization:** Docker Compose for seamless local development and production deployment.

### 1.2 Design Patterns
- **Service Layer Pattern (Backend):** Django Views/ViewSets strictly handle HTTP parsing, routing, and status codes. All business logic, validations, and database mutations are isolated in a dedicated `services.py` layer. This ensures the codebase is highly testable and decoupled from the framework's HTTP layer.
- **Component-Driven UI (Frontend):** The UI is broken down into atomic components (e.g., `FormField`, `StatusBadge`, `SectionCard`) and complex layout components (`EmployeeLayout`, `ManagerLayout`).

---

## 2. Database Schema (PostgreSQL)

The database relies on Django's ORM. The core models are grouped under the `accounts` and `leaves` applications.

### 2.1 Core Entities
1. **User (Custom User Model):**
   - Extends `AbstractUser`.
   - Fields: `email` (unique identifier), `employee_id` (unique), `role` (EMPLOYEE, MANAGER, ADMIN), `department`, `designation`, `manager` (Self-referential ForeignKey for reporting hierarchy).
2. **LeaveType:**
   - Defines categories: Annual, Sick, Casual, etc.
   - Fields: `name`, `max_days_per_year`, `requires_approval`, `is_paid`.
3. **LeaveRequest:**
   - Represents an employee's application for leave.
   - Fields: `employee` (FK to User), `leave_type` (FK to LeaveType), `start_date`, `end_date`, `total_days`, `status` (PENDING, APPROVED, REJECTED, CANCELLED), `reason`, `reviewer_comment`.
4. **LeaveBalance:**
   - Tracks the remaining quota for an employee per year.
   - Fields: `employee` (FK), `leave_type` (FK), `year`, `allocated_days`, `used_days`, `remaining_days`.
   - Constraints: `unique_together = ['employee', 'leave_type', 'year']`.

---

## 3. API Design & Routing

The Backend exposes a `/api/v1/` RESTful interface.

### 3.1 Authentication (`/api/v1/auth/`)
- `POST /login/`: Accepts `email` or `employee_id` with `password`. Returns JWT `access` and `refresh` tokens.
- `POST /refresh/`: Rotates the access token using a valid refresh token.
- `POST /logout/`: Blacklists the provided refresh token.
- `GET /me/`: Returns the currently authenticated user's profile and RBAC role.

### 3.2 Employee Endpoints (`/api/v1/leaves/`)
- `GET /`: Lists paginated leave requests owned by the authenticated user.
- `POST /`: Submits a new leave request.
- `POST /{id}/cancel/`: Cancels a `PENDING` request.
- `GET /balances/`: Returns the user's current leave balances for the year.

### 3.3 Manager Endpoints (`/api/v1/manager/`)
- `GET /leaves/`: Lists all leave requests submitted by the organization (or direct reports).
- `POST /leaves/{id}/approve/`: Approves a request and deducts the balance.
- `POST /leaves/{id}/reject/`: Rejects a request with an optional comment.
- `GET /statistics/`: Returns aggregated dashboard metrics (Total pending, approved today, etc.).

---

## 4. Security & Access Control

### 4.1 Role-Based Access Control (RBAC)
- **Employee Level:** Users can only view and modify their own `LeaveRequest` and `LeaveBalance` objects.
- **Manager Level:** Granted access to the `IsManager` DRF permission class, allowing access to `/api/v1/manager/*` routes to approve/reject requests globally.
- **Admin Level:** Superuser access to the Django Admin panel for system-wide configuration (Leave Types, Users).

### 4.2 JWT Security
- Tokens are issued via `rest_framework_simplejwt`.
- Access tokens expire quickly (e.g., 15-60 minutes). Refresh tokens are long-lived but strictly blacklisted upon logout to prevent replay attacks.

### 4.3 Data Validation & Injection Prevention
- **Backend:** DRF Serializers sanitize all incoming JSON payloads. Django ORM inherently protects against SQL Injection via parameterized queries.
- **Frontend:** Zod schemas perform strict schema validation before any payload reaches the network.

---

## 5. Frontend Architecture

### 5.1 State Management & API Integration
- **Axios Interceptors:** A global Axios instance handles appending the `Authorization: Bearer <token>` header to all outgoing requests.
- **Token Rotation:** A response interceptor catches `401 Unauthorized` errors, pauses outgoing requests, automatically hits the `/api/v1/auth/refresh/` endpoint, and replays the queued requests transparently.

### 5.2 Routing (React Router 7)
- **Protected Routes:** A `<ProtectedRoute>` wrapper checks the user's authentication state.
- **Role Guards:** The `<RoleRoute>` wrapper checks the user's role against an allowed list (e.g., `allowedRoles={["MANAGER", "ADMIN"]}`). Unauthorized access redirects to a `403 Forbidden` page.

### 5.3 Forms & Validation
- **React Hook Form:** Manages form state, untouched/dirty fields, and submission events efficiently without unnecessary re-renders.
- **Zod:** Defines strict shape validation (e.g., `startDate` cannot be in the past, `endDate` must be >= `startDate`).

---

## 6. Business Logic & Constraints

The system enforces several critical HR business rules entirely within the backend `services.py` layer:
1. **Past Date Prevention:** Leave requests cannot start in the past.
2. **Date Logic:** The End Date cannot precede the Start Date.
3. **Overlap Prevention:** An employee cannot apply for leave on dates that overlap with an existing `PENDING` or `APPROVED` request.
4. **Balance Verification:** The requested `total_days` cannot exceed the employee's `remaining_days` for that specific `LeaveType` in the current year.
5. **State Machine:** A `LeaveRequest` can only be `APPROVED`, `REJECTED`, or `CANCELLED` if its current status is exactly `PENDING`. Once resolved, it is locked.

---

## 7. Build & Deployment

### 7.1 Backend (Django)
- **WSGI / ASGI:** Configured to run via Gunicorn for production WSGI handling.
- **Static Files:** Collected via `python manage.py collectstatic` for serving via Nginx or WhiteNoise.

### 7.2 Frontend (Vite)
- **Build Process:** `npm run build` utilizes Rollup to generate highly optimized, minified, and chunked static assets in the `/dist` directory.
- **Environment Variables:** Handled via Vite's `import.meta.env` system, prefixing public variables with `VITE_` (e.g., `VITE_API_BASE_URL`).

### 7.3 Containerization
The provided `docker-compose.yml` orchestrates three services:
1. `db`: PostgreSQL Alpine image with persistent volumes.
2. `backend`: Python 3.11 image running Django migrations and the Gunicorn server.
3. `frontend`: Node image serving the Vite preview or an Nginx container serving the static `/dist` bundle.
