'use client';
import { 
  FaThLarge, 
  FaUtensils, 
  FaUsers, 
  FaClipboardList, 
  FaReceipt
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

const WaiterSidebar = () => {
  const pathname = usePathname();
  
  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Dashboard</h2>
        <p className="text-sm text-gray-500">Waiter Portal</p>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2">
        <ul>
          <NavItem 
            icon={<FaThLarge />} 
            label="Dashboard" 
            href="/waiter" 
            isActive={pathname === '/waiter'}
          />
          <NavItem 
            icon={<FaUtensils />} 
            label="Tables" 
            href="/waiter/tables" 
            isActive={pathname?.startsWith('/waiter/tables')}
          />
          <NavItem 
            icon={<FaClipboardList />} 
            label="Orders" 
            href="/waiter/orders" 
            isActive={pathname?.startsWith('/waiter/orders')}
          />
          <NavItem 
            icon={<FaReceipt />} 
            label="Bills" 
            href="/waiter/bills" 
            isActive={pathname?.startsWith('/waiter/bills')}
          />
          <NavItem 
            icon={<FaUsers />} 
            label="Customers" 
            href="/waiter/customers" 
            isActive={pathname?.startsWith('/waiter/customers')}
          />
        </ul>
      </div>
    </div>
  );
};

export default WaiterSidebar; 