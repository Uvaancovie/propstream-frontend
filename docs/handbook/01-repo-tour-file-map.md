# Repo Tour / File Map

Use this page when you’re asking: **“Where is the code that does X?”**

## Top-level

- [package.json](../../package.json): frontend scripts + dependencies.
- [vite.config.js](../../vite.config.js): Vite config.
- [tailwind.config.js](../../tailwind.config.js): Tailwind config.
- [DEPLOYMENT.md](../../DEPLOYMENT.md): deployment instructions.

## Frontend (root `/src`)

### Entry + routing

- [src/main.jsx](../../src/main.jsx): mounts React app into the DOM.
- [src/App.jsx](../../src/App.jsx): routes, route guards, layout wrapper.

### State and API

- [src/contexts/AuthContext.jsx](../../src/contexts/AuthContext.jsx): auth state + login/register/logout + token verification.
- [src/services/api.js](../../src/services/api.js): axios instance + API wrappers.

### Pages (user journeys)

- Billing: [src/pages/BillingPage.jsx](../../src/pages/BillingPage.jsx), return polling: [src/pages/BillingReturn.jsx](../../src/pages/BillingReturn.jsx)
- News feed: [src/pages/NewsInboxPage.jsx](../../src/pages/NewsInboxPage.jsx)
- Realtor newsletter compose/send: [src/pages/RealtorNewsletterPage.jsx](../../src/pages/RealtorNewsletterPage.jsx), [src/pages/RealtorNewsPage.jsx](../../src/pages/RealtorNewsPage.jsx)
- Public browse + details: [src/pages/PublicPropertiesPage.jsx](../../src/pages/PublicPropertiesPage.jsx), [src/pages/PublicPropertyDetailsPage.jsx](../../src/pages/PublicPropertyDetailsPage.jsx)
- Realtor properties CRUD: [src/pages/PropertiesPage.jsx](../../src/pages/PropertiesPage.jsx), [src/pages/AddPropertyPage.jsx](../../src/pages/AddPropertyPage.jsx), [src/pages/EditPropertyPage.jsx](../../src/pages/EditPropertyPage.jsx)
- AI studio/generator: [src/pages/AIGeneratorPage.jsx](../../src/pages/AIGeneratorPage.jsx)
- Messaging/DM: [src/pages/MessagesPage.jsx](../../src/pages/MessagesPage.jsx)

## Backend (root `/backend`)

### Entry + setup

- [backend/server.js](../../backend/server.js): express app setup + middleware order + router mounting.
- [backend/config/db.js](../../backend/config/db.js): connects to Mongo.

### Routes

Routes are mounted in [backend/server.js](../../backend/server.js). Key routers:

- Auth: [backend/routes/authRoutes.js](../../backend/routes/authRoutes.js)
- Properties (private): [backend/routes/propertyRoutes.js](../../backend/routes/propertyRoutes.js)
- Public properties: [backend/routes/publicBrowseRoutes.js](../../backend/routes/publicBrowseRoutes.js)
- Bookings: [backend/routes/bookingRoutes.js](../../backend/routes/bookingRoutes.js)
- Messages/news feed: [backend/routes/messageRoutes.js](../../backend/routes/messageRoutes.js)
- Newsletter: [backend/routes/newsletterRoutes.js](../../backend/routes/newsletterRoutes.js)
- Billing: [backend/routes/billing.js](../../backend/routes/billing.js)
- PayFast ITN: [backend/routes/payfast.itn.js](../../backend/routes/payfast.itn.js)
- Usage summary: [backend/routes/me.summary.js](../../backend/routes/me.summary.js)
- AI chat + generator: [backend/routes/aiChatRoutes.js](../../backend/routes/aiChatRoutes.js), [backend/routes/aiGeneratorRoutes.js](../../backend/routes/aiGeneratorRoutes.js)

### Controllers

Controllers implement business rules and map route inputs → model calls:

- [backend/controllers/authController.js](../../backend/controllers/authController.js)
- [backend/controllers/propertyController.js](../../backend/controllers/propertyController.js)
- [backend/controllers/bookingController.js](../../backend/controllers/bookingController.js)
- [backend/controllers/messageController.js](../../backend/controllers/messageController.js)
- [backend/controllers/invoiceController.js](../../backend/controllers/invoiceController.js)
- [backend/controllers/adminController.js](../../backend/controllers/adminController.js)

### Models

Mongoose schemas live in [backend/models/](../../backend/models/). You’ll most often touch:

- User: [backend/models/User.js](../../backend/models/User.js)
- Organization/subscription: [backend/models/Organization.js](../../backend/models/Organization.js), [backend/models/Subscription.js](../../backend/models/Subscription.js)
- Property: [backend/models/Property.js](../../backend/models/Property.js)
- Booking: [backend/models/Booking.js](../../backend/models/Booking.js)
- Messages + conversations: [backend/models/Message.js](../../backend/models/Message.js), [backend/models/Conversation.js](../../backend/models/Conversation.js)
- Newsletter: [backend/models/Newsletter.js](../../backend/models/Newsletter.js), [backend/models/NewsletterSubscription.js](../../backend/models/NewsletterSubscription.js)

### Middleware

- Auth/RBAC: [backend/middleware/auth.js](../../backend/middleware/auth.js)
- Error handling: [backend/middleware/error.js](../../backend/middleware/error.js)
- Quota/limits: [backend/middleware/checkPropertyLimit.js](../../backend/middleware/checkPropertyLimit.js), [backend/middleware/checkSavedListingsLimit.js](../../backend/middleware/checkSavedListingsLimit.js)

## Common change recipes (where to start)

### “Add a new backend endpoint”

1. Add route in [backend/routes/](../../backend/routes/)
2. Add controller function in [backend/controllers/](../../backend/controllers/)
3. Add/adjust model in [backend/models/](../../backend/models/)
4. Mount router in [backend/server.js](../../backend/server.js) (if it’s a new router)

### “Add a new frontend page”

1. Add page in [src/pages/](../../src/pages/)
2. Register route in [src/App.jsx](../../src/App.jsx)
3. Add API wrapper function in [src/services/api.js](../../src/services/api.js)

### “Change billing”

- Frontend: [src/pages/BillingPage.jsx](../../src/pages/BillingPage.jsx)
- Backend: [backend/routes/billing.js](../../backend/routes/billing.js) and ITN: [backend/routes/payfast.itn.js](../../backend/routes/payfast.itn.js)
- Docs: [../../backend/docs/40-backend-payfast.md](../../backend/docs/40-backend-payfast.md)

### “Change newsletters/news feed”

- Backend newsletter flow: [backend/routes/newsletterRoutes.js](../../backend/routes/newsletterRoutes.js)
- Backend feed/messages: [backend/routes/messageRoutes.js](../../backend/routes/messageRoutes.js)
- Frontend feed: [src/pages/NewsInboxPage.jsx](../../src/pages/NewsInboxPage.jsx)
