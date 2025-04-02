import { 
  FaUsers, 
  FaUtensils, 
  FaMoneyBillWave, 
  FaChartLine,
  FaSearch,
  FaBell
} from 'react-icons/fa';

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
  orderNumber: string;
  customer: string;
  items: number;
  total: string;
  status: 'completed' | 'preparing' | 'delivered';
  time: string;
}

const RecentOrderRow = ({ orderNumber, customer, items, total, status, time }: RecentOrderRowProps) => {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    preparing: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-blue-100 text-blue-800'
  };

  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 px-4">
        <p className="font-medium text-gray-800">#{orderNumber}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-gray-600">{customer}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-gray-600">{items} items</p>
      </td>
      <td className="py-3 px-4">
        <p className="font-medium text-gray-800">{total}</p>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-block py-1 px-2.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </td>
      <td className="py-3 px-4">
        <p className="text-gray-500 text-sm">{time}</p>
      </td>
    </tr>
  );
};

const DashboardContent = () => {
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
        <StatCard 
          title="Total Revenue" 
          value="₹24,509.00" 
          icon={<FaMoneyBillWave />} 
          trend="+12.5% from last month" 
          trendColor="green" 
        />
        <StatCard 
          title="Total Orders" 
          value="452" 
          icon={<FaUtensils />} 
          trend="+8.2% from last month" 
          trendColor="green" 
        />
        <StatCard 
          title="New Customers" 
          value="64" 
          icon={<FaUsers />} 
          trend="+14.6% from last month" 
          trendColor="green" 
        />
        <StatCard 
          title="Avg. Order Value" 
          value="₹769" 
          icon={<FaChartLine />} 
          trend="Increased by ₹32" 
          trendColor="blue" 
        />
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
              <RecentOrderRow 
                orderNumber="3842" 
                customer="Raj Mehta" 
                items={3} 
                total="₹842.50" 
                status="completed" 
                time="10 mins ago" 
              />
              <RecentOrderRow 
                orderNumber="3841" 
                customer="Priya Singh" 
                items={2} 
                total="₹655.00" 
                status="preparing" 
                time="25 mins ago" 
              />
              <RecentOrderRow 
                orderNumber="3840" 
                customer="Aman Verma" 
                items={5} 
                total="₹1,245.00" 
                status="delivered" 
                time="45 mins ago" 
              />
              <RecentOrderRow 
                orderNumber="3839" 
                customer="Nisha Patel" 
                items={1} 
                total="₹320.00" 
                status="completed" 
                time="1 hour ago" 
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent; 