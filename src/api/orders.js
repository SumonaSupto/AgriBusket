import apiClient from './client';

export const orderAPI = {
  // Get user orders
  getOrders: async (filters = {}) => {
    return apiClient.get('/orders', filters);
  },

  // Get single order by ID
  getOrder: async (id) => {
    return apiClient.get(`/orders/${id}`);
  },

  // Create new order
  createOrder: async (orderData) => {
    return apiClient.post('/orders', orderData);
  },

  // Update order status (Admin/Farmer)
  updateOrderStatus: async (id, statusData) => {
    return apiClient.put(`/orders/${id}/status`, statusData);
  },

  // Cancel order
  cancelOrder: async (id) => {
    return apiClient.delete(`/orders/${id}`);
  },

  // Get order statistics (Admin)
  getOrderStats: async () => {
    return apiClient.get('/orders/stats/summary');
  },

  // Get user's order history
  getUserOrderHistory: async (userId) => {
    return apiClient.get('/orders', { userId });
  }
};
