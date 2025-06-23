import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import config from '../config';

const AuthContext = createContext(null);

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
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    checkAuth();
  }, []);

  // Set up axios interceptor for adding the token to all requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  const checkAuth = async () => {
    try {
      // First check if we have a token in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${config.API_URL}/check-auth`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.authenticated) {
        setUser(response.data.user);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${config.API_URL}/auth/login`, {
        username,
        password
      });
      
      // Store the token in localStorage
      if (response.data.user && response.data.user.token) {
        localStorage.setItem('token', response.data.user.token);
      }
      
      setUser(response.data.user);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${config.API_URL}/auth/logout`, {}, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      
      // Clear token from localStorage
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the server call fails, clear local data
      localStorage.removeItem('token');
      setUser(null);
      toast.error('Logout process encountered an issue');
      navigate('/login');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 