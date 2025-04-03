'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UseRoleAuthOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
}

export function useRoleAuth(
  requiredRole: 'manager' | 'waiter' | 'chef' | undefined,
  options: UseRoleAuthOptions = {}
) {
  const { redirectTo = '/login', redirectIfFound = false } = options;
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  
  useEffect(() => {
    // Make sure we're on the client side before checking authentication
    if (typeof window === 'undefined') return;
    
    // Do nothing while loading
    if (loading) return;
    
    // If no role is required, user is authorized
    if (!requiredRole) {
      setIsAuthorized(true);
      return;
    }
    
    // Check if user is authenticated
    const isAuthenticated = !!session?.user;
    
    // If no user and we need to redirect
    if (!isAuthenticated && !redirectIfFound) {
      router.push(redirectTo);
      return;
    }
    
    // If user exists and we need to redirect
    if (isAuthenticated && redirectIfFound) {
      router.push(redirectTo);
      return;
    }
    
    // Check role authorization
    if (isAuthenticated && requiredRole) {
      const userRole = session.user.role;
      const hasRequiredRole = userRole === requiredRole;
      
      setIsAuthorized(hasRequiredRole);
      
      // Redirect if not authorized for this role
      if (!hasRequiredRole) {
        let redirectPath = '/login';
        
        // Redirect to the appropriate dashboard based on role
        if (userRole === 'manager') redirectPath = '/manager';
        else if (userRole === 'waiter') redirectPath = '/waiter';
        else if (userRole === 'chef') redirectPath = '/chef';
        
        router.push(redirectPath);
      }
    }
  }, [loading, session, requiredRole, redirectIfFound, redirectTo, router, pathname]);
  
  return {
    user: session?.user,
    isLoading: loading,
    isAuthenticated: !!session?.user,
    isAuthorized,
  };
} 