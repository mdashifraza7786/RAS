'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { signOut, useSession } from 'next-auth/react';

// Store scroll positions for different routes
const scrollPositions = new Map<string, number>();

// Store the current path the manager was on
const saveCurrentPath = (path: string) => {
  if (typeof window !== 'undefined' && path) {
    sessionStorage.setItem('managerLastPath', path);
  }
};

// Get the last path the manager was on
const getLastPath = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('managerLastPath');
  }
  return null;
};

// Main parent layout component that uses Suspense
export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ManagerLayoutWithParams children={children} />
    </Suspense>
  );
}

// Component that uses useSearchParams and other hooks
function ManagerLayoutWithParams({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef<string>(pathname);
  const initialRenderRef = useRef(true);
  const router = useRouter();
  
  // Use NextAuth session for authentication
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isManager = session?.user?.role === 'manager';
  const [authChecked, setAuthChecked] = useState(false);
  const [initialPath, setInitialPath] = useState<string | null>(null);
  const preventRedirectRef = useRef(false); // Prevent redirect loops

  // Cache session status
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'manager') {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('managerAuthenticated', 'true');
      }
    }
  }, [status, session]);

  // Store the current path on first render
  useEffect(() => {
    // On initial load, check if we were redirected from subpage to /manager
    if (pathname === '/manager') {
      const lastPath = getLastPath();
      if (lastPath && lastPath.startsWith('/manager/') && !preventRedirectRef.current) {
        preventRedirectRef.current = true;
        router.replace(lastPath);
        return;
      }
    }
    
    // Save the current path for future redirects
    if (pathname.startsWith('/manager/')) {
      saveCurrentPath(pathname);
    }
    
    if (!initialPath && pathname) {
      setInitialPath(pathname);
    }
  }, [pathname, initialPath, router]);

  // Add a delay before checking auth to allow session rehydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [status]);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('managerAuthenticated');
      sessionStorage.removeItem('managerLastPath');
    }
    await signOut({ redirect: false });
    router.push('/login');
  };

  // Save current scroll position before navigation
  const saveScrollPosition = () => {
    if (mainContentRef.current) {
      const currentKey = pathname + searchParams.toString();
      scrollPositions.set(currentKey, mainContentRef.current.scrollTop);
    }
  };

  // Set up scroll position saving
  useEffect(() => {
    const mainContent = mainContentRef.current;
    if (!mainContent) return;

    // Save scroll position when scrolling
    mainContent.addEventListener('scroll', saveScrollPosition);
    
    // Save scroll position before unmounting
    return () => {
      saveScrollPosition();
      mainContent.removeEventListener('scroll', saveScrollPosition);
    };
  }, [pathname, searchParams]);

  // Handle scroll position restoration on navigation
  useEffect(() => {
    const currentKey = pathname + searchParams.toString();
    const prevKey = prevPathRef.current + searchParams.toString();
    
    // Skip initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    // Handle navigation
    if (prevPathRef.current !== pathname) {
      // Save the previous page's scroll position
      if (mainContentRef.current) {
        scrollPositions.set(prevKey, mainContentRef.current.scrollTop);
      }
      
      // Reset scroll for new page or restore for previously visited page
      if (mainContentRef.current) {
        if (scrollPositions.has(currentKey)) {
          // Use RAF for more reliable scroll restoration
          requestAnimationFrame(() => {
            if (mainContentRef.current) {
              mainContentRef.current.scrollTop = scrollPositions.get(currentKey) || 0;
            }
          });
        } else {
          // New page - scroll to top
          mainContentRef.current.scrollTop = 0;
        }
      }
      
      // Update the previous path
      prevPathRef.current = pathname;
    }
  }, [pathname, searchParams]);

  // Show loading state
  if (isLoading || (status === 'unauthenticated' && !authChecked)) {
    // Check if we have a cached session
    const cachedAuth = typeof window !== 'undefined' ? sessionStorage.getItem('managerAuthenticated') : null;
    
    if (cachedAuth === 'true') {
      // Use cached auth to prevent loading state during brief session check
      return (
        <ManagerLayoutContent
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleLogout={handleLogout}
          mainContentRef={mainContentRef}
        >
          {children}
        </ManagerLayoutContent>
      );
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated/authorized as manager
  if (authChecked && !isManager) {
    // Only redirect to login if we're definitely not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      );
    }
    
    // Show loading during refresh instead of redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <ManagerLayoutContent
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      handleLogout={handleLogout}
      mainContentRef={mainContentRef}
    >
      {children}
    </ManagerLayoutContent>
  );
}

// Extracted layout content component to reduce duplication
function ManagerLayoutContent({
  children,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleLogout,
  mainContentRef
}: {
  children: React.ReactNode;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
  mainContentRef: React.RefObject<any>;
}) {
  return (
    <div className="flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:hidden transition duration-200 ease-in-out z-30
        w-64
      `}>
        <DashboardSidebar />
        
        {/* Logout button for mobile */}
        <div className="absolute bottom-0 left-0 w-full px-5 py-4 border-t border-gray-200 bg-white">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium rounded-md text-gray-700 hover:bg-indigo-50 transition-colors"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Menu Button */}
        <div className="md:hidden bg-indigo-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Manager Dashboard</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 focus:outline-none"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        
        {/* Page Content - Only this should scroll */}
        <main 
          ref={mainContentRef}
          className="flex-1 overflow-auto p-6 pb-10 bg-gray-50"
        >
          {children}
        </main>
      </div>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
} 