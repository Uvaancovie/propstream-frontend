import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import PropertiesPage from './pages/PropertiesPage';
import AddPropertyPage from './pages/AddPropertyPage';
import BookingsPage from './pages/BookingsPage';
import BookingPage from './pages/BookingPage';
import CalendarPage from './pages/CalendarPage';
import MessagesPage from './pages/MessagesPage';
import BillingPage from './pages/BillingPage';
import PublicPropertiesPage from './pages/PublicPropertiesPage';
import PublicPropertyDetailsPage from './pages/PublicPropertyDetailsPage';
import BrowsePropertiesPage from './pages/BrowsePropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import AIGeneratorPage from './pages/AIGeneratorPage';
import SavedListingsPage from './pages/SavedListingsPage';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import OwnerRealtorInsights from './pages/OwnerRealtorInsights';
import DemoPage from './pages/DemoPage';
import BillingReturn from './pages/BillingReturn';
import RealtorNewsletterPage from './pages/RealtorNewsletterPage';
import NewsInboxPage from './pages/NewsInboxPage';
import RealtorNewsPage from './pages/RealtorNewsPage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role
    if (user?.role === 'client') {
  return <Navigate to="/browse" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Public Route Component (redirect based on role if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    // Always redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Layout
const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-[#0A0A0A]">
    <Navbar />
    <main className="flex-1">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                } 
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/demo"
                element={<DemoPage />}
              />

              {/* Public property routes - available to all */}
              <Route path="/browse" element={<PublicPropertiesPage />} />
              <Route path="/property/:slug" element={<PublicPropertyDetailsPage />} />
              <Route
                path="/browse-auth"
                element={
                  <AppLayout>
                    {/* Allow both authenticated and unauthenticated users to access this page */}
                    <BrowsePropertiesPage />
                  </AppLayout>
                }
              />
              <Route
                path="/property/:id"
                element={
                  <AppLayout>
                    <PropertyDetailsPage />
                  </AppLayout>
                }
              />

              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['realtor', 'client', 'admin', 'owner']}>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/properties" 
                element={
                  <ProtectedRoute allowedRoles={['realtor']}>
                    <AppLayout>
                      <PropertiesPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/properties/add" 
                element={
                  <ProtectedRoute allowedRoles={['realtor']}>
                    <AppLayout>
                      <AddPropertyPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-studio" 
                element={
                  <ProtectedRoute allowedRoles={['realtor']}>
                    <AppLayout>
                      <AIGeneratorPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/saved-listings" 
                element={
                  <ProtectedRoute allowedRoles={['realtor']}>
                    <AppLayout>
                      <SavedListingsPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['owner', 'admin', 'realtor']}>
                    <AppLayout>
                      <AdminDashboard />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/owner/realtor-insights"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'admin']}>
                    <AppLayout>
                      <OwnerRealtorInsights />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/bookings" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <BookingsPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['client','realtor','owner','admin']}>
                    <AppLayout>
                      <UserProfile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/property/:propertyId/book" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <BookingPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute allowedRoles={['realtor']}>
                    <AppLayout>
                      <CalendarPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/news" 
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <AppLayout>
                      <NewsInboxPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/realtor/news" 
                element={
                  <ProtectedRoute allowedRoles={['realtor']}>
                    <AppLayout>
                      <RealtorNewsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/realtor/newsletter" 
                element={
                  <ProtectedRoute allowedRoles={['realtor']}>
                    <AppLayout>
                      <RealtorNewsletterPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute allowedRoles={['realtor','client']}>
                    <AppLayout>
                      <MessagesPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/billing" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <BillingPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/billing/return" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <BillingReturn />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Toast notifications */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'font-medium',
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
