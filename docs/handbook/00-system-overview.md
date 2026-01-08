# System Overview

This repo contains a React frontend and an Express/Mongo backend. Most “features” are implemented as:

- **Frontend page** (route + UI)
- **Frontend service call** (axios → backend endpoint)
- **Backend route** (Express router)
- **Backend controller** (business logic)
- **Mongo models** (Mongoose)

## Subsystems (what exists)

### Frontend (Vite + React)

- Client-side routing and role-based access lives in [src/App.jsx](../../src/App.jsx).
- API calls are centralized in [src/services/api.js](../../src/services/api.js).
- Auth state is managed via localStorage + a profile verification call in [src/contexts/AuthContext.jsx](../../src/contexts/AuthContext.jsx).

### Backend (Express + Mongoose)

- Express app setup, middleware stack, and route mounting are in [backend/server.js](../../backend/server.js).
- Mongo connection is in [backend/config/db.js](../../backend/config/db.js).
- Most logic is Express Router → Controller → Model:
  - Routes: [backend/routes/](../../backend/routes/)
  - Controllers: [backend/controllers/](../../backend/controllers/)
  - Models: [backend/models/](../../backend/models/)

### Payments/Billing (PayFast)

- Billing endpoints (subscribe/checkout/subscription/etc.) live in [backend/routes/billing.js](../../backend/routes/billing.js).
- PayFast ITN webhook lives in [backend/routes/payfast.itn.js](../../backend/routes/payfast.itn.js).
- The backend captures **raw form body** before parsing (required for ITN validation) in [backend/server.js](../../backend/server.js).

### Newsletters + News feed

- Newsletter endpoints live in [backend/routes/newsletterRoutes.js](../../backend/routes/newsletterRoutes.js).
- News feed is built on top of **Messages** (message type `newsletter`) and is surfaced in the frontend via a “news inbox” page.

### AI

- AI chat and AI generator routes live in [backend/routes/](../../backend/routes/).
- LLM provider wrapper and context-building lives in [backend/lib/](../../backend/lib/).

## High-level request lifecycle (backend)

Most requests go through:

1. **Security middleware**: helmet, rate limiting, sanitizers
2. **Body parsing**: urlencoded + json
3. **CORS**: origin checks and preflight
4. **Router**: `/api/*` routes
5. **Auth middleware** (per route): JWT verification + role checks
6. **Controller**: validation + business logic
7. **Model**: DB reads/writes
8. **Error middleware**: consistent error response

See [backend/server.js](../../backend/server.js) to understand the exact order.

## Frontend runtime lifecycle

1. Vite bootstraps React from [src/main.jsx](../../src/main.jsx).
2. The app renders the router and auth provider in [src/App.jsx](../../src/App.jsx).
3. Auth provider reads localStorage, then verifies the token via `GET /api/auth/me` using [src/services/api.js](../../src/services/api.js).
4. Protected routes redirect unauthenticated users to `/login?redirect=...`.

## Where to go next

- If you want to quickly find “where things live”: [01-repo-tour-file-map.md](01-repo-tour-file-map.md)
- If you’re debugging a user journey end-to-end: start in the relevant flow doc in [flows/](flows/)

## Related existing docs

- Backend overview + plan model notes: [../../backend/docs/00-overview.md](../../backend/docs/00-overview.md)
- Backend routes/middleware notes: [../../backend/docs/30-backend-middleware-and-routes.md](../../backend/docs/30-backend-middleware-and-routes.md)
- PayFast deep dive: [../../backend/docs/40-backend-payfast.md](../../backend/docs/40-backend-payfast.md)
