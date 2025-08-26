// API Configuration
export const API_BASE_URL = 'http://localhost:18562';
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
    RESEND_VERIFICATION: `${API_BASE_URL}/api/auth/resend-verification`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    ME: `${API_BASE_URL}/api/auth/me`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  PRODUCTS: {
    GET_ALL: `${API_BASE_URL}/api/products`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,
  }
};

export default API_ENDPOINTS;
