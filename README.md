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

### API Services

SmartTask follows a RESTful API architecture built with Django REST Framework and secured using JWT Authentication. The platform exposes several API modules that support project management, collaboration, analytics, and AI-powered decision-making.

*Authentication API

Provides secure user authentication and authorization services.

Features:

User registration
User login and logout
JWT access and refresh tokens
Profile management
Role-based access control (Admin, Manager, Member)
User Management API

Handles user administration and access management.

Features:

User creation and management
Role assignment
User profile updates
Permission enforcement
Account status management
Project Management API

Manages project lifecycle and team collaboration.

Features:

Create, update, and delete projects
Project ownership management
Project status tracking
Team assignment
Project progress monitoring
Task Management API

Supports task planning, assignment, and execution.

Features:

Task creation and management
Task assignment to team members
Priority and deadline management
Status tracking
Task-to-project linkage
Notification API

Provides real-time communication and system alerts using WebSockets and Django Channels.

Features:

Instant task assignment notifications
Deadline reminders
Project update alerts
Status change notifications
Real-time user activity updates

### Technologies Used:

Django Channels
Daphne ASGI Server
Redis / Memurai
Analytics API

Generates insights and performance metrics for projects and teams.

Features:

Project performance statistics
Task completion analytics
Team productivity monitoring
Overdue task reporting
Dashboard data aggregation
AI Insights API

Integrates OpenAI services to enhance productivity and decision-making.

Features:

Intelligent task prioritization
Workload balancing recommendations
Project risk prediction
Productivity suggestions
AI-generated project summaries

### Technology Used:

OpenAI API
Reporting API

Provides data export and reporting capabilities.

Features:

Project reports
Task reports
Performance summaries
Export to PDF and Excel formats
Custom analytics reports
Security Features

### The SmartTask APIs are protected through:

JWT Authentication
Role-Based Access Control (RBAC)
Secure Password Hashing
Permission-Based Authorization
CORS Protection
Token Validation
HTTPS Support
API Architecture
# User Roles

 Role                                                                                  

*Admin    Full system control, user management, project management, analytics, and configuration     
*Manager Create and manage projects, assign tasks, monitor team performance, and access AI insights 
*Member Manage assigned tasks, update progress, collaborate with teams, and receive AI guidance    

# Project Goal

The goal of SmartTask is to provide an intelligent, scalable, and collaborative environment where teams can manage projects efficiently, monitor progress in real time, and leverage artificial intelligence to make better decisions and improve productivity.


# Author

**Allaingaye Lucien**
Bachelor of Software Engineering

Developed as an advanced project management and collaboration platform integrating modern web technologies, real-time communication, analytics, and artificial intelligence.
