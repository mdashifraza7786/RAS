'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaUtensils, FaShoppingCart, FaHistory, FaSearch } from 'react-icons/fa';
import { CartProvider } from '@/contexts/CartContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactElement;
}

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasGuestInfo, setHasGuestInfo] = useState(false);

  // Check if user info exists and redirect if on home page
  useEffect(() => {
    const guestInfo = localStorage.getItem('guestInfo');
    setHasGuestInfo(!!guestInfo);
    
    if (guestInfo && pathname === '/guest') {
      router.push('/guest/menu');
    } else if (!guestInfo && pathname !== '/guest') {
      router.push('/guest');
    }
  }, [pathname, router]);

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems: NavItem[] = [
    {
      href: '/guest/menu',
      label: 'Menu',
      icon: <FaUtensils className="w-6 h-6 mb-1" />,
    },
    {
      href: '/guest/cart',
      label: 'Cart',
      icon: <FaShoppingCart className="w-6 h-6 mb-1" />,
    },
    {
      href: '/guest/orders/track',
      label: 'Track Order',
      icon: <FaHistory className="w-6 h-6 mb-1" />,
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/guest/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const renderNavItems = () => (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center ${
              isMobile ? 'flex-1 py-2' : 'px-4 py-2 mx-2'
            } ${
              isActive
                ? 'text-amber-500'
                : 'text-gray-600 hover:text-amber-500'
            }`}
          >
            {item.icon}
            <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </>
  );

  // Don't show navigation on landing page or when guest info is not present
  if (!hasGuestInfo || pathname === '/guest') {
    return (
      <CartProvider>
        <main className="min-h-screen bg-gray-50">{children}</main>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Sticky Header for both Mobile and Desktop */}
        <header className="sticky top-0 z-50 bg-white shadow-md">
          <div className="max-w-7xl mx-auto">
            {/* Top Navigation Bar */}
            <div className="px-4">
              <div className="flex items-center justify-between h-16">
                <Link href="/guest" className="flex items-center">
                  <FaHome className="w-6 h-6 text-amber-500" />
                  <span className="ml-2 text-lg font-semibold text-gray-900">
                    Restaurant
                  </span>
                </Link>
                {!isMobile && (
                  <nav className="flex items-center space-x-4">
                    {renderNavItems()}
                  </nav>
                )}
              </div>
            </div>

            {/* Search Bar */}
            {pathname.includes('/menu') && (
              <div className="border-t border-gray-100 px-4 py-2">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="search"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </form>
              </div>
            )}
          </div>
        </header>

        {/* Main Content with Padding for Mobile Footer */}
        <main className={`flex-grow ${isMobile ? 'pb-20' : ''}`}>
          {children}
        </main>

        {/* Mobile Footer Navigation */}
        {isMobile && (
          <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <nav className="flex justify-around items-center">
              {renderNavItems()}
            </nav>
          </footer>
        )}
      </div>
    </CartProvider>
  );
} 