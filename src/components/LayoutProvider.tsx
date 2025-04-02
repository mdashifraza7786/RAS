'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';

interface LayoutProviderProps {
  children: React.ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const pathname = usePathname();
  const isGuestRoute = pathname?.startsWith('/guest');
  const isLoginRoute = pathname?.startsWith('/login');

  return (
    <>
      {/* Fixed header - only show if not on guest routes */}
      {!isGuestRoute && !isLoginRoute && <Header />}
      
      {/* Main content with scrolling - adjust height based on header presence */}
      <div className={`w-full ${!isGuestRoute && !isLoginRoute ? 'h-[calc(100vh-56px)]' : 'h-screen'}`}>
        {children}
      </div>
    </>
  );
} 