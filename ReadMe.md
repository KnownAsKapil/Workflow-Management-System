
# Flow Management System

A backend-focused Flow Management System designed to model structured task workflows with clear responsibilities, controlled state transitions, and reliable audit history.  
The project emphasizes **backend correctness**, **access control**, and **system flow clarity**, with a minimal frontend used only to interact with the backend.

---

## Project Overview

This system reflects how tasks are typically handled in real teams:

- Managers create and review tasks
- Developers work on assigned tasks
- Tasks move through predefined states
- All transitions are validated and recorded by the backend

The backend is treated as the **source of truth**, ensuring that business rules are enforced consistently regardless of the client.

---

## Core Backend Guarantees

### 1. Controlled Task Workflow
Tasks follow a fixed lifecycle:

```

ASSIGNED → ONGOING → REVIEW → ACCEPTED

```

- State changes are only possible through explicit endpoints
- No generic update or patch routes are used
- Invalid or skipped transitions are rejected at the backend

---

### 2. Role-Based Access Control
Each action is restricted by user role:

- **Managers**
  - Create tasks
  - Review submitted tasks
  - Accept or reject work
  - Soft-delete tasks
- **Developers**
  - Start assigned tasks
  - Submit tasks for review

Authorization checks are enforced server-side for every request.

---

### 3. Backend-Enforced Rules
The frontend does not decide permissions or transitions.

All validations related to:
- user role
- task state
- team ownership

are handled within middleware and controllers.

---

### 4. Audit History
Every task state transition is recorded in a dedicated history table.

Each history record contains:
- Task identifier
- Previous state and next state
- Actor ID
- Actor role
- Optional comment
- Timestamp

History entries are append-only and are not modified or removed.

---

### 5. Soft Delete Strategy
- Tasks are never physically removed from the database
- Managers can mark tasks as deleted using a soft delete flag
- Accepted tasks cannot be deleted
- Task history remains accessible even after deletion

---

### 6. Authentication and Session Management
Authentication follows production-oriented practices:

- Short-lived JWT access tokens
- Refresh token rotation
- HTTP-only cookies
- Refresh tokens stored and validated in the database
- Password hashing using bcrypt
- Centralized authentication middleware
- `/me` endpoint for session validation

---

## Technology Stack

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT
- bcrypt

### Frontend
- React
- TypeScript
- Axios
- Context API

The frontend is intentionally simple and exists to demonstrate interaction with the backend APIs.

---

## API Design Principles

- Endpoints represent **actions**, not direct state mutations
- Each state transition has a dedicated route
- No generic PATCH or PUT endpoints for tasks
- Business logic resides exclusively in the backend

Example:
```

POST /tasks/:id/start
POST /tasks/:id/submit
POST /tasks/:id/review

```

---

## API Overview

### Authentication
```

POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me

```

---

### Tasks
```

POST   /tasks
GET    /tasks
GET    /tasks/:taskId

POST   /tasks/:taskId/start
POST   /tasks/:taskId/submit
POST   /tasks/:taskId/review

DELETE /tasks/:taskId   (soft delete)

```

---

### Teams
```

GET  /teams
POST /teams

```

Team ownership is validated for all manager actions.

---

## Project Structure

### Backend
```

Backend/
├── src/
│   ├── Controllers/
│   ├── DB/
│   ├── Interfaces/
│   ├── Middlewares/
│   ├── Routers/
│   ├── Utils/
│   ├── express.types.d.ts
│   └── index.ts

```

---

## Environment Setup

Create environment files from the examples before running the apps:

- `Backend/.env` from `Backend/.env.example`
- `Frontend/.env` from `Frontend/.env.example`

### Backend variables

- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRY` (optional, defaults to `15m`)
- `REFRESH_TOKEN_EXPIRY` (optional, defaults to `7d`)
- `DB_HOST` (optional, defaults to `localhost`)
- `DB_PORT` (optional, defaults to `5432`)
- `DB_USER` (optional, defaults to `postgres`)
- `DB_PASSWORD`
- `DB_NAME` (optional, defaults to `flow_management`)

### Frontend variables

- `VITE_API_BASE_URL` (optional, defaults to `http://localhost:8000/api/v1`)


### Frontend
```

Frontend/
├── src/
│   ├── api/
│   ├── context/
│   ├── features/
│   ├── Pages/
│   ├── routes/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx

```

---

## Key Takeaways

This project demonstrates:

- Backend-first system design
- Explicit workflow enforcement
- Role-based access control
- Secure authentication patterns
- Clear separation of responsibilities
- Maintainable and auditable task flow

---

## Future Improvements

- Database transactions for multi-step operations
- Task deadlines and reminders
- Task reassignment workflows
- Query optimization and indexing
- Notifications
- Administrative analytics
- Rate limiting and monitoring

---

## Summary

The Flow Management System focuses on building a clear and reliable backend that enforces business rules consistently.  
The design prioritizes correctness, clarity, and extensibility, making it suitable as a foundation for more advanced features in the future.
