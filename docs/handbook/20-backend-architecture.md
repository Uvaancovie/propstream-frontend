# Backend Architecture

The backend is an Express API with MongoDB via Mongoose. The main pattern is:

`router → middleware (auth/role/quota) → controller → model → response`

## Entry points

- Express app + middleware stack + route mounting: [backend/server.js](../../backend/server.js)
- DB connect: [backend/config/db.js](../../backend/config/db.js)

## Middleware stack (why order matters)

Important ordering decisions:

- **PayFast ITN raw body capture** runs **before** `express.urlencoded()` and `express.json()`.
- Security middleware (helmet, rate limiters, sanitizers) runs early.
- CORS is configured with an allow-list and preflight is handled globally.

See the exact ordering in [backend/server.js](../../backend/server.js).

## Authentication + authorization

- JWT parsing/verification: `protect` in [backend/middleware/auth.js](../../backend/middleware/auth.js)
- RBAC: `authorize(...roles)` in [backend/middleware/auth.js](../../backend/middleware/auth.js)

Most protected routes use `[protect, authorize('role')]`.

## Routing structure

Routers live in [backend/routes/](../../backend/routes/). They typically:

- validate required params/body
- apply auth/role guards
- delegate to controllers or inline handler logic

The backend mounts routers like:

- `/api/auth` → [backend/routes/authRoutes.js](../../backend/routes/authRoutes.js)
- `/api/properties` → [backend/routes/propertyRoutes.js](../../backend/routes/propertyRoutes.js)
- `/api/public` → [backend/routes/publicBrowseRoutes.js](../../backend/routes/publicBrowseRoutes.js)
- `/api/billing` → [backend/routes/billing.js](../../backend/routes/billing.js)
- `/payfast/itn` → [backend/routes/payfast.itn.js](../../backend/routes/payfast.itn.js)

See [backend/server.js](../../backend/server.js) for the authoritative list.

## Models

Schemas are in [backend/models/](../../backend/models/). A few key “relationship” patterns:

- `User` references an organization (field name varies: `orgId` or `organizationId` in code paths).
- Properties/bookings/etc reference a user (owner/realtor/client) depending on the feature.

When working on a flow, always confirm which IDs are used by inspecting the route implementation.

## Error handling

- Central handler: [backend/middleware/error.js](../../backend/middleware/error.js)
- A 404 JSON response is returned for unknown routes in [backend/server.js](../../backend/server.js)

## Related backend docs (existing)

- Overview: [../../backend/docs/00-overview.md](../../backend/docs/00-overview.md)
- Middleware + routes: [../../backend/docs/30-backend-middleware-and-routes.md](../../backend/docs/30-backend-middleware-and-routes.md)
- PayFast: [../../backend/docs/40-backend-payfast.md](../../backend/docs/40-backend-payfast.md)
