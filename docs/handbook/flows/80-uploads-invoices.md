# Uploads + Invoices

This repo includes:

- Static file hosting for uploaded assets (`/uploads`)
- Invoice PDF generation and download

## Upload serving (backend)

The backend serves uploaded files as static assets:

- Express static mount: `/uploads` in [backend/server.js](../../backend/server.js)
- Physical folder: [backend/uploads/](../../backend/uploads/) (runtime; may not be committed)

## Invoice generation (conceptual flow)

```mermaid
sequenceDiagram
  participant UI as Frontend
  participant API as Backend
  participant DB as MongoDB

  UI->>API: POST /api/invoices/generate/:bookingId
  API->>DB: load booking + related user/property
  API->>API: generate PDF
  API-->>UI: invoice metadata/filename

  UI->>API: GET /api/invoices/download/:filename
  API-->>UI: PDF file download
```

## Frontend implementation

- Invoice calls are wrapped in [src/services/api.js](../../src/services/api.js).

## Backend implementation

- Invoice routes: [backend/routes/invoiceRoutes.js](../../backend/routes/invoiceRoutes.js)
- Invoice controller: [backend/controllers/invoiceController.js](../../backend/controllers/invoiceController.js)

## Related docs

- Deployment: [../../DEPLOYMENT.md](../../DEPLOYMENT.md)
