import { 
  FaThLarge, 
  FaUtensils, 
  FaUsers, 
  FaClipboardList, 
  FaBoxes, 
  FaRegCreditCard, 
  FaUserClock, 
  FaChartBar
} from 'react-icons/fa';
import Link from 'next/link';

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
        className={`flex items-center px-4 py-3 text-sm rounded-lg mb-1 transition-colors ${
          isActive 
            ? 'bg-indigo-600 text-white' 
            : 'text-gray-700 hover:bg-indigo-50'
        }`}
      >
        <span className="mr-3 text-lg">{icon}</span>
        <span className="font-medium">{label}</span>
      </Link>
    </li>
  );
};

const DashboardSidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm h-full overflow-auto">
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Manager Dashboard</h2>
        <p className="text-sm text-gray-500 mb-6">Control & monitor operations</p>
        
        <nav className="mb-auto">
          <ul>
            <NavItem icon={<FaThLarge />} label="Dashboard" href="/" isActive={true} />
            <NavItem icon={<FaUtensils />} label="Menu Management" href="/menu" />
            <NavItem icon={<FaClipboardList />} label="Orders" href="/orders" />
            <NavItem icon={<FaUsers />} label="Customers" href="/customers" />
            <NavItem icon={<FaBoxes />} label="Inventory" href="/inventory" />
            <NavItem icon={<FaRegCreditCard />} label="Payments" href="/payments" />
            <NavItem icon={<FaUserClock />} label="Staff & Schedule" href="/staff" />
            <NavItem icon={<FaChartBar />} label="Reports & Analytics" href="/reports" />
          </ul>
        </nav>
      </div>
      
      <div className="px-5 py-4 border-t border-gray-200 mt-auto sticky bottom-0 bg-white">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Premium Plan</p>
          <p className="text-xs text-blue-600 mt-1">Access to all features</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar; 