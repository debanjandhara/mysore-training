import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // In-memory access token
  const [loading, setLoading] = useState(true);

  // Init: Try to get a new access token via the HttpOnly cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh token (cookie will be sent)
        const { accessToken } = await authService.refreshToken();
        
        if (accessToken) {
          setToken(accessToken);
          // Fetch user profile with the new token
          const { user } = await authService.getCurrentUser(accessToken);
          setUser(user);
        }
      } catch (error) {
        // If refresh fails (no cookie or invalid), just stay logged out
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    if (response.success) {
      setUser(response.user);
      setToken(response.token); // Store in memory
    }
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    if (response.success) {
      setUser(response.user);
      setToken(response.token); // Store in memory
    }
    return response;
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = (updatedUser) => {
      setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
