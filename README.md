# CampusOps Hub

CampusOps Hub is a full-stack **Smart Campus Operations Hub** developed for the **IT3030 – Programming Applications and Frameworks Assignment 2026**.

The system helps manage campus resources, bookings, maintenance tickets, notifications, user roles, and authentication through a Spring Boot REST API and React web application.

---

## Project Details

| Item | Details |
|---|---|
| Module | IT3030 – Programming Applications and Frameworks |
| Project | Smart Campus Operations Hub |
| App Name | CampusOps Hub |
| Group | Group 79 |
| Backend | Spring Boot REST API |
| Frontend | React + Vite |
| Database | MySQL |
| Version Control | GitHub |
| CI | GitHub Actions |

---

## Tech Stack

### Backend

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- OAuth2 Client
- MySQL
- Lombok
- Jakarta Validation
- Maven

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Fetch API

### Tools

- Git and GitHub
- GitHub Actions
- Postman
- MySQL Workbench
- VS Code / IntelliJ IDEA

---

## Main Features

### Facilities and Assets

- Manage lecture halls, labs, meeting rooms, and equipment
- Add, update, delete, search, and filter resources
- Track resource status such as `ACTIVE` and `OUT_OF_SERVICE`

### Booking Management

- Users can request resource bookings
- Admins can approve or reject bookings
- Booking workflow:

```txt
PENDING → APPROVED / REJECTED → CANCELLED
```

- Prevents overlapping bookings for the same resource

### Ticket Management

- Users can create maintenance or incident tickets
- Tickets support priority, contact details, and image attachments
- Technician assignment and resolution workflow
- Ticket workflow:

```txt
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

### Notifications

- Users receive notifications for:
  - Booking approval/rejection
  - Ticket status changes
  - Ticket comments
  - Admin broadcasts

- Users can:
  - View notifications
  - Mark notifications as read
  - Delete notifications
  - Manage notification preferences

### Authentication and Roles

Supported roles:

```txt
USER
ADMIN
TECHNICIAN
```

- OAuth2 login support
- Role-based access control
- Protected routes and secured backend endpoints

---

## Project Structure

```txt
it3030-paf-2026-smart-campus-group77/
│
├── backend/
│   ├── src/main/java/com/group77/backend/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── enums/
│   │   ├── exception/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   ├── src/main/resources/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
│
├── docs/
├── .github/workflows/
├── .gitignore
└── README.md
```

---

## Database

Main tables:

```txt
users
assets
bookings
tickets
ticket_attachments
notifications
notification_preferences
```

---

## Setup Instructions

### Prerequisites

Install:

- Java 21 or compatible JDK
- Node.js and npm
- MySQL Server
- Git
- Maven or Maven wrapper

---

## Backend Setup

### 1. Navigate to backend

```bash
cd backend
```

### 2. Create MySQL database

```sql
CREATE DATABASE campus_ops_hub;
```

### 3. Configure database

Open:

```txt
backend/src/main/resources/application.properties
```

Example:

```properties
spring.application.name=backend

server.port=8081

spring.datasource.url=jdbc:mysql://localhost:3306/campus_ops_hub?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false
```

### 4. Run backend

```bash
./mvnw spring-boot:run
```

For Windows PowerShell:

```bash
.\mvnw.cmd spring-boot:run
```

Backend runs on:

```txt
http://localhost:8081
```

---

## Frontend Setup

### 1. Navigate to frontend

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run frontend

```bash
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

## API Overview

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/{id}/read` | Mark notification as read |
| DELETE | `/api/notifications/{id}` | Delete notification |
| POST | `/api/admin/notifications/broadcast` | Send admin broadcast |
| GET | `/api/notifications/preferences` | Get notification preferences |
| PUT | `/api/notifications/preferences` | Update notification preferences |

### Tickets

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tickets` | Create ticket |
| GET | `/api/tickets` | Get all tickets |
| GET | `/api/tickets/user` | Get user tickets |
| GET | `/api/tickets/technician` | Get technician tickets |
| PUT | `/api/tickets/{ticketId}/assign-technician` | Assign technician |
| PUT | `/api/tickets/{ticketId}/accept` | Accept ticket |
| PUT | `/api/tickets/{ticketId}/reject` | Reject ticket |
| PUT | `/api/tickets/{ticketId}/resolve` | Resolve ticket |
| PUT | `/api/tickets/{ticketId}/close` | Close ticket |

### Resources

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/assets` | Get resources |
| POST | `/api/assets` | Create resource |
| PUT | `/api/assets/{id}` | Update resource |
| DELETE | `/api/assets/{id}` | Delete resource |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Get bookings |
| PUT/PATCH | `/api/bookings/{id}/approve` | Approve booking |
| PUT/PATCH | `/api/bookings/{id}/reject` | Reject booking |
| PUT/PATCH | `/api/bookings/{id}/cancel` | Cancel booking |

---

## Member Contributions

| Member | Responsibility |
|---|---|
| Member 1 | Facilities and assets catalogue |
| Member 2 | Booking management |
| Member 3 | Ticket management and attachments |
| Member 4 | Authentication, roles, notifications, dashboards |

---


## Testing

### Backend

```bash
cd backend
./mvnw test
```

### Frontend Build

```bash
cd frontend
npm run build
```

### Manual Testing

Postman was used to test:

- Resource APIs
- Booking workflow
- Ticket workflow
- Notification APIs
- Admin broadcast
- Notification preferences

---

## Authors

**Group 79**  
IT3030 – Programming Applications and Frameworks  
Faculty of Computing, SLIIT
