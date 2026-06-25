# SmartTask – AI-Powered Task Management and Team Collaboration System


## Overview


**SmartTask** is a modern web-based project and task management platform designed to help organizations and teams plan, execute, and monitor work efficiently. The system combines real-time collaboration, analytics dashboards, and AI-powered insights to improve productivity, enhance decision-making, and streamline workflows.

The platform provides automation, traceability, reporting, quality control, and scalability, allowing teams to focus on achieving project goals rather than managing operational complexity.


## Key Features

### Authentication & Authorization

* Secure user authentication using JWT (JSON Web Tokens)
* Role-Based Access Control (RBAC)
* User roles:

  * Admin
  * Manager
  * Member

### Project Management

* Create, update, and manage projects
* Project ownership and timeline tracking
* Project status monitoring

### Task Management

* Create and assign tasks
* Link tasks to projects
* Track task progress and completion
* Manage deadlines and priorities

### Real-Time Notifications

* WebSocket-based live notifications
* Assignment alerts
* Deadline reminders
* Status change updates

### Analytics Dashboard

* Project performance metrics
* Task completion statistics
* Overdue task monitoring
* Interactive charts and visual reports

### AI-Powered Insights

* Task prioritization recommendations
* Workload balancing suggestions
* Risk prediction and project health monitoring
* AI-generated productivity insights using OpenAI

### Modern User Interface

* Responsive design
* Dark mode support
* Role-specific navigation
* Toast notifications
* Accessible and user-friendly components



## Functional Requirements

### User Management

* User registration and authentication
* JWT token-based authorization
* Role-based permissions

### Project Management

* Create, read, update, and delete projects
* Assign project ownership
* Monitor project progress

### Task Management

* CRUD operations for tasks
* Task assignment to team members
* Task-to-project linkage

### Notifications

* Real-time updates using WebSockets
* Instant alerts for important events

### Analytics

* Aggregated project and task metrics
* Reporting endpoints

### AI Features

* Workload analysis
* Priority recommendations
* Productivity insights

### User Experience

* Responsive design
* Role-specific dashboards
* Optional landing/home page



## Non-Functional Requirements

### Scalability

* Support multiple organizations, teams, and projects
* Modular architecture for future expansion

### Security

* JWT authentication
* Secure token validation
* Role enforcement
* Protected API endpoints

### Performance

* Efficient database queries
* Real-time communication
* Optimized frontend rendering

### Usability

* Intuitive user interface
* Accessible design
* Easy onboarding process



## Additional Business Rules

### Manager Permissions

Managers can:

* Create and manage projects
* Assign tasks within their projects
* View project analytics
* Access AI-generated project summaries

### Member Permissions

Members can:

* View assigned tasks
* Update task status
* Add progress notes
* Receive AI-generated productivity guidance

### Admin Permissions

Admins can:

* Manage all users
* Manage all projects
* Configure system settings
* Access system-wide analytics


# Technology Stack

### Backend

* Python 3.10+
* Django 5.0+
* Django REST Framework 3.14+
* Django Channels 4.0+
* PostgreSQL 14+
* SQLite (Development)
* psycopg2 2.9+
* djangorestframework-simplejwt 5.3+
* django-cors-headers 4.0+
* Redis / Memurai 7.0+
* Daphne ASGI Server
* OpenAI API

### Frontend

* React 18.2+
* React Router DOM 6.14+
* Tailwind CSS 3.3+
* Axios 1.4+
* Recharts 2.8+
* React Hook Form 7.45+
* Yup 1.2+
* React Hot Toast 2.4+

### Development Tools

* Git
* npm
* pip
* Virtual Environments
* Webpack
* Babel
* ESLint
* Prettier

### Optional Components

* Docker
* Celery
* Redis
* ReportLab
* OpenPyXL
* drf-yasg
* pytest
* pytest-django
* Factory Boy
* Faker


# User Roles

 Role                                                                                  

*Admin    Full system control, user management, project management, analytics, and configuration     
*Manager Create and manage projects, assign tasks, monitor team performance, and access AI insights 
*Member Manage assigned tasks, update progress, collaborate with teams, and receive AI guidance    


# Future Enhancements

* Team chat and collaboration workspace
* File sharing and document management
* Mobile application (Android & iOS)
* AI-powered project forecasting
* Advanced reporting and exports
* Calendar and third-party integrations
* Multi-tenant organization support


# Project Goal

The goal of SmartTask is to provide an intelligent, scalable, and collaborative environment where teams can manage projects efficiently, monitor progress in real time, and leverage artificial intelligence to make better decisions and improve productivity.


# Author

**Allaingaye Lucien**
Bachelor of Software Engineering

Developed as an advanced project management and collaboration platform integrating modern web technologies, real-time communication, analytics, and artificial intelligence.
