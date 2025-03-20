'use client'
import Layout from '@/components/layout/Layout';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

type UserRole = 'manager' | 'salesClerk' | 'kitchenStaff' | 'inventoryManager';

// Dummy data for demonstration
const stats = {
  manager: [
    { name: 'Total Sales', value: '$12,345', icon: CurrencyDollarIcon },
    { name: 'Active Orders', value: '8', icon: ShoppingCartIcon },
    { name: 'Staff Members', value: '12', icon: UserGroupIcon },
    { name: 'Daily Revenue', value: '$2,345', icon: ChartBarIcon },
  ],
  salesClerk: [
    { name: 'Today\'s Orders', value: '15', icon: ShoppingCartIcon },
    { name: 'Total Sales', value: '$3,456', icon: CurrencyDollarIcon },
    { name: 'Popular Items', value: '5', icon: ChartBarIcon },
  ],
  kitchenStaff: [
    { name: 'Pending Orders', value: '6', icon: ShoppingCartIcon },
    { name: 'Completed Today', value: '12', icon: ChartBarIcon },
    { name: 'Low Stock Items', value: '3', icon: UserGroupIcon },
  ],
  inventoryManager: [
    { name: 'Total Items', value: '156', icon: ShoppingCartIcon },
    { name: 'Low Stock', value: '8', icon: UserGroupIcon },
    { name: 'Pending Orders', value: '4', icon: ChartBarIcon },
    { name: 'Monthly Cost', value: '$8,234', icon: CurrencyDollarIcon },
  ],
} as const;

export default function Dashboard() {
  // For demonstration, we'll use 'manager' role
  const userRole: UserRole = 'manager';
  const roleStats = stats[userRole];

  const getRoleContent = (role: UserRole) => {
    switch (role) {
      case 'manager':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">• New menu item added: Spaghetti Carbonara</p>
            <p className="text-gray-600">• Monthly report generated</p>
            <p className="text-gray-600">• Staff schedule updated</p>
          </div>
        );
      case 'salesClerk':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">• Order #1234: 2x Margherita Pizza</p>
            <p className="text-gray-600">• Order #1235: 1x Pasta Alfredo</p>
            <p className="text-gray-600">• Order #1236: 3x Chicken Wings</p>
          </div>
        );
      case 'kitchenStaff':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">• Order #1234: In Progress</p>
            <p className="text-gray-600">• Order #1235: Ready for Pickup</p>
            <p className="text-gray-600">• Order #1236: New Order</p>
          </div>
        );
      case 'inventoryManager':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">• Tomatoes: 5kg remaining</p>
            <p className="text-gray-600">• Cheese: 2kg remaining</p>
            <p className="text-gray-600">• Flour: 10kg remaining</p>
          </div>
        );
    }
  };

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'manager':
        return 'Recent Activity';
      case 'salesClerk':
        return 'Today\'s Orders';
      case 'kitchenStaff':
        return 'Current Orders';
      case 'inventoryManager':
        return 'Inventory Status';
    }
  };

  return (
    <Layout userRole={userRole}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roleStats.map((stat) => (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </dd>
            </div>
          ))}
        </div>

        {/* Role-specific content */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {getRoleTitle(userRole)}
          </h2>
          
          {/* Dummy content based on role */}
          <div className="space-y-4">
            {getRoleContent(userRole)}
          </div>
        </div>
      </div>
    </Layout>
  );
} 