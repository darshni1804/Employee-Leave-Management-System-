# Employee Leave Management System (ELMS)

A production-ready full-stack application for managing employee leave requests.

---

## Tech Stack

| Layer     | Technology                                                   |
|-----------|--------------------------------------------------------------|
| Backend   | Django 5, Django REST Framework, PostgreSQL, Simple JWT      |
| Frontend  | React 19, Vite, Tailwind CSS, shadcn/ui, React Router        |
| DevOps    | Docker, Docker Compose, Gunicorn                             |

---

## Project Structure

```
Employee Leave Management System/
├── backend/               # Django 5 REST API
├── frontend/              # React 19 + Vite SPA
├── docker-compose.yml     # Full-stack orchestration
└── README.md
```

---

## Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+ (or Docker)
- pip, npm / pnpm

---

## Quick Start (Local Development)

### 1. Clone & Enter Project

```bash
cd "Employee Leave Management System"
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your local PostgreSQL credentials

# Run migrations using the project virtual environment
.\venv\Scripts\python.exe manage.py migrate

# Seed test users (Employee & Manager)
.\venv\Scripts\python.exe manage.py seed_users

# Create superuser (optional)
.\venv\Scripts\python.exe manage.py createsuperuser

# Start development server
.\venv\Scripts\python.exe manage.py runserver 8000
```

Backend API available at: `http://localhost:8000/api/v1/`  
API Docs (Swagger): `http://localhost:8000/api/schema/swagger-ui/`  
API Docs (Redoc): `http://localhost:8000/api/schema/redoc/`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

Frontend available at: `http://localhost:5173`

---

## Docker (Full Stack)

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

Services:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000/api/v1/`
- **PostgreSQL**: `localhost:5432`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                 | Description                        | Default               |
|--------------------------|------------------------------------|-----------------------|
| `SECRET_KEY`             | Django secret key                  | —                     |
| `DEBUG`                  | Debug mode                         | `True`                |
| `ALLOWED_HOSTS`          | Comma-separated allowed hosts      | `localhost,127.0.0.1` |
| `DB_NAME`                | PostgreSQL database name           | `elms_db`             |
| `DB_USER`                | PostgreSQL user                    | `elms_user`           |
| `DB_PASSWORD`            | PostgreSQL password                | —                     |
| `DB_HOST`                | PostgreSQL host                    | `localhost`           |
| `DB_PORT`                | PostgreSQL port                    | `5432`                |
| `CORS_ALLOWED_ORIGINS`   | Allowed frontend origins           | `http://localhost:5173` |
| `JWT_ACCESS_LIFETIME`    | JWT access token lifetime (minutes)| `60`                  |
| `JWT_REFRESH_LIFETIME`   | JWT refresh token lifetime (days)  | `7`                   |

### Frontend (`frontend/.env.local`)

| Variable               | Description          | Default                          |
|------------------------|----------------------|----------------------------------|
| `VITE_API_BASE_URL`    | Backend API base URL | `http://localhost:8000/api/v1`   |

---

## API Endpoints (Planned)

| Method | Endpoint                        | Description              | Auth Required |
|--------|---------------------------------|--------------------------|---------------|
| POST   | `/api/v1/auth/register/`        | Register new user        | No            |
| POST   | `/api/v1/auth/login/`           | Obtain JWT tokens        | No            |
| POST   | `/api/v1/auth/token/refresh/`   | Refresh access token     | No            |
| GET    | `/api/v1/auth/me/`              | Get current user         | Yes           |
| GET    | `/api/v1/leaves/`               | List leave requests      | Yes           |
| POST   | `/api/v1/leaves/`               | Submit leave request     | Yes           |
| GET    | `/api/v1/leaves/{id}/`          | Get leave detail         | Yes           |
| PATCH  | `/api/v1/leaves/{id}/approve/`  | Approve leave (Manager)  | Yes (Manager) |
| PATCH  | `/api/v1/leaves/{id}/reject/`   | Reject leave (Manager)   | Yes (Manager) |
| GET    | `/api/v1/dashboard/stats/`      | Get dashboard statistics | Yes           |

---

## User Roles

| Role       | Permissions                                      |
|------------|--------------------------------------------------|
| `EMPLOYEE` | Submit, view own leave requests                  |
| `MANAGER`  | View team leaves, approve/reject requests        |
| `ADMIN`    | Full access — manage users, leave types, reports |

---

## License

MIT
