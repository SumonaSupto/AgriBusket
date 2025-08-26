import apiClient from './client';

export const userAPI = {
  // Get all users (Admin)
  getUsers: async (filters = {}) => {
    return apiClient.get('/users', filters);
  },

  // Get single user by ID
  getUser: async (id) => {
    return apiClient.get(`/users/${id}`);
  },

  // Update user profile
  updateProfile: async (id, profileData) => {
    return apiClient.put(`/users/${id}`, profileData);
  },

  // Deactivate user (Admin)
  deactivateUser: async (id) => {
    return apiClient.delete(`/users/${id}`);
  },

  // Add product to wishlist
  addToWishlist: async (userId, productId) => {
    return apiClient.post(`/users/${userId}/wishlist`, { productId });
  },

  // Remove product from wishlist
  removeFromWishlist: async (userId, productId) => {
    return apiClient.delete(`/users/${userId}/wishlist/${productId}`);
  },

  // Get user statistics (Admin)
  getUserStats: async () => {
    return apiClient.get('/users/stats/summary');
  }
};
