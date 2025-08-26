import apiClient from './client';

export const productAPI = {
  // Get all products with filtering
  getProducts: async (filters = {}) => {
    return apiClient.get('/products', filters);
  },

  // Get single product by ID
  getProduct: async (id) => {
    return apiClient.get(`/products/${id}`);
  },

  // Create new product (Farmer/Admin)
  createProduct: async (productData) => {
    return apiClient.post('/products', productData);
  },

  // Update product (Farmer/Admin)
  updateProduct: async (id, productData) => {
    return apiClient.put(`/products/${id}`, productData);
  },

  // Delete product (Farmer/Admin)
  deleteProduct: async (id) => {
    return apiClient.delete(`/products/${id}`);
  },

  // Get product categories
  getCategories: async () => {
    return apiClient.get('/products/categories/list');
  },

  // Search products
  searchProducts: async (searchTerm, filters = {}) => {
    return apiClient.get('/products', { search: searchTerm, ...filters });
  },

  // Get products by category
  getProductsByCategory: async (category, filters = {}) => {
    return apiClient.get('/products', { category, ...filters });
  },

  // Get featured products
  getFeaturedProducts: async () => {
    return apiClient.get('/products', { 
      limit: 8, 
      sortBy: 'averageRating', 
      sortOrder: 'desc' 
    });
  },

  // Get new arrivals
  getNewArrivals: async () => {
    return apiClient.get('/products', { 
      limit: 8, 
      sortBy: 'createdAt', 
      sortOrder: 'desc' 
    });
  },

  // Stock management functions (Admin only)
  updateStock: async (id, quantity, operation) => {
    return apiClient.patch(`/products/${id}/stock`, { quantity, operation });
  },

  // Get product statistics (Admin only)
  getProductStats: async () => {
    return apiClient.get('/products/admin/stats');
  }
};
