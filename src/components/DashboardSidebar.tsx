'use client';
import { 
  FaThLarge, 
  FaUtensils, 
  FaUsers, 
  FaClipboardList, 
  FaBoxes, 
  FaRegCreditCard, 
  FaChartBar,
  FaTable,
  
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

const DashboardSidebar = () => {
  const pathname = usePathname();
  
  return (
    <div className="fixed h-screen bg-white border-r border-gray-200 flex flex-col w-64">
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Dashboard</h2>
        <p className="text-sm text-gray-500">Manage your restaurant</p>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2">
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
            icon={<FaTable />} 
            label="Tables" 
            href="/manager/tables" 
            isActive={pathname?.startsWith('/manager/tables')}
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
      </div>
      
      
    </div>
  );
};

export default DashboardSidebar; 