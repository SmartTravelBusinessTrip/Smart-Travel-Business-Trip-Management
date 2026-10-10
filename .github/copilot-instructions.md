# Copilot instructions for Smart Travel & Business Trip Management

## Project overview

This repo is a monorepo for a full-stack business trip management system with a single local deployment model:

- Backend: Node.js + Express + TypeScript + Prisma
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Database: SQLite for local development; schema and migrations are managed with Prisma
- Runtime model: the backend serves the compiled frontend on the same port (`http://localhost:5000`), so there is no separate Vite dev server for normal local runs

The core business flow is: Trip Request → Approval → Itinerary → Trip → Expense → Close. The backend owns business rules, policy checks, approval flow, and AI itinerary generation logic; the frontend is primarily the UI and orchestration layer.

## Local setup and common commands

Requirements: Node.js 20+, npm 9+.

### Install dependencies

```bash
# backend
cd src/backend
npm install

# frontend
cd ../frontend
npm install
```

### Environment variables

Create local environment files without committing secrets:

```bash
cd src/backend
copy .env.example .env
```

The required app values in `src/backend/.env` are the JWT secrets and database URL. The README documents the default local values and demo accounts.

### Bootstrap database and demo data

```bash
cd src/backend
npm run db:migrate
npm run db:seed
```

### Run the app

```bash
cd src/backend
npm run dev
```

Then open `http://localhost:5000`.

### Build and validation commands

```bash
# backend type-check
cd src/backend
npm run type-check

# backend production build (also builds frontend bundle)
cd src/backend
npm run build

# frontend build
cd src/frontend
npm run build

# frontend lint
cd src/frontend
npm run lint
```

### Test commands

Use the repo’s Vitest setup; backend and frontend tests are split by scope.

```bash
# root shortcuts
npm run test:unit
npm run test:unit:be
npm run test:unit:fe
npm run test:integration
npm run test:api
npm run test:e2e
```

Run a single test file instead of the whole suite:

```bash
# backend single-file example
cd src/backend
npx vitest run ../../tests/unit/role.guard.test.ts

# backend integration single-file example
cd src/backend
npx vitest run ../../tests/integration/concurrency.test.ts

# frontend single-file example
cd src/frontend
npx vitest run ../../tests/unit/frontend/LoginForm.test.tsx
```

For a single test name in a file:

```bash
cd src/backend
npx vitest run ../../tests/unit/role.guard.test.ts -t "returns 401 when missing token"
```

## High-level architecture

### Monorepo structure

- Root package.json defines workspaces and shared scripts for backend/frontend commands.
- `src/backend/` holds the API server, Prisma schema, migrations, and business logic.
- `src/frontend/` holds the React SPA and UI tests.
- `docs/05-technical/architecture.md` is the authoritative design document for the system architecture and lifecycle.

### Backend architecture

The Express app is bootstrapped in `src/backend/src/server.ts` and built by `src/backend/src/app.ts`.

Key patterns:

- Middleware chain handles request logging, CORS, body parsing, rate limiting, auth checks, and error handling.
- Public and protected routes are registered in `src/backend/src/routes/*`.
- Business logic is kept in `src/backend/src/services/*` instead of the route layer.
- Policies, approval flow, and AI orchestration are server-side responsibilities rather than client-side logic.
- `src/backend/src/prisma/schema.prisma` is the canonical database model for the app.

### Frontend architecture

The frontend is a single-page app centered around `src/frontend/src/App.tsx` and service modules under `src/frontend/src/services/*`.

Key patterns:

- The SPA calls the backend API at `/api/v1/*`.
- It uses a service layer for HTTP calls and data mapping; it does not contain the authoritative business rules.
- It is designed to be served by the backend in production-like local runs, not via a dedicated dev server.
- UI tests live under `tests/unit/frontend` and are run with the frontend Vitest config.

## Conventions specific to this repo

- Prefer backend-owned validation and authorization. The frontend should reflect API state, not duplicate core business rules.
- Keep API routes under `/api/v1/*` and treat route-level authorization as the enforced boundary.
- Use Prisma migrations (`npm run db:migrate`, `db:reset`, `db:setup`) for schema changes and data seeding; do not hand-edit generated schema output.
- Keep secrets out of the repo; do not commit `.env` files.
- Follow the existing test organization: `tests/unit`, `tests/integration`, `tests/api`, and `tests/e2e` for backend, plus `tests/unit/frontend` for frontend component tests.
- When changing backend logic, validate the relevant backend test(s) and, if the change affects the app flow, also check the frontend build or UI tests.
- The monorepo uses a shared root `package.json` with workspaces, but developer workflows are still organized per subproject.
- If a frontend change affects the full-local app flow, rebuild the frontend before relying on the backend’s static serving path:

```bash
cd src/frontend
npm run build
```

## Repository-specific notes for future Copilot sessions

- The README is the main runtime guide and contains the local setup, demo credentials, and single-port architecture notes.
- `docs/05-technical/architecture.md` is the best reference when you need the end-to-end system design, approval lifecycle, and service boundaries.
- The backend is the source of truth for policy enforcement and AI-driven trip processing; avoid implementing business rules only in the UI.
- CI runs the backend and frontend validation pipeline in `.github/workflows/ci.yml`, including Prisma validation, backend type-check, frontend lint, unit tests, integration tests, and a production build.
