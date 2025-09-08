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

## Troubleshooting

- If you encounter CORS errors, verify that both the backend and frontend configurations match
- Check that environment variables are properly set in both Vercel and Render
- Ensure that your database connection string is correctly configured in Render
