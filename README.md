# Tasks Management Assessment App

A full-stack task management app. Users can register, log in, and manage personal tasks — create, filter by status or priority, update, and delete. T

The backend is a REST API built with Node.js, Express, TypeScript, and MongoDB. The frontend is a Next.js 16 app using the App Router and Tailwind CSS.

---

## Project structure

```
assessment/
├── docker-compose.yml
├── README.md
├── client/
└── server/
```

---

## Prerequisites

- Node.js v18 or higher
- npm v8 or higher
- A MongoDB connection string (local or Atlas)

---

## Getting started

You can run the two apps independently with npm, or together with Docker.

---

### A. Run with npm

#### 1. Set up the server

```bash
cd assessment/server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:3000
```

Start the server:

```bash
npm run dev
```

The API will be running at **http://localhost:5000**.
Interactive Swagger docs are at **http://localhost:5000/api-docs**.

---

#### 2. Set up the client

Open a second terminal:

```bash
cd assessment/client
npm install
```

Create a `.env.local` file inside `client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The app will be at **http://localhost:3000**.

---

### Option 2 — Run with Docker

Create a `.env` file at the root of the `assessment/` folder:

```env
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then from the `assessment/` root:

```bash
docker compose up --build
```

| Service      | URL                            |
| ------------ | ------------------------------ |
| Frontend     | http://localhost:3000          |
| API          | http://localhost:5000/api      |
| Swagger docs | http://localhost:5000/api-docs |
| Health check | http://localhost:5000/health   |

To stop everything:

```bash
docker compose down
```

To also wipe the stored database data:

```bash
docker compose down -v
```

## More detail

- [`server/README.md`](./server/README.md) — API architecture, all endpoints, and design decisions
- [`client/README.md`](./client/README.md) — Frontend structure, auth flow, and component breakdown
