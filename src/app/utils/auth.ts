'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Simple roles that would be stored in a real authentication system
export type UserRole = 'manager' | 'waiter' | 'chef' | 'guest';

// Function to set the user role in localStorage (for demo purposes)
export const setUserRole = (role: UserRole) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userRole', role);
  }
};

// Function to get the current user role from localStorage
export const getUserRole = (): UserRole | null => {
  if (typeof window !== 'undefined') {
    const role = localStorage.getItem('userRole') as UserRole | null;
    return role;
  }
  return null;
};

// Custom hook to check if the current user is a manager
export const useManagerAuth = (requiredRole: UserRole = 'manager') => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication on client-side
    const userRole = getUserRole();
    const authenticated = userRole === requiredRole;
    
    setIsAuthenticated(authenticated);
    setIsLoading(false);
    
    if (!authenticated) {
      // Redirect to home page if not authenticated with correct role
      router.push('/');
    }
  }, [requiredRole, router]);

  return { isLoading, isAuthenticated };
};

// Create a login function for demo purposes
export const login = (role: UserRole) => {
  setUserRole(role);
  
  // Redirect based on role
  if (typeof window !== 'undefined') {
    switch (role) {
      case 'manager':
        window.location.href = '/manager';
        break;
      case 'waiter':
        window.location.href = '/waiter';
        break;
      case 'chef':
        window.location.href = '/chef';
        break;
      default:
        window.location.href = '/';
    }
  }
};

// Create a logout function
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userRole');
    window.location.href = '/';
  }
};

// Check if the user has a specific role
export const hasRole = (requiredRole: UserRole): boolean => {
  const userRole = getUserRole();
  return userRole === requiredRole;
}; 