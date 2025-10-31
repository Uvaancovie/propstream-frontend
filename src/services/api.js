import axios from 'axios';
import toast from 'react-hot-toast';

// Use environment variable or fallback to local development URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

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
    
    // Log detailed error information
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers
    });
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    console.log('🔍 Sending registration data:', userData);
    console.log('🔗 API Base URL:', API_BASE_URL);
    const response = await api.post('/auth/register', userData);
    console.log('✅ Registration response:', response.data);
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/auth/stats');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    
    if (response.data.success) {
      // Update local storage with new user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...response.data.user
      }));
    }
    
    return response.data;
  },
  
  updatePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

// Properties API
export const propertiesAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/properties', { params: filters });
    return response.data;
  },
  
  getAllPublic: async (filters = {}) => {
    const response = await api.get('/properties/public', { params: filters });
    return response.data;
  },
  
  create: async (propertyData) => {
    try {
      console.log('Sending property data:', propertyData);
      const response = await api.post('/properties', propertyData);
      return response.data;
    } catch (error) {
      console.error('Error saving property:', error);
      if (error.response && error.response.data) {
        // Return the error response from the server
        return { 
          success: false, 
          error: error.response.data.error || 'An error occurred',
          message: error.response.data.message || error.message
        };
      }
      throw error;
    }
  },
  
  getById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },
  
  update: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  saveGenerated: async (generatedData) => {
    const response = await api.post('/properties/save-generated', generatedData);
    return response.data;
  }
};

// Bookings API
export const bookingsAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/bookings', { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  
  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  
  update: async (id, bookingData) => {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },
  
  cancel: async (id) => {
    const response = await api.put(`/bookings/${id}`, { status: 'cancelled' });
    return response.data;
  },
  
  getCalendarBookings: async (params) => {
    const queryString = params ? `?${params.toString()}` : '';
    const response = await api.get(`/bookings/calendar${queryString}`);
    return response.data;
  }
};

// Messages API
export const messagesAPI = {
  getAll: async () => {
    const response = await api.get('/messages');
    return response.data;
  },
  
  create: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },
  
  markAsRead: async (id) => {
    const response = await api.put(`/messages/${id}/read`);
    return response.data;
  }
};

// Invoices API
export const invoiceAPI = {
  generate: async (bookingId) => {
    const response = await api.post(`/invoices/generate/${bookingId}`);
    return response.data;
  },
  
  download: (filename) => {
    window.open(`${API_BASE_URL}/invoices/download/${filename}`, '_blank');
  }
};

// Waitlist API
export const waitlistAPI = {
  join: async (data) => {
    const response = await api.post('/waitlist/join', data);
    return response.data;
  },
  
  getStats: async (referralCode) => {
    let url = '/waitlist/stats';
    if (referralCode) {
      url += `?referralCode=${referralCode}`;
    }
    const response = await api.get(url);
    return response.data;
  }
};

// Billing API calls
export const billingAPI = {
  createSession: async (sessionData) => {
    const response = await api.post('/billing/subscribe', sessionData);
    return response.data;
  },
  
  getSubscription: async () => {
    const response = await api.get('/billing/subscription');
    return response.data;
  }
  ,
  startTrial: async (payload = {}) => {
    const response = await api.post('/billing/start-trial', payload);
    return response.data;
  }
};

// Newsletter API calls
export const newsletterAPI = {
  // Client actions
  subscribe: async (payload) => {
    // if payload is a string assume it's an email
    if (typeof payload === 'string') payload = { email: payload };
    try {
      if (payload.realtorId) {
        const response = await api.post('/newsletter/subscribe', { realtorId: payload.realtorId });
        return response.data;
      }
      // fallback to waitlist join when only email provided
      if (payload.email) {
        const response = await waitlistAPI.join({ email: payload.email, source: 'newsletter' });
        return response;
      }
      throw new Error('Invalid payload');
    } catch (error) {
      console.error('newsletter subscribe error', error);
      throw error;
    }
  },

  unsubscribe: async (payload) => {
    if (typeof payload === 'string') payload = { email: payload };
    try {
      if (payload.realtorId) {
        const response = await api.post('/newsletter/unsubscribe', { realtorId: payload.realtorId });
        return response.data;
      }
      if (payload.email) {
        const response = await api.post('/newsletter/unsubscribe', { email: payload.email });
        return response.data;
      }
      throw new Error('Invalid payload');
    } catch (error) {
      console.error('newsletter unsubscribe error', error);
      throw error;
    }
  },

  // Realtor actions
  getSubscribers: async (page = 1, pageSize = 20) => {
    const response = await api.get(`/newsletter/subscribers?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  getSentNewsletters: async (page = 1, pageSize = 20) => {
    const response = await api.get(`/newsletter/sent?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  getQuota: async () => {
    const response = await api.get('/newsletter/quota');
    return response.data;
  },

  send: async (newsletterData) => {
    const response = await api.post('/newsletter/send', newsletterData);
    return response.data;
  }
};

// AI Generator API
export const aiAPI = {
  generate: async (payload) => {
    // payload: { beds, baths, suburb, price, amenities }
    const response = await api.post('/ai-generator/generate', payload);
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/ai-generator/history');
    return response.data;
  }
};

// Property API
export const propertyAPI = {
  saveListing: async (data) => {
    const response = await api.post('/properties/save-generated', data);
    return response.data;
  },
  getSavedListings: async () => {
    const response = await api.get('/properties/saved');
    return response.data;
  }
};

// Admin API calls (for admin dashboard)
export const adminAPI = {
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  
  approveWaitlist: async (waitlistId) => {
    const response = await api.put(`/admin/waitlist/${waitlistId}/approve`);
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

// Export api instance
export { api };
export default api;
