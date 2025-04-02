'use client';
import { 
  FaThLarge, 
  FaUtensils, 
  FaUsers, 
  FaClipboardList, 
  FaBoxes, 
  FaRegCreditCard, 
  FaChartBar,
  FaCalendarAlt
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
    <li>
      <Link 
        href={href}
        className={`flex items-center px-4 py-3 text-sm transition-colors ${
          isActive 
            ? 'bg-indigo-100 text-indigo-700' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className={`mr-3 text-lg ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>{icon}</span>
        <span className="font-medium">{label}</span>
      </Link>
    </li>
  );
};

const DashboardSidebar = () => {
  const pathname = usePathname();
  
  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="bg-white p-5 text-black">
        <h2 className="text-xl font-bold mb-1">Manager Dashboard</h2>
        <p className="text-sm text-indigo-800">Control & monitor operations</p>
      </div>
      
      <nav className="overflow-y-auto">
        <ul>
          <NavItem 
            icon={<FaThLarge />} 
            label="Dashboard" 
            href="/manager" 
            isActive={pathname === '/manager'}
          />
          <NavItem 
            icon={<FaUtensils />} 
            label="Menu Management" 
            href="/manager/menu" 
            isActive={pathname?.startsWith('/manager/menu')}
          />
          <NavItem 
            icon={<FaClipboardList />} 
            label="Orders" 
            href="/manager/orders" 
            isActive={pathname?.startsWith('/manager/orders')}
          />
          <NavItem 
            icon={<FaCalendarAlt />} 
            label="Scheduling" 
            href="/manager/schedule" 
            isActive={pathname?.startsWith('/manager/schedule')}
          />
          <NavItem 
            icon={<FaUsers />} 
            label="Staff" 
            href="/manager/staff" 
            isActive={pathname?.startsWith('/manager/staff')}
          />
          <NavItem 
            icon={<FaBoxes />} 
            label="Inventory" 
            href="/manager/inventory" 
            isActive={pathname?.startsWith('/manager/inventory')}
          />
          <NavItem 
            icon={<FaRegCreditCard />} 
            label="Payments" 
            href="/manager/payments" 
            isActive={pathname?.startsWith('/manager/payments')}
          />
          <NavItem 
            icon={<FaChartBar />} 
            label="Reports" 
            href="/manager/reports" 
            isActive={pathname?.startsWith('/manager/reports')}
          />
        </ul>
      </nav>
      
      
    </div>
  );
};

export default DashboardSidebar; 