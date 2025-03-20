import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

const navigation = {
  manager: [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Sales Reports', href: '/reports', icon: ChartBarIcon },
    { name: 'Menu Management', href: '/menu', icon: ClipboardDocumentListIcon },
    { name: 'Staff Management', href: '/staff', icon: UserGroupIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ],
  salesClerk: [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'New Order', href: '/orders/new', icon: ShoppingCartIcon },
    { name: 'Menu', href: '/menu', icon: ClipboardDocumentListIcon },
  ],
  kitchenStaff: [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'Ingredients', href: '/ingredients', icon: ShoppingCartIcon },
  ],
  inventoryManager: [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Inventory', href: '/inventory', icon: ShoppingCartIcon },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: ClipboardDocumentListIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  ],
};

export default function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = navigation[userRole as keyof typeof navigation] || [];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-gray-800">RAS</h1>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 rounded-md hover:bg-gray-100"
            >
              <ArrowLeftOnRectangleIcon
                className={`h-6 w-6 transform transition-transform ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {!isCollapsed && item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">John Doe</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 