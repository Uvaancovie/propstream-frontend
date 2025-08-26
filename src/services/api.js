import axios from 'axios';
import toast from 'react-hot-toast';

// Use environment variable or fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://propstream-api.onrender.com/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Properties API calls
export const propertiesAPI = {
  getAll: async () => {
    const response = await api.get('/properties');
    return response.data;
  },
  
  create: async (propertyData) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },
  
  updateCalendars: async (id, calendars) => {
    const response = await api.patch(`/properties/${id}/calendars`, calendars);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  }
};

// Bookings API calls
export const bookingsAPI = {
  getAll: async (propertyId = null) => {
    const params = propertyId ? { propertyId } : {};
    const response = await api.get('/bookings', { params });
    return response.data;
  },
  
  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  
  cancel: async (id) => {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data;
  }
};

// Calendar API calls
export const calendarAPI = {
  import: async (importData) => {
    const response = await api.post('/calendar/import', importData);
    return response.data;
  },
  
  getExportUrl: async (propertyId) => {
    const response = await api.get(`/platforms/${propertyId}/ics-export`);
    return response.data;
  }
};

// Message templates API calls
export const messagesAPI = {
  getAll: async () => {
    const response = await api.get('/messages');
    return response.data;
  },
  
  create: async (templateData) => {
    const response = await api.post('/messages', templateData);
    return response.data;
  },
  
  update: async (id, templateData) => {
    const response = await api.patch(`/messages/${id}`, templateData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  }
};

// Billing API calls
export const billingAPI = {
  createSession: async (sessionData) => {
    const response = await api.post('/billing/payfast/session', sessionData);
    return response.data;
  },
  
  getSubscription: async () => {
    const response = await api.get('/billing/me');
    return response.data;
  }
};

// Utility function for handling API errors
export const handleAPIError = (error) => {
  const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
  toast.error(message);
  console.error('API Error:', error);
  return message;
};

// Export api instance as both named and default export
export { api };
export default api;
