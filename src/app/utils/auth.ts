'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define possible user roles
export type UserRole = 'manager' | 'waiter' | 'chef' | 'guest';

// LocalStorage keys
const USER_ROLE_KEY = 'restaurant_user_role';

/**
 * Set the user role in localStorage
 */
export const setUserRole = (role: UserRole) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ROLE_KEY, role);
  }
};

/**
 * Get the current user role from localStorage
 */
export const getUserRole = (): UserRole => {
  if (typeof window !== 'undefined') {
    const role = localStorage.getItem(USER_ROLE_KEY);
    if (role && (role === 'manager' || role === 'waiter' || role === 'chef' || role === 'guest')) {
      return role as UserRole;
    }
  }
  return 'guest';
};

/**
 * Check if the current user has the required role
 */
export const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
  const currentRole = getUserRole();
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(currentRole);
  }
  
  return currentRole === requiredRole;
};

/**
 * Custom hook to protect routes based on user role
 */
export const useManagerAuth = (
  requiredRole: UserRole | UserRole[] = 'manager',
  redirectPath: string = '/login'
) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user has the required role
    const userHasRequiredRole = hasRole(requiredRole);
    
    if (!userHasRequiredRole) {
      // If not manager, redirect to the specified path
      router.push(redirectPath);
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
    
    // For backward compatibility
    setIsManager(getUserRole() === 'manager');
    
    setIsLoading(false);
  }, [requiredRole, redirectPath, router]);

  return { isLoading, isManager, isAuthenticated };
};

/**
 * Log in a user with a specific role
 */
export const login = (role: UserRole, redirectPath?: string) => {
  setUserRole(role);
  
  if (redirectPath) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectPath;
    }
  }
};

/**
 * Log out the current user
 */
export const logout = (redirectPath: string = '/') => {
  setUserRole('guest');
  
  if (typeof window !== 'undefined') {
    window.location.href = redirectPath;
  }
}; 