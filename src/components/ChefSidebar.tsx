'use client';
import { 
  FaThLarge, 
  FaUtensils, 
  FaClipboardList, 
  FaHamburger,
  FaClipboardCheck,
  FaBell 
} from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}


const NavItem = ({ icon, label, href, isActive = false }: NavItemProps) => {
  return (
    <li className="px-3 py-1.5">
      <Link 
        href={href}
        className={`flex items-center px-3 py-2.5 text-sm transition-all duration-200 rounded-lg ${
          isActive 
            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span className={`mr-3 text-lg ${isActive ? 'text-white' : 'text-gray-500'}`}>{icon}</span>
        <span className={isActive ? 'font-medium' : ''}>{label}</span>
      </Link>
    </li>
  );
};


const ChefSidebar = () => {
  const pathname = usePathname();
  
  return (
    <div className="fixed h-screen bg-white border-r border-gray-200 flex flex-col w-64">
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Dashboard</h2>
        <p className="text-sm text-gray-500">Chef Portal</p>
      </div>
      
     
      
      <div className="flex-1 overflow-y-auto px-2">
        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2 mb-2">
          Navigation
        </p>
        <ul>
          <NavItem 
            icon={<FaThLarge />} 
            label="Dashboard" 
            href="/chef" 
            isActive={pathname === '/chef'}
          />
          <NavItem 
            icon={<FaClipboardList />} 
            label="Orders Queue" 
            href="/chef/orders" 
            isActive={pathname?.startsWith('/chef/orders')}
          />
          <NavItem 
            icon={<FaHamburger />} 
            label="Menu Items" 
            href="/chef/menu-items" 
            isActive={pathname?.startsWith('/chef/menu-items')}
          />
          <NavItem 
            icon={<FaUtensils />} 
            label="Inventory" 
            href="/chef/inventory" 
            isActive={pathname?.startsWith('/chef/inventory')}
          />
        </ul>
      </div>
    </div>
  );
};

export default ChefSidebar; 