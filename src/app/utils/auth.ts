'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Simple roles that would be stored in a real authentication system
export type UserRole = 'manager' | 'staff' | 'guest';

// Function to set the user role in localStorage (for demo purposes)
export const setUserRole = (role: UserRole) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userRole', role);
  }
};

// Function to get the current user role from localStorage
export const getUserRole = (): UserRole => {
  if (typeof window !== 'undefined') {
    const role = localStorage.getItem('userRole');
    if (role === 'manager' || role === 'staff') {
      return role;
    }
  }
  return 'guest';
};

// Custom hook to check if the current user is a manager
export const useManagerAuth = (redirectUrl: string = '/') => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // In a real app, this would be an API call to verify the user's session
      const role = getUserRole();
      
      if (role !== 'manager') {
        // Not a manager, redirect to the specified URL
        router.push(redirectUrl);
      } else {
        setIsManager(true);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router, redirectUrl]);

  return { isLoading, isManager };
};

// Create a login function for demo purposes
export const login = (role: UserRole) => {
  setUserRole(role);
  
  // Redirect based on role
  if (typeof window !== 'undefined') {
    if (role === 'manager') {
      window.location.href = '/manager';
    } else {
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