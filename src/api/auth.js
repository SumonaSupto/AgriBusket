import apiClient from './client';

export const authAPI = {
  // Register new user
  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.success && response.data.token) {
      localStorage.setItem('agribasket_token', response.data.token);
      localStorage.setItem('agribasket_user', JSON.stringify(response.data.user));
    }
    return response;
  },

  // Admin login
  adminLogin: async (credentials) => {
    const response = await apiClient.post('/auth/admin-login', credentials);
    if (response.success && response.data.token) {
      localStorage.setItem('agribasket_token', response.data.token);
      localStorage.setItem('agribasket_user', JSON.stringify(response.data.user));
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('adminUsername', credentials.username);
    }
    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('agribasket_token');
    localStorage.removeItem('agribasket_user');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminUsername');
    return Promise.resolve({ success: true });
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('agribasket_token');
  },

  // Get stored user data
  getStoredUser: () => {
    const userStr = localStorage.getItem('agribasket_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
