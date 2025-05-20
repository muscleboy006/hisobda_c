import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import api from '@/Utils/api'; // Make sure the path is correct
import { Loader2Icon } from 'lucide-react';

// Authentication check function
const checkAuth = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { isAuthenticated: false };

    const response = await axios.get(`${api}/tg/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return { isAuthenticated: response.data.success };
  } catch (error) {
    console.error('Auth verification error:', error);
    localStorage.removeItem('token'); // Clear invalid token
    return { isAuthenticated: false };
  }
};

// Protected Route - Only authenticated users can access
export const ProtectedRoute = () => {
  const [authState, setAuthState] = useState({ 
    isAuthenticated: false, 
    isLoading: true 
  });
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      const result = await checkAuth();
      setAuthState({
        isAuthenticated: result.isAuthenticated,
        isLoading: false
      });
    };

    verifyAuth();
  }, []);

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    // Redirect to login but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

// Public Route - Redirects authenticated users to dashboard
export const PublicRoute = () => {
  const [authState, setAuthState] = useState({ 
    isAuthenticated: false, 
    isLoading: true 
  });

  useEffect(() => {
    const verifyAuth = async () => {
      const result = await checkAuth();
      setAuthState({
        isAuthenticated: result.isAuthenticated,
        isLoading: false
      });
    };

    verifyAuth();
  }, []);

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authState.isAuthenticated) {
    // Redirect authenticated users to dashboard
    return <Navigate to="/" replace />;
  }

  // If not authenticated, render the child routes
  return <Outlet />;
};