# Tasks — Frontend

The frontend for TaskFlow, built with Next.js 16 (App Router), TypeScript, and Tailwind CSS.

## Folder structure

```
client/
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Register page
│   ├── dashboard/page.tsx          # Main task dashboard (protected)
│   ├── layout.tsx                  # Root layout — wraps the app in AuthProvider
│   ├── page.tsx                    # Root redirect (/ → /dashboard or /login)
│   └── globals.css
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskForm.tsx
│   │   └── TaskFilters.tsx
│   └── ui/
│       ├── Modal.tsx
│       └── Badge.tsx
│
├── context/
│   └── AuthContext.tsx             # Global auth state: user, token, login(), logout()
│
├── lib/
│   └── api.ts                      # Fetch wrapper — auto-attaches the auth header
│
├── types/
│   └── index.ts                    # TypeScript interfaces
│
├── Dockerfile
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Running locally

### Prerequisites

- Node.js 18+
- The backend API running on `http://localhost:5000`

### Steps

```bash
cd assessment/client
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

The app will be at **http://localhost:3000**.

## How authentication works

There is no server-side session. Auth is handled entirely in the browser using JWTs.

### Logging in

When you submit the login or register form:

1. The form calls `apiLogin()` or `apiRegister()` from `lib/api.ts`
2. The API returns a token and a user object
3. The form calls `login(token, user)` from `AuthContext`
4. `login()` saves the token to `localStorage` under the key `tm_token` and puts both into React state
5. The user is redirected to `/dashboard`

### Making API requests

Every protected request needs `Authorization: Bearer <token>` in the header. Rather than doing this manually in each component, `lib/api.ts` has a central fetch wrapper that attaches the header automatically. All API functions accept a `token` argument and pass it through.

### Restoring a session after a page refresh

React state resets on refresh, but the token is still in `localStorage`. On mount, `AuthProvider` reads the token and sends it to `GET /api/auth/me`. If the server accepts it, the session is restored. If the server rejects it (expired or tampered), the token is removed and the user is sent to `/login`. The app shows a spinner during this check so there is no flash of the dashboard before a redirect.

### Protected routes

The dashboard checks auth state and redirects to `/login` if there is no valid token. It waits for the `isLoading` flag to clear before making that decision — this prevents the brief flash of the protected page before the redirect kicks in.

### Logging out

Logout calls `POST /api/auth/logout` to blacklist the token server-side, then clears `localStorage` and React state regardless of whether the API call succeeded or not.

---

## Pages

### `/` — Root redirect

Redirects to `/dashboard` if authenticated, otherwise to `/login`.

### `/login`

Email and password form. Shows field-level error messages from the API. The submit button shows a loading state while the request is in flight. Links to `/register`.

### `/register`

Name, email, and password (min 6 characters). Same error handling and loading behaviour as login. Links to `/login`.

### `/dashboard` — Task dashboard (protected)

- **Header** — app name, the logged-in user's name, sign-out button
- **Stats strip** — live count of To Do / In Progress / Done tasks
- **Filter bar** — filter by status and/or priority; a clear button appears when filters are active
- **Task grid** — responsive 1/2/3 column grid of task cards
- **New Task button** — opens a modal with the creation form
- **Toast notifications** — brief confirmation after create, update, or delete

---
