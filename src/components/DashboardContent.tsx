'use client';

import { 
  FaUsers, 
  FaUtensils, 
  FaMoneyBillWave, 
  FaChartLine,
  FaSearch,
  FaBell
} from 'react-icons/fa';
import { useManagerDashboard } from '@/hooks/useManagerDashboard';
import { useManagerOrders } from '@/hooks/useManagerOrders';
import { formatDistanceToNow } from 'date-fns';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendColor: string;
}

const StatCard = ({ title, value, icon, trend, trendColor }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`rounded-full p-2.5 ${trendColor === 'green' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
          {icon}
        </div>
      </div>
      <p className={`text-sm mt-4 ${trendColor === 'green' ? 'text-green-600' : 'text-blue-600'}`}>
        {trend}
      </p>
    </div>
  );
};

interface RecentOrderRowProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    itemsCount: number;
    total: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    createdAt: string;
  };
}

const RecentOrderRow: React.FC<RecentOrderRowProps> = ({ order }) => {
  const getStatusColor = (status: RecentOrderRowProps['order']['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 px-4">
        <p className="font-medium text-gray-800">#{order.orderNumber}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-gray-600">{order.customerName || 'Guest'}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-gray-600">{order.itemsCount} items</p>
      </td>
      <td className="py-3 px-4">
        <p className="font-medium text-gray-800">{order.total}</p>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-block py-1 px-2.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </td>
      <td className="py-3 px-4">
        <p className="text-gray-500 text-sm">{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</p>
      </td>
    </tr>
  );
};

const DashboardContent = () => {
  const { stats, loading: statsLoading, error: statsError, formatCurrency, formatPercentage } = useManagerDashboard();
  const { orders, loading: ordersLoading, error: ordersError } = useManagerOrders({ limit: 5 });

  // Format order data for display
  const recentOrders = orders.map(order => ({
    orderNumber: order.orderNumber.toString(),
    customer: order.customerName || 'Guest',
    items: order.items.length,
    total: formatCurrency(order.total),
    status: order.status === 'completed' ? 'completed' : 
            order.status === 'in-progress' ? 'preparing' : 'delivered',
    time: formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })
  }));

  return (
    <div className="p-8">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome back, Restaurant Manager</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <FaBell className="text-xl" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          // Loading skeletons
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : statsError ? (
          // Error state
          <div className="col-span-4 bg-red-50 p-4 rounded-lg text-red-600">
            Failed to load dashboard statistics. Please try again later.
          </div>
        ) : stats ? (
          // Actual data
          <>
            <StatCard 
              title="Total Revenue" 
              value={formatCurrency(stats.revenue.current)} 
              icon={<FaMoneyBillWave />} 
              trend={`${formatPercentage(stats.revenue.growth)} from last month`} 
              trendColor={stats.revenue.growth >= 0 ? "green" : "blue"} 
            />
            <StatCard 
              title="Total Orders" 
              value={stats.orders.total.toString()} 
              icon={<FaUtensils />} 
              trend={`${formatPercentage(stats.orders.growth)} from last month`} 
              trendColor={stats.orders.growth >= 0 ? "green" : "blue"} 
            />
            <StatCard 
              title="New Customers" 
              value={stats.customers.new.toString()} 
              icon={<FaUsers />} 
              trend={`${formatPercentage(stats.customers.growth)} from last month`} 
              trendColor={stats.customers.growth >= 0 ? "green" : "blue"} 
            />
            <StatCard 
              title="Avg. Order Value" 
              value={formatCurrency(stats.averageOrderValue.current)} 
              icon={<FaChartLine />} 
              trend={`${stats.averageOrderValue.current > stats.averageOrderValue.previous ? 'Increased' : 'Decreased'} by ${formatCurrency(Math.abs(stats.averageOrderValue.current - stats.averageOrderValue.previous))}`} 
              trendColor={stats.averageOrderValue.current > stats.averageOrderValue.previous ? "green" : "blue"} 
            />
          </>
        ) : null}
      </div>
      
      {/* Chart Section (Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Overview</h2>
          <div className="bg-gray-50 rounded-lg flex items-center justify-center h-64 text-gray-400">
            <p>Revenue Chart (Placeholder)</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Popular Items</h2>
          <div className="bg-gray-50 rounded-lg flex items-center justify-center h-64 text-gray-400">
            <p>Pie Chart (Placeholder)</p>
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
            View All
          </button>
        </div>
        
        {ordersLoading ? (
          // Loading skeleton
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
            ))}
          </div>
        ) : ordersError ? (
          // Error state
          <div className="bg-red-50 p-4 rounded-lg text-red-600">
            Failed to load recent orders. Please try again later.
          </div>
        ) : recentOrders.length > 0 ? (
          // Actual data
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <RecentOrderRow 
                    key={order.orderNumber}
                    order={{
                      id: '',
                      orderNumber: order.orderNumber,
                      customerName: order.customer,
                      itemsCount: order.items,
                      total: parseFloat(order.total.replace(/[^0-9.]/g, '')),
                      status: order.status === 'completed' ? 'completed' : 
                              order.status === 'in-progress' ? 'processing' : 'pending',
                      createdAt: order.time
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Empty state
          <div className="text-center py-8 text-gray-500">
            No recent orders found.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent; 