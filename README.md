# SmartTask – AI-Powered Task Management & Team Collaboration System

A modern, full-stack project management platform with real-time collaboration, AI-powered insights, and role-based access control.


## 📋 Overview

**SmartTask** is a web-based project and task management platform designed to help teams plan, execute, and monitor work efficiently. It combines real-time collaboration, analytics dashboards, and AI-powered insights to improve productivity and streamline workflows.


## ✨ Key Features

### 🔐 Authentication & Authorization
- Secure JWT (JSON Web Tokens) authentication
- Role-Based Access Control (RBAC) with three user roles:
  - **Admin** – Full system control
  - **Manager** – Project and team management
  - **Member** – Task execution and collaboration

### 📁 Project Management
- Create, update, and manage projects
- Project ownership and timeline tracking
- Project status monitoring

### ✅ Task Management
- Create and assign tasks
- Link tasks to projects
- Track task progress and completion
- Manage deadlines and priorities

### 🔔 Real-Time Notifications
- WebSocket-based live notifications
- Assignment alerts
- Deadline reminders
- Status change updates

### 📊 Analytics Dashboard
- Project performance metrics
- Task completion statistics
- Overdue task monitoring
- Interactive charts and visual reports
- Export reports to PDF, CSV, and Excel

### 🤖 AI-Powered Insights
- Task prioritization recommendations
- Workload balancing suggestions
- Risk prediction and project health monitoring
- AI-generated productivity insights using OpenAI

### 🎨 Modern User Interface
- Responsive design
- Dark mode support
- Role-specific navigation
- Toast notifications
- Accessible and user-friendly components


## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system control, user management, project management, analytics, and configuration |
| **Manager** | Create and manage projects, assign tasks, monitor team performance, access AI insights |
| **Member** | Manage assigned tasks, update progress, collaborate with teams, receive AI guidance |


## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Primary programming language |
| Django | 5.0+ | Web framework |
| Django REST Framework | 3.14+ | RESTful API development |
| Django Channels | 4.0+ | WebSocket support |
| Daphne | 3.0+ | ASGI server for WebSockets |
| PostgreSQL | 14+ | Production database |
| Redis | 7.0+ | Channel layer for WebSockets |
| JWT | 5.3+ | Authentication |
| OpenAI API | 1.0+ | AI-powered insights |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI framework |
| React Router DOM | 6.14+ | Routing |
| Tailwind CSS | 3.3+ | CSS framework |
| Recharts | 2.8+ | Charting library |
| React Hot Toast | 2.4+ | Toast notifications |
| Axios | 1.4+ | HTTP client |


## 📊 API Services

SmartTask follows a RESTful API architecture built with Django REST Framework and secured using JWT Authentication.

### 🔐 Authentication API
- `POST /api/auth/login/` – User login
- `POST /api/auth/register/` – User registration
- `POST /api/auth/refresh/` – Refresh JWT token
- `GET /api/auth/me/` – Get current user

### 📁 Project Management API
- `GET /api/projects/` – List projects
- `POST /api/projects/` – Create project
- `GET /api/projects/{id}/` – Get project details
- `PUT /api/projects/{id}/` – Update project
- `DELETE /api/projects/{id}/` – Delete project

### ✅ Task Management API
- `GET /api/tasks/` – List tasks
- `POST /api/tasks/` – Create task
- `GET /api/tasks/{id}/` – Get task details
- `PUT /api/tasks/{id}/` – Update task
- `DELETE /api/tasks/{id}/` – Delete task

### 🤖 AI Insights API
- `GET /api/ai/insights/` – Global AI insights
- `GET /api/ai/projects/{id}/insights/` – Project AI insights
- `GET /api/ai/alerts/` – AI alerts
- `POST /api/ai/projects/{id}/apply/` – Apply recommendation

### 📊 Analytics API
- `GET /api/analytics/` – Admin analytics
- `GET /api/analytics/manager/` – Manager analytics
- `POST /api/analytics/export/` – Export report


## 🔐 Security Features

- JWT Authentication with refresh token rotation
- Role-Based Access Control (RBAC)
- Secure password hashing
- CORS protection
- Token validation

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Python 3.10+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Redis 7+** - [Download](https://redis.io/download/)
- **Git** - [Download](https://git-scm.com/downloads)

## Architecture
  Frontend (React SPA)
    ↓ REST API (HTTP) + WebSockets
ASGI Server (Daphne)
    ↓
Django REST Framework (Backend API)
    ↓
PostgreSQL Database

Real-time Layer:
Django Channels + Redis

AI Layer:
OpenAI API


## Backend setup

cd backend

Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

Install dependencies
pip install -r requirements.txt

Set up environment variables
cp .env.example .env
 Edit .env with your configuration

 Run database migrations
python manage.py migrate

Create superuser (admin account)
python manage.py createsuperuser
 Start Redis server (in another terminal)
redis-server

Start the server with Daphne (ASGI for WebSockets)
daphne -b 0.0.0.0 -p 8000 smarttask.asgi:application

### frontend setup
cd frontend

 Install dependencies
npm install

 Start the development server
npm start

### Access the Application
Frontend: http://localhost:3000

Backend API: http://localhost:8000/api/

Admin Panel: http://localhost:8000/admin/

WebSocket: ws://localhost:8000/ws/notifications/


### Project Goal

The goal of SmartTask is to provide an intelligent, scalable, and collaborative environment where teams can manage projects efficiently, monitor progress in real time, and leverage artificial intelligence to make better decisions and improve productivity.


## Author

**Allaingaye Lucien**  
Bachelor of Software Engineering

Developed as an advanced project management and collaboration platform integrating modern web technologies, real-time communication, analytics, and artificial intelligence.
