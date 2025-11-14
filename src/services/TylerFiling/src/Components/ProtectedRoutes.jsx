import React from 'react';
import { Navigate } from 'react-router-dom';

// This component checks if the user is authenticated
const ProtectedRoute = ({ children }) => {
    const token = sessionStorage.getItem('access_token');
 
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If token exists, render the children components (e.g, Dashboard page)
  return children;
};

export default ProtectedRoute;