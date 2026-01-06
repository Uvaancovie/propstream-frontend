# PropNova - Real Estate Platform

## Deployment Instructions

### Backend (Render.com)
The backend is deployed at: https://nova-prop-backend.onrender.com

1. Make sure your backend `.env` file has the correct CORS configuration:
   ```
   CORS_ORIGIN=https://www.nova-prop.com
   ```

2. Update `render.yaml` if needed:
   ```yaml
   - key: CORS_ORIGIN
     value: https://www.nova-prop.com
   ```

3. Push changes to your repository connected to Render.com for automatic deployment

### Frontend (Vercel.com)
The frontend is deployed at: https://www.nova-prop.com

1. Make sure your production environment variables are set in Vercel:
   - `VITE_API_BASE_URL=https://nova-prop-backend.onrender.com/api`
   - Copy any other required environment variables from `.env.production`

2. In your local development environment:
   - Use `.env` for local development (pointing to localhost)
   - Use `.env.production` for production configuration

3. Deploy to Vercel:
   ```
   git add .
   git commit -m "Update configuration for production"
   git push
   ```

## Local Development

1. Backend:
   ```
   cd backend
   npm install
   npm run dev
   ```

2. Frontend:
   ```
   npm install
   npm run dev
   ```

## Testing the Connection

To verify that your frontend is properly connected to the backend:
1. Open https://www.nova-prop.com
2. Try to log in or register
3. Check the network tab in browser developer tools to ensure API calls are going to https://nova-prop-backend.onrender.com/api

## Launch Checklist (Auth + Dashboard)

### 1) Environment variables

Frontend (Vercel):
- `VITE_API_BASE_URL=https://nova-prop-backend.onrender.com/api`

Backend (Render):
- `MONGO_URI=<mongo connection string>`
- `JWT_SECRET=<strong random secret>`
- `JWT_EXPIRE=30d` (or your preferred value)
- `CORS_ORIGIN=https://www.nova-prop.com`
- (If billing is enabled) `PAYFAST_*` variables per your billing setup

### 2) Routes you should confirm exist

Frontend pages:
- `/register` (public)
- `/login` (public)
- `/dashboard` (protected)

Backend endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (requires `Authorization: Bearer <token>`)

### 3) CORS + cookies

This app uses bearer tokens in `Authorization` headers (stored in `localStorage`). Ensure Render’s `CORS_ORIGIN` matches the deployed frontend domain exactly.

## Smoke Tests

### A) API smoke (PowerShell)

1) Register
```powershell
$base = "https://nova-prop-backend.onrender.com/api"
$regBody = @{ name="Smoke User"; email="smoke+$(Get-Random)@example.com"; password="SmokeTest123!"; role="client" } | ConvertTo-Json
$reg = Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType "application/json" -Body $regBody
$reg.success
$token = $reg.token
```

2) Get current user
```powershell
$me = Invoke-RestMethod -Method Get -Uri "$base/auth/me" -Headers @{ Authorization = "Bearer $token" }
$me.user.email
```

3) Login (optional, verifies credentials)
```powershell
$loginBody = @{ email=$reg.user.email; password="SmokeTest123!" } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType "application/json" -Body $loginBody
$login.success
```

### B) Browser smoke (end-to-end)

1) Visit `/dashboard` while logged out → should redirect to `/login?redirect=%2Fdashboard`
2) Log in → should land back on `/dashboard`
3) Log out → should return to public landing or browse
4) Role check:
   - client: should be blocked from realtor-only routes like `/properties`
   - realtor: should be able to access `/properties` and `/ai-studio`

## Troubleshooting

- If you encounter CORS errors, verify that both the backend and frontend configurations match
- Check that environment variables are properly set in both Vercel and Render
- Ensure that your database connection string is correctly configured in Render
