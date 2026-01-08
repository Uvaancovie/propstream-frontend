# Frontend Architecture

The frontend is a Vite + React SPA. Routes are declared in a single place and each route is usually backed by a page component in `src/pages`.

## Entry points

- App boot: [src/main.jsx](../../src/main.jsx)
- Router + auth provider: [src/App.jsx](../../src/App.jsx)

## Routing model

The app uses `react-router-dom` with two guard components:

- `PublicRoute`: if authenticated, redirects to `/dashboard`
- `ProtectedRoute`: if unauthenticated, redirects to `/login?redirect=...`; if role not allowed, redirects based on role

See guards in [src/App.jsx](../../src/App.jsx).

## Auth state

Auth is handled by:

- Saving `authToken` and `user` in `localStorage`
- Verifying token validity on startup by calling `GET /api/auth/me`

Implementation:

- [src/contexts/AuthContext.jsx](../../src/contexts/AuthContext.jsx)
- Auth API wrappers in [src/services/api.js](../../src/services/api.js)

## API client conventions

The axios client:

- reads `import.meta.env.VITE_API_BASE_URL` (fallback `http://localhost:4000/api`)
- attaches `Authorization: Bearer <token>` via an interceptor
- on `401`, clears auth and redirects to login

See [src/services/api.js](../../src/services/api.js).

## React Query

React Query is initialized in [src/App.jsx](../../src/App.jsx) and used by pages to cache and refetch API calls.

## “How a page is typically built”

Pattern you’ll see repeatedly:

1. **Page loads** → local state `loading=true`
2. Calls API via `api.get(...)` or a wrapper from [src/services/api.js](../../src/services/api.js)
3. Renders skeleton/spinner, then content
4. For forms: submit → toast → navigate or refetch

## Jump-to examples (important pages)

- Billing: [src/pages/BillingPage.jsx](../../src/pages/BillingPage.jsx)
- Billing return polling: [src/pages/BillingReturn.jsx](../../src/pages/BillingReturn.jsx)
- News feed: [src/pages/NewsInboxPage.jsx](../../src/pages/NewsInboxPage.jsx)
- Realtor newsletter: [src/pages/RealtorNewsletterPage.jsx](../../src/pages/RealtorNewsletterPage.jsx)
- Public browse: [src/pages/PublicPropertiesPage.jsx](../../src/pages/PublicPropertiesPage.jsx)

## Common debugging checklist

- Wrong API host? Confirm `VITE_API_BASE_URL` and inspect the axios `baseURL`.
- Getting kicked to login? Look for a `401` response; the response interceptor forces navigation.
- Role mismatch? Confirm the role is present in `/auth/me` response and in route guard allowedRoles.

## Related docs

- Deployment env var expectations: [../../DEPLOYMENT.md](../../DEPLOYMENT.md)
