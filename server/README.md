# Tasks — API

The backend for TaskFlow. A REST API built with Node.js, TypeScript, Express, and MongoDB. Handles user registration and login, JWT-based auth with proper logout (token blacklisting), and task CRUD with ownership enforcement.

## Folder structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB connection
│   │   └── swagger.ts           # Swagger/OpenAPI spec
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts   # Register, login, logout, getMe
│   │   └── task.controller.ts   # Task CRUD handlers
│   │
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification + blacklist check
│   │   ├── errorHandler.ts      # Central error handler + createError helper
│   │   └── validate.ts          # Runs express-validator result check
│   │
│   ├── models/
│   │   ├── BlacklistedToken.ts  # TTL-backed token blacklist
│   │   ├── Task.ts              # Task schema with compound indexes
│   │   └── User.ts              # User schema with bcrypt pre-save hook
│   │
│   ├── routes/
│   │   ├── auth.routes.ts       # /api/auth/*
│   │   └── task.routes.ts       # /api/tasks/* — guarded by authenticate
│   │
│   ├── services/
│   │   ├── auth.service.ts      # Registration, login, logout
│   │   └── task.service.ts      # Task CRUD + ownership enforcement
│   │
│   ├── types/
│   │   └── index.ts             # AuthenticatedRequest + JwtPayload interfaces
│   │
│   ├── utils/
│   │   └── jwt.ts               # signToken, verifyToken, getTokenExpiry
│   │
│   ├── validators/
│   │   ├── auth.validators.ts   # Validation chains for register + login
│   │   └── task.validators.ts   # Validation chains for create, update, filter
│   │
│   ├── app.ts                   # Express setup — middleware, routes, error handler
│   └── server.ts                # Entry point — connects DB then starts server
│
├── Dockerfile
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Running locally

### Prerequisites

- Node.js v18 or higher
- A running MongoDB instance — local or Atlas

### Steps

```bash
cd assessment/server
npm install
```

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

### Build for production

```bash
npm run build
npm start
```

## API reference

All endpoints return JSON. Protected routes (marked 🔒) require an `Authorization: Bearer <token>` header.

Full interactive docs are at `http://localhost:5000/api-docs` when the server is running.

---

### Auth

#### `POST /api/auth/register`

Create a new user account.

```json
// Request body
{
  "name": "Bolaji Adebayo",
  "email": "bolaji@example.com",
  "password": "secret123"
}

// 201 response
{
  "status": "success",
  "token": "<jwt>",
  "data": { "user": { ... } }
}
```

#### `POST /api/auth/login`

Log in with email and password.

```json
// Request body
{
  "email": "bolaji@example.com",
  "password": "secret123"
}

// 200 response
{
  "status": "success",
  "token": "<jwt>",
  "data": { "user": { ... } }
}
```

#### `POST /api/auth/logout`

Adds the current token to the blacklist so it cannot be reused.

```json
// 200 response
{ "status": "success", "message": "Logged out successfully" }
```

#### `GET /api/auth/me`

Returns the profile of the currently authenticated user.

```json
// 200 response
{
  "status": "success",
  "data": { "user": { ... } }
}
```

---

### Tasks

All task routes require a valid JWT. Users can only see and modify their own tasks.

#### `GET /api/tasks`

Returns all tasks for the authenticated user. Both query params are optional.

| Param      | Values                        |
| ---------- | ----------------------------- |
| `status`   | `todo`, `in-progress`, `done` |
| `priority` | `low`, `medium`, `high`       |

Example: `GET /api/tasks?status=todo&priority=high`

```json
// 200 response
{
  "status": "success",
  "results": 2,
  "data": { "tasks": [ ... ] }
}
```

#### `POST /api/tasks`

Creates a new task. Only `title` is required. `priority` defaults to `medium`, `status` defaults to `todo`.

```json
// Request body
{
  "title": "Finish assessment",
  "description": "Complete and push to GitHub",
  "dueDate": "2026-04-03T12:00:00.000Z",
  "priority": "high",
  "status": "todo"
}

// 201 response
{
  "status": "success",
  "data": { "task": { ... } }
}
```

#### `PATCH /api/tasks/:id`

Partially updates a task — send only the fields you want to change. Returns `404` if the task doesn't exist or belongs to a different user.

```json
// Request body (any subset of fields)
{
  "status": "in-progress",
  "priority": "low"
}

// 200 response
{
  "status": "success",
  "data": { "task": { ... } }
}
```

#### `DELETE /api/tasks/:id`

Deletes a task. Returns `204` on success, `404` if not found or not owned by the requesting user.

---

## Design decisions

**Layered architecture (controllers → services → models).** Controllers handle HTTP — parsing the request, shaping the response. Services hold all the business logic and have no Express dependency, which means they are straightforward to test without spinning up an HTTP server. Models handle data shape and database interactions only.

**JWT logout via blacklist.** JWTs are stateless — once issued, they remain valid until they expire. Just deleting the token on the client gives the appearance of logout but the token still works server-side. To close this gap, invalidated tokens go into a `BlacklistedToken` collection and every protected request checks it before proceeding. A MongoDB TTL index on the `expiresAt` field clears entries automatically once the token's natural expiry passes, so the collection never grows unbounded.

**Ownership enforced at the query level.** Rather than fetching a task and then checking if the owner matches, the owner constraint is part of the Mongoose query itself:

```ts
Task.findOneAndUpdate({ _id: taskId, owner: userId }, ...)
```

**Compound indexes on the Task collection.** Two compound indexes — `{ owner, status }` and `{ owner, priority }` — match the most common query pattern: all tasks for a user, optionally filtered. Without them, MongoDB would scan every task document on each filtered request. With them, it can satisfy the query directly from the index.

**Operational vs unexpected errors.** The error handler separates errors the app intentionally throws (wrong password, task not found, duplicate email) from errors that shouldn't happen (database failures, bugs). Intentional errors send their message directly to the client. Everything else returns a generic `"Something went wrong"`.

---

## limitations

Things that I would do with more time:

- **Refresh tokens**
- **Rate limiting**
- **Pagination**
- **Tests**
- **Admin fnctionality**
