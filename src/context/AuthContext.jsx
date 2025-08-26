import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [authenticationAttempted, setAuthenticationAttempted] = useState(false);

  // Initialize token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('agribasket_token') || localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token && !authenticationAttempted) {
      // Verify token and get user data
      setAuthenticationAttempted(true);
      fetchUserData();
    } else if (!token) {
      // Try to load user from localStorage as fallback
      const storedUser = localStorage.getItem('agribasket_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('agribasket_user');
        }
      }
      if (!token) {
        setLoading(false);
      }
    }
  }, [token, authenticationAttempted]);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data with token:', token);
      const response = await fetch('http://localhost:18562/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('API response:', result);
        
        if (result.success && result.data) {
          setUser(result.data);
          console.log('User set successfully:', result.data);
        } else {
          console.error('Invalid API response format:', result);
          logout();
        }
      } else {
        const errorData = await response.json();
        console.error('Authentication failed:', response.status, errorData.message);
        logout();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, userToken) => {
    console.log('Login called with:', { userData, userToken });
    setUser(userData);
    setToken(userToken);
    setAuthenticationAttempted(false); // Reset for new login
    // Store with both keys for compatibility
    localStorage.setItem('token', userToken);
    localStorage.setItem('agribasket_token', userToken);
    localStorage.setItem('agribasket_user', JSON.stringify(userData));
    console.log('User and token stored successfully');
  };

  const logout = () => {
    console.log('Logout called');
    setUser(null);
    setToken(null);
    setAuthenticationAttempted(false);
    // Remove all token keys
    localStorage.removeItem('token');
    localStorage.removeItem('agribasket_token');
    localStorage.removeItem('agribasket_user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
