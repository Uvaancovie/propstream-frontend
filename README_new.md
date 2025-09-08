# PropNova - Real Estate Platform

A modern real estate platform built with React and Node.js.

## Live Deployment
- Frontend: [https://www.nova-prop.com](https://www.nova-prop.com)
- Backend API: [https://nova-prop-backend.onrender.com](https://nova-prop-backend.onrender.com)

## Technology Stack
- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB

## Setup and Installation

### Prerequisites
- Node.js >= 14.x
- npm or yarn
- Git

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/Uvaancovie/propstream-frontend.git
   cd propstream-frontend
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   cd backend
   npm install
   cd ..
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` for frontend
   - Copy `backend/.env.example` to `backend/.env` for backend

5. Start development servers:
   
   Frontend:
   ```
   npm run dev
   ```

   Backend:
   ```
   cd backend
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick deployment:

```bash
# Windows
./deploy.ps1

# Unix/Linux/Mac
bash ./deploy.sh
```

Or using npm:

```bash
npm run deploy
```

## Features
- Property listing and management
- Booking system
- Messaging between clients and realtors
- Invoicing system
- User authentication
- Dashboard analytics

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License
