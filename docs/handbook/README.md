# PropNova Developer Handbook

This handbook explains **how the codebase works** and how to navigate it as a developer.

It is intentionally **process-first** (how requests and user actions flow through the system) and **file-map driven** (where each responsibility lives).

## Start here

1. System overview: [00-system-overview.md](00-system-overview.md)
2. Repo tour (file map + where to change things): [01-repo-tour-file-map.md](01-repo-tour-file-map.md)
3. Frontend architecture: [10-frontend-architecture.md](10-frontend-architecture.md)
4. Backend architecture: [20-backend-architecture.md](20-backend-architecture.md)

## Core flows (end-to-end)

- Auth (login/register/me + route guards): [flows/30-auth.md](flows/30-auth.md)
- Billing / PayFast subscriptions + ITN: [flows/40-billing-payfast.md](flows/40-billing-payfast.md)
- Newsletters + News Feed: [flows/50-newsletters-newsfeed.md](flows/50-newsletters-newsfeed.md)
- AI chat + AI listing generator: [flows/60-ai.md](flows/60-ai.md)
- Properties + Public browse: [flows/70-properties.md](flows/70-properties.md)
- Uploads + Invoices: [flows/80-uploads-invoices.md](flows/80-uploads-invoices.md)

## Existing docs this handbook builds on

- Project overview: [../../README.md](../../README.md)
- Deployment: [../../DEPLOYMENT.md](../../DEPLOYMENT.md)
- Newsletter spec/history: [../../NEWSLETTER_SYSTEM_COMPLETE.md](../../NEWSLETTER_SYSTEM_COMPLETE.md)
- News feed UI notes: [../../NEWS_FEED_IMPLEMENTATION.md](../../NEWS_FEED_IMPLEMENTATION.md)
- Backend deep dives: [../../backend/docs/](../../backend/docs/)

## Conventions used in this handbook

- **Jump-to files** sections link to the implementation so you can go from concept → code fast.
- **Mermaid diagrams** are embedded. If your Markdown viewer doesn’t render Mermaid, use the plain-text steps under each diagram.
