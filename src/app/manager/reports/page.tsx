'use client';

import { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaDownload,
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaFileDownload,
  FaTable,
  FaSyncAlt,
  FaPrint,
  FaBoxOpen,
  FaList,
  FaExclamationTriangle,
  FaUsers,
  FaClock,
  FaMoneyBillWave,
  FaStar,
  FaUtensils,
  FaPercentage,
  FaAward,
  FaCheckCircle,
  FaTimesCircle,
  FaCircle
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Define missing type interfaces
interface TopSellingItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface OrderType {
  type?: string;
  status?: string;
  amount: number;
  percentage: number;
  count: number;
}

interface PaymentMethod {
  method: string;
  amount: number;
  percentage: number;
  count: number;
}

// Report type definition
type ReportType = 'sales' | 'inventory' | 'staff' | 'menu' | 'customers';

// Report Period Options
const periodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' }
];

// Report Categories with descriptions
const reportCategories: Record<ReportType, { title: string; description: string; icon: React.ReactNode }> = {
  sales: {
    title: 'Sales Reports',
    description: 'View revenue, sales trends, and performance metrics',
    icon: <FaChartLine />
  },
  inventory: {
    title: 'Inventory Reports',
    description: 'Track stock levels, usage, and valuation',
    icon: <FaChartBar />
  },
  customers: {
    title: 'Customer Reports',
    description: 'Analyze customer behavior and loyalty',
    icon: <FaChartPie />
  },
  staff: {
    title: 'Staff Reports',
    description: 'Monitor staff performance and scheduling',
    icon: <FaTable />
  },
  menu: {
    title: 'Menu Performance',
    description: 'Evaluate menu item popularity and profitability',
    icon: <FaChartBar />
  }
};

// Sample report data for sales
const salesReportData = {
  revenueByDay: [
    { date: '2023-04-01', revenue: 24280 },
    { date: '2023-04-02', revenue: 28450 },
    { date: '2023-04-03', revenue: 21760 },
    { date: '2023-04-04', revenue: 19850 },
    { date: '2023-04-05', revenue: 23450 },
    { date: '2023-04-06', revenue: 31250 },
    { date: '2023-04-07', revenue: 32460 }
  ],
  topSellingItems: [
    { name: 'Butter Chicken', quantity: 142, revenue: 45440 },
    { name: 'Paneer Tikka', quantity: 98, revenue: 21560 },
    { name: 'Veg Biryani', quantity: 76, revenue: 19000 },
    { name: 'Chicken Biryani', quantity: 65, revenue: 19500 },
    { name: 'Gulab Jamun', quantity: 120, revenue: 12000 }
  ],
  paymentMethods: [
    { method: 'Credit Card', amount: 85420, percentage: 48 },
    { method: 'UPI', amount: 62380, percentage: 35 },
    { method: 'Cash', amount: 21750, percentage: 12 },
    { method: 'Other', amount: 8950, percentage: 5 }
  ],
  orderTypes: [
    { type: 'Dine-in', amount: 98650, percentage: 55 },
    { type: 'Takeaway', amount: 35840, percentage: 20 },
    { type: 'Delivery', amount: 44010, percentage: 25 }
  ]
};

// Sample data for inventory reports
const inventoryReportData = {
  stockCategories: [
    { category: 'Grains', totalItems: 15, totalValue: 32600, avgMovement: 'Medium' },
    { category: 'Meat', totalItems: 12, totalValue: 42800, avgMovement: 'High' },
    { category: 'Vegetables', totalItems: 28, totalValue: 18400, avgMovement: 'High' },
    { category: 'Dairy', totalItems: 10, totalValue: 28500, avgMovement: 'Medium' },
    { category: 'Spices', totalItems: 32, totalValue: 42300, avgMovement: 'Low' },
    { category: 'Oils', totalItems: 7, totalValue: 22100, avgMovement: 'Low' }
  ],
  stockMovement: [
    { date: '2023-04-01', incoming: 12800, outgoing: 9600 },
    { date: '2023-04-02', incoming: 8500, outgoing: 12400 },
    { date: '2023-04-03', incoming: 16200, outgoing: 8900 },
    { date: '2023-04-04', incoming: 5600, outgoing: 9800 },
    { date: '2023-04-05', incoming: 14300, outgoing: 11200 },
    { date: '2023-04-06', incoming: 9800, outgoing: 10500 },
    { date: '2023-04-07', incoming: 7400, outgoing: 13800 }
  ],
  lowStockItems: [
    { name: 'Chicken Breast', category: 'Meat', currentStock: 12, minRequired: 15 },
    { name: 'Yogurt', category: 'Dairy', currentStock: 3, minRequired: 5 },
    { name: 'Cardamom', category: 'Spices', currentStock: 1.2, minRequired: 1 },
    { name: 'Tomatoes', category: 'Vegetables', currentStock: 25, minRequired: 20 },
    { name: 'Paneer', category: 'Dairy', currentStock: 8, minRequired: 5 }
  ],
  expiryWarnings: [
    { name: 'Chicken Breast', category: 'Meat', quantity: 12, expiryDate: '2023-04-07' },
    { name: 'Tomatoes', category: 'Vegetables', quantity: 25, expiryDate: '2023-04-09' },
    { name: 'Yogurt', category: 'Dairy', quantity: 3, expiryDate: '2023-04-10' }
  ]
};

// Sample data for staff reports
const staffReportData = {
  staffDistribution: [
    { department: 'Kitchen', count: 8, costPercentage: 35 },
    { department: 'Service', count: 12, costPercentage: 30 },
    { department: 'Management', count: 3, costPercentage: 20 },
    { department: 'Cleaning', count: 4, costPercentage: 10 },
    { department: 'Security', count: 2, costPercentage: 5 }
  ],
  workHours: [
    { day: 'Monday', hours: 98 },
    { day: 'Tuesday', hours: 92 },
    { day: 'Wednesday', hours: 94 },
    { day: 'Thursday', hours: 110 },
    { day: 'Friday', hours: 132 },
    { day: 'Saturday', hours: 148 },
    { day: 'Sunday', hours: 136 }
  ],
  topPerformers: [
    { name: 'Rahul Singh', role: 'Chef', efficiency: 94, orderCompletion: 215 },
    { name: 'Ananya Patel', role: 'Server', efficiency: 92, customerRating: 4.8 },
    { name: 'Karan Malhotra', role: 'Chef', efficiency: 89, orderCompletion: 198 },
    { name: 'Neha Sharma', role: 'Server', efficiency: 87, customerRating: 4.7 },
    { name: 'Vikram Joshi', role: 'Manager', efficiency: 95, customerRating: 4.9 }
  ],
  staffingCosts: [
    { month: 'Jan', cost: 182000 },
    { month: 'Feb', cost: 186000 },
    { month: 'Mar', cost: 188000 },
    { month: 'Apr', cost: 195000 },
    { month: 'May', cost: 189000 },
    { month: 'Jun', cost: 198000 }
  ]
};

// Sample data for menu performance reports
const menuReportData = {
  categoryPerformance: [
    { category: 'Main Course', itemCount: 15, revenue: 128500, popularity: 42 },
    { category: 'Starters', itemCount: 12, revenue: 65400, popularity: 28 },
    { category: 'Desserts', itemCount: 8, revenue: 32800, popularity: 12 },
    { category: 'Beverages', itemCount: 10, revenue: 38200, popularity: 15 },
    { category: 'Sides', itemCount: 6, revenue: 12600, popularity: 3 }
  ],
  menuItemProfitability: [
    { name: 'Butter Chicken', cost: 180, price: 320, margin: 140, marginPercentage: 44 },
    { name: 'Paneer Tikka', cost: 120, price: 220, margin: 100, marginPercentage: 45 },
    { name: 'Veg Biryani', cost: 120, price: 250, margin: 130, marginPercentage: 52 },
    { name: 'Chicken Biryani', cost: 160, price: 300, margin: 140, marginPercentage: 47 },
    { name: 'Gulab Jamun', cost: 40, price: 100, margin: 60, marginPercentage: 60 }
  ],
  itemPopularity: [
    { name: 'Butter Chicken', orders: 142, revenue: 45440, rating: 4.8 },
    { name: 'Paneer Tikka', orders: 98, revenue: 21560, rating: 4.7 },
    { name: 'Veg Biryani', orders: 76, revenue: 19000, rating: 4.6 },
    { name: 'Chicken Biryani', orders: 65, revenue: 19500, rating: 4.9 },
    { name: 'Gulab Jamun', orders: 120, revenue: 12000, rating: 4.8 }
  ],
  revenueByTimeOfDay: [
    { timeSlot: 'Breakfast (8-11am)', revenue: 42500 },
    { timeSlot: 'Lunch (12-3pm)', revenue: 86400 },
    { timeSlot: 'Evening (4-7pm)', revenue: 38200 },
    { timeSlot: 'Dinner (7-11pm)', revenue: 110500 }
  ]
};

// Sample data for top customers
const topCustomers = [
  { name: 'Raj Mehta', orders: 28, spent: 15420, lastOrder: '2023-04-02' },
  { name: 'Aman Verma', orders: 32, spent: 21550, lastOrder: '2023-04-02' },
  { name: 'Sandeep Kumar', orders: 45, spent: 32450, lastOrder: '2023-04-01' },
  { name: 'Priya Singh', orders: 12, spent: 8740, lastOrder: '2023-04-02' },
  { name: 'Kavita Sharma', orders: 15, spent: 9620, lastOrder: '2023-04-01' }
];

// Format currency to Indian Rupees
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date string to a readable format with consistent server/client rendering
const formatDate = (dateString: string) => {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    // Use a fixed format that won't change between server and client
    const day = date.getDate();
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (e) {
    return 'Invalid date';
  }
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const StatCard = ({ title, value, icon, change, changeType = 'neutral' }: StatCardProps) => {
  const changeColorClass = 
    changeType === 'positive' ? 'text-green-600' : 
    changeType === 'negative' ? 'text-red-600' : 
    'text-gray-600';
  
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className="rounded-full p-2.5 bg-indigo-100 text-indigo-600">
          {icon}
        </div>
      </div>
      {change && (
        <p className={`text-sm mt-4 ${changeColorClass}`}>
          {change}
        </p>
      )}
    </div>
  );
};

// Fix type errors for the getStatusBadgeStyles and getStatusIcon functions
const getStatusBadgeStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <FaCheckCircle className="text-green-500" />;
    case 'pending':
      return <FaClock className="text-yellow-500" />;
    case 'cancelled':
      return <FaTimesCircle className="text-red-500" />;
    default:
      return <FaCircle className="text-gray-500" />;
  }
};

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('sales');
  const [period, setPeriod] = useState('month');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Report data state
  const [reportData, setReportData] = useState<any>(null);

  // Use a client-side only useState to track if we're on the client
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true on component mount (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Handle period change and show custom date range if needed
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    setShowCustomDateRange(newPeriod === 'custom');
  };
  
  // Fetch report data on report type or period change
  useEffect(() => {
    fetchReportData();
  }, [activeReport, period]);
  
  // Fetch report data from API
  const fetchReportData = async () => {
    // Skip fetch for custom date range until applied
    if (period === 'custom' && (!customDateRange.start || !customDateRange.end)) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        type: activeReport,
        period
      });
      
      // Add custom date range if applicable
      if (period === 'custom') {
        queryParams.append('startDate', customDateRange.start);
        queryParams.append('endDate', customDateRange.end);
      }
      
      // Fetch data from API
      const response = await fetch(`/api/manager/reports?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      const data = await response.json();
      console.log('API data received:', data);
      setReportData(data);
    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'An error occurred while fetching report data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply custom date range and fetch data
  const applyCustomDateRange = () => {
    if (!customDateRange.start || !customDateRange.end) {
      alert('Please select both start and end dates');
      return;
    }
    
    fetchReportData();
  };
  
  // Helper function to get data with fallback to sample data
  const getReportData = () => {
    if (!reportData || !reportData.data) {
      return null;
    }
    return reportData.data;
  };
  
  // Get the data based on current report type
  const reportDataForType = getReportData();
  
  // Sales metrics with API data or fallback to sample data - with fallbacks for empty arrays
  const salesData = activeReport === 'sales' && reportDataForType 
    ? reportDataForType as any
    : salesReportData;
  
  const inventoryData = activeReport === 'inventory' && reportDataForType 
    ? reportDataForType as any
    : inventoryReportData;
    
  const staffData = activeReport === 'staff' && reportDataForType 
    ? reportDataForType as any
    : staffReportData;
    
  const menuData = activeReport === 'menu' && reportDataForType 
    ? reportDataForType as any
    : menuReportData;
    
  const customersData = activeReport === 'customers' && reportDataForType
    ? reportDataForType
    : { topCustomers, totalCustomers: topCustomers.length, newCustomers: 0, repeatCustomers: 0 };
    
  // Ensure all potential array data has fallbacks
  const safeRevenueByDay = Array.isArray(salesData?.revenueByDay) ? salesData.revenueByDay : [];
  const safeTopSellingItems = Array.isArray(salesData?.topSellingItems) ? salesData.topSellingItems : [];
  const safeOrderTypes = Array.isArray(salesData?.orderTypes) ? salesData.orderTypes : [];
  const safePaymentMethods = Array.isArray(salesData?.paymentMethods) ? salesData.paymentMethods : [];
  
  const safeStockCategories = Array.isArray(inventoryData?.stockCategories) ? inventoryData.stockCategories : [];
  const safeStockMovement = Array.isArray(inventoryData?.stockMovement) ? inventoryData.stockMovement : [];
  const safeLowStockItems = Array.isArray(inventoryData?.lowStockItems) ? inventoryData.lowStockItems : [];
  const safeExpiryWarnings = Array.isArray(inventoryData?.expiryWarnings) ? inventoryData.expiryWarnings : [];
  
  const safeStaffDistribution = Array.isArray(staffData?.staffDistribution) ? staffData.staffDistribution : [];
  const safeWorkHours = Array.isArray(staffData?.workHours) ? staffData.workHours : [];
  const safeStaffingCosts = Array.isArray(staffData?.staffingCosts) ? staffData.staffingCosts : [];
  const safeTopPerformers = Array.isArray(staffData?.topPerformers) ? staffData.topPerformers : [];
  
  const safeCategoryPerformance = Array.isArray(menuData?.categoryPerformance) ? menuData.categoryPerformance : [];
  const safeMenuItemProfitability = Array.isArray(menuData?.menuItemProfitability) ? menuData.menuItemProfitability : [];
  const safeItemPopularity = Array.isArray(menuData?.itemPopularity) ? menuData.itemPopularity : [];
  const safeRevenueByTimeOfDay = Array.isArray(menuData?.revenueByTimeOfDay) ? menuData.revenueByTimeOfDay : [];
  
  const safeTopCustomers = Array.isArray(customersData?.topCustomers) ? customersData.topCustomers : [];
  
  // Sales summary metrics
  const totalSales = salesData.totalRevenue || (safeRevenueByDay.reduce((sum: number, day: any) => sum + day.revenue, 0) || 0);
  const totalOrders = salesData.totalOrders || (safeOrderTypes.length * 15 || 0);
  const averageOrderValue = salesData.averageOrderValue || Math.round(totalSales / (totalOrders || 1));
  const tableTurnoverRate = salesData.tableTurnoverRate || 4.2;
  
  // Chart data for sales
  const salesChartData = {
    labels: safeRevenueByDay.map((day: any) => formatDate(day.date)) || 
            salesReportData.revenueByDay.map(day => formatDate(day.date)),
    datasets: [
      {
        label: 'Revenue',
        data: safeRevenueByDay.map((day: any) => day.revenue) || 
              salesReportData.revenueByDay.map(day => day.revenue),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }
  
  // Only render charts and data on client side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex-1 overflow-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-600">View insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <FaPrint className="mr-2" />
            <span>Print</span>
          </button>
          <button 
            onClick={() => {
              const fileName = `${activeReport}-report-${period}.json`;
              const dataStr = JSON.stringify(reportData?.data || {});
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', fileName);
              linkElement.click();
            }}
            className="flex items-center bg-indigo-600 px-4 py-2 text-white rounded-lg hover:bg-indigo-700"
          >
            <FaFileDownload className="mr-2" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Report Type Selector */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Report Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(reportCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveReport(key as ReportType)}
              className={`flex flex-col items-center p-4 rounded-lg border text-center transition-colors ${
                activeReport === key 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className={`text-xl mb-2 ${activeReport === key ? 'text-indigo-600' : 'text-gray-500'}`}>
                {category.icon}
              </div>
              <h3 className="font-medium text-sm mb-1">{category.title}</h3>
              <p className="text-xs text-gray-500">{category.description}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Date Range Selector */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
          <h2 className="text-lg font-semibold text-gray-800">Time Period</h2>
          
          <div className="flex space-x-4 items-center">
            <div className="relative">
              <select 
                value={period}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <button 
              onClick={() => fetchReportData()}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
            >
              <FaSyncAlt className="mr-2" />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Custom Date Range Selector (conditionally rendered) */}
        {showCustomDateRange && (
          <div className="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col">
              <label htmlFor="start-date" className="text-sm text-gray-600 mb-1">Start Date</label>
              <input 
                type="date" 
                id="start-date"
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="end-date" className="text-sm text-gray-600 mb-1">End Date</label>
              <input 
                type="date" 
                id="end-date"
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                onClick={applyCustomDateRange}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Report Content */}
      <div className="space-y-6">
        {activeReport === 'sales' && (
          <>
            {/* Sales Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard 
                title="Total Revenue" 
                value={formatCurrency(totalSales)} 
                icon={<FaChartLine />} 
                change="+12.5% from previous period" 
                changeType="positive" 
              />
              <StatCard 
                title="Total Orders" 
                value={totalOrders.toString()} 
                icon={<FaChartBar />} 
                change="+8.2% from previous period" 
                changeType="positive" 
              />
              <StatCard 
                title="Average Order Value" 
                value={formatCurrency(averageOrderValue)} 
                icon={<FaChartPie />} 
                change="+5.3% from previous period" 
                changeType="positive" 
              />
              <StatCard 
                title="Table Turnover Rate" 
                value="4.2x" 
                icon={<FaTable />} 
                change="-2.1% from previous period" 
                changeType="negative" 
              />
            </div>
            
            {/* Sales Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Revenue</h2>
                <div className="h-64">
                  <Line 
                    data={salesChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          titleFont: {
                            size: 13,
                          },
                          bodyFont: {
                            size: 12,
                          },
                          callbacks: {
                            label: function(context) {
                              return '₹' + context.parsed.y.toLocaleString('en-IN');
                            }
                          }
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '₹' + value.toLocaleString('en-IN');
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Breakdown</h2>
                <div className="h-64 flex items-center">
                  <Doughnut
                    data={{
                      labels: safeOrderTypes.map((type: OrderType) => type.type),
                      datasets: [
                        {
                          data: safeOrderTypes.map((type: OrderType) => type.amount),
                          backgroundColor: [
                            'rgba(79, 70, 229, 0.8)',  // Indigo
                            'rgba(59, 130, 246, 0.8)', // Blue
                            'rgba(16, 185, 129, 0.8)'  // Green
                          ],
                          borderColor: [
                            'rgb(79, 70, 229)',
                            'rgb(59, 130, 246)',
                            'rgb(16, 185, 129)'
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            font: {
                              size: 12
                            },
                            padding: 20
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                          }
                        }
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Top Selling Items */}
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeTopSellingItems.map((item: TopSellingItem, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="py-3 px-4 text-right">{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Revenue by Item Chart */}
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Item</h2>
              <div className="h-80">
                <Bar 
                  data={{
                    labels: safeTopSellingItems.map((item: TopSellingItem) => item.name),
                    datasets: [
                      {
                        label: 'Revenue',
                        data: safeTopSellingItems.map((item: TopSellingItem) => item.revenue),
                        backgroundColor: 'rgba(79, 70, 229, 0.7)',
                        borderColor: 'rgb(79, 70, 229)',
                        borderWidth: 1
                      },
                      {
                        label: 'Quantity Sold',
                        data: safeTopSellingItems.map((item: TopSellingItem) => item.quantity * 100), // Scale quantity for visibility
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Revenue (₹)'
                        }
                      },
                      y1: {
                        beginAtZero: true,
                        position: 'right',
                        title: {
                          display: true,
                          text: 'Quantity Sold'
                        },
                        grid: {
                          drawOnChartArea: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Order Type Breakdown */}
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Type Breakdown</h2>
              <div className="space-y-4">
                {safeOrderTypes.map((type: OrderType, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{type.type || type.status}</span>
                      <span>{formatCurrency(type.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${type.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{type.count} orders</span>
                      <span>{type.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment Methods Breakdown */}
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Method Breakdown</h2>
              <div className="space-y-4">
                {safePaymentMethods.map((method: PaymentMethod, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{method.method}</span>
                      <span>{formatCurrency(method.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${method.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{method.count} transactions</span>
                      <span>{method.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {activeReport === 'customers' && (
          <>
            {/* Customer Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard 
                title="Total Customers" 
                value={customersData.totalCustomers.toString()} 
                icon={<FaChartLine />} 
                change="+15.2% from previous period" 
                changeType="positive" 
              />
              <StatCard 
                title="New Customers" 
                value={customersData.newCustomers.toString()} 
                icon={<FaChartBar />} 
                change="+23.6% from previous period" 
                changeType="positive" 
              />
              <StatCard 
                title="Repeat Customers" 
                value={customersData.repeatCustomers.toString()} 
                icon={<FaChartPie />} 
                change="+4.8% from previous period" 
                changeType="positive" 
              />
              <StatCard 
                title="Avg. Customer Value" 
                value={formatCurrency(8450)}  // Use fixed value to avoid hydration mismatch
                icon={<FaTable />} 
                change="+7.2% from previous period" 
                changeType="positive" 
              />
            </div>
            
            {/* Customer Charts (Placeholder) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Growth</h2>
                <div className="h-64">
                  <Line 
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                      datasets: [
                        {
                          label: 'Total Customers',
                          data: [250, 290, 320, 370, 400, 428],
                          borderColor: 'rgb(79, 70, 229)',
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                          tension: 0.3,
                          fill: true,
                          yAxisID: 'y',
                        },
                        {
                          label: 'New Customers',
                          data: [30, 40, 35, 50, 40, 65],
                          borderColor: 'rgb(16, 185, 129)',
                          backgroundColor: 'rgba(16, 185, 129, 0)',
                          borderDash: [5, 5],
                          tension: 0.3,
                          yAxisID: 'y1',
                        }
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false,
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: {
                            display: true,
                            text: 'Total Customers'
                          }
                        },
                        y1: {
                          beginAtZero: true,
                          type: 'linear',
                          display: true,
                          position: 'right',
                          grid: {
                            drawOnChartArea: false,
                          },
                          title: {
                            display: true,
                            text: 'New Customers'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Segmentation</h2>
                <div className="h-64 flex items-center justify-center">
                  <Pie
                    data={{
                      labels: ['Regular', 'New', 'VIP', 'Inactive'],
                      datasets: [
                        {
                          data: [210, 65, 90, 63],
                          backgroundColor: [
                            'rgba(79, 70, 229, 0.7)',   // Indigo - Regular
                            'rgba(16, 185, 129, 0.7)',  // Green - New
                            'rgba(245, 158, 11, 0.7)',  // Amber - VIP
                            'rgba(239, 68, 68, 0.7)',   // Red - Inactive
                          ],
                          borderColor: [
                            'rgb(79, 70, 229)',
                            'rgb(16, 185, 129)',
                            'rgb(245, 158, 11)',
                            'rgb(239, 68, 68)'
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            font: {
                              size: 12
                            },
                            padding: 20
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const value = context.parsed;
                              const percentage = Math.round((value / total) * 100);
                              return `${context.label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Top Customers */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-800">Top Customers</h2>
                <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                  View All
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Lifetime Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeTopCustomers.map((customer: {
                      id: string;
                      name: string;
                      totalSpent: number;
                      visitCount: number;
                      lastVisit: string;
                      avgOrderValue: number;
                      loyaltyPoints: number;
                    }, idx: number) => (
                      <tr key={`customer-${idx}`} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{customer.name}</td>
                        <td className="px-4 py-2">${customer.totalSpent.toFixed(2)}</td>
                        <td className="px-4 py-2">{customer.visitCount}</td>
                        <td className="px-4 py-2">{formatDate(customer.lastVisit)}</td>
                        <td className="px-4 py-2">${customer.avgOrderValue.toFixed(2)}</td>
                        <td className="px-4 py-2">{customer.loyaltyPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
        {/* Inventory Reports Content */}
        {activeReport === 'inventory' && (
          <>
            {/* Inventory Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard 
                title="Total Inventory Value" 
                value={formatCurrency(186700)} 
                icon={<FaBoxOpen />} 
                change="+4.2% from last month" 
                changeType="positive" 
              />
              <StatCard 
                title="Total Stock Items" 
                value="104" 
                icon={<FaList />} 
                change="+6 items from last month" 
                changeType="positive" 
              />
              <StatCard 
                title="Low Stock Items" 
                value="5" 
                icon={<FaExclamationTriangle />} 
                change="Critical attention needed" 
                changeType="negative" 
              />
              <StatCard 
                title="Items Expiring Soon" 
                value="3" 
                icon={<FaCalendarAlt />} 
                change="Action required" 
                changeType="negative" 
              />
            </div>
            
            {/* Stock Value by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Stock Value by Category</h2>
                <div className="h-64">
                  <Bar 
                    data={{
                      labels: safeStockCategories.map(item => item.category),
                      datasets: [
                        {
                          label: 'Stock Value',
                          data: safeStockCategories.map(item => item.totalValue),
                          backgroundColor: 'rgba(79, 70, 229, 0.7)',
                          borderColor: 'rgb(79, 70, 229)',
                          borderWidth: 1,
                        }
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Stock Value: ${formatCurrency(context.parsed.y)}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '₹' + value.toLocaleString('en-IN');
                            }
                          },
                          title: {
                            display: true,
                            text: 'Value (₹)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Stock Movement (7 Days)</h2>
                <div className="h-64">
                  <Line 
                    data={{
                      labels: safeStockMovement.map(day => {
                        const date = new Date(day.date);
                        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                      }),
                      datasets: [
                        {
                          label: 'Incoming Stock',
                          data: safeStockMovement.map(day => day.incoming),
                          borderColor: 'rgb(16, 185, 129)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          tension: 0.3,
                          fill: true,
                        },
                        {
                          label: 'Outgoing Stock',
                          data: safeStockMovement.map(day => day.outgoing),
                          borderColor: 'rgb(239, 68, 68)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          tension: 0.3,
                          fill: true,
                        }
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '₹' + value.toLocaleString('en-IN');
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Low Stock and Expiry Warnings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Low Stock Alerts */}
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold text-gray-800">Low Stock Items</h2>
                  <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Min Required</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeLowStockItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">{item.name}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-600">{item.category}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-600">{item.currentStock} {item.currentStock < item.minRequired ? 
                              <span className="text-red-500 text-xs">↓</span> : 
                              <span className="text-green-500 text-xs">↑</span>}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-600">{item.minRequired}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span 
                              className={`inline-block py-1 px-2.5 rounded-full text-xs font-medium ${
                                item.currentStock < item.minRequired * 0.5 ? 
                                  'bg-red-100 text-red-800' : 
                                  item.currentStock < item.minRequired ? 
                                  'bg-yellow-100 text-yellow-800' : 
                                  'bg-green-100 text-green-800'
                              }`}
                            >
                              {item.currentStock < item.minRequired * 0.5 ? 'Critical' : 
                                item.currentStock < item.minRequired ? 'Low' : 'Adequate'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Expiry Warnings */}
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold text-gray-800">Items Expiring Soon</h2>
                  <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeExpiryWarnings.map((item, idx) => {
                        const expiryDate = new Date(item.expiryDate);
                        const today = new Date();
                        const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-800">{item.name}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-gray-600">{item.category}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-gray-600">{item.quantity}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-gray-600">{formatDate(item.expiryDate)}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span 
                                className={`inline-block py-1 px-2.5 rounded-full text-xs font-medium ${
                                  daysLeft <= 2 ? 'bg-red-100 text-red-800' : 
                                  daysLeft <= 5 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-green-100 text-green-800'
                                }`}
                              >
                                {daysLeft} days
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Staff Reports Content */}
        {activeReport === 'staff' && (
          <>
            {/* Staff Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard 
                title="Total Staff" 
                value="29" 
                icon={<FaUsers />} 
                change="+2 from last month" 
                changeType="positive" 
              />
              <StatCard 
                title="Avg. Hours/Week" 
                value="42.5" 
                icon={<FaClock />} 
                change="+2.1 hours from last month" 
                changeType="neutral" 
              />
              <StatCard 
                title="Staff Costs" 
                value={formatCurrency(198000)} 
                icon={<FaMoneyBillWave />} 
                change="+5.3% from last month" 
                changeType="negative" 
              />
              <StatCard 
                title="Avg. Performance" 
                value="89%" 
                icon={<FaChartLine />} 
                change="+3.2% from last month" 
                changeType="positive" 
              />
            </div>
            
            {/* Staff Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Staff Distribution</h2>
                <div className="h-64 flex items-center">
                  <Pie
                    data={{
                      labels: safeStaffDistribution.map(item => item.department),
                      datasets: [
                        {
                          data: safeStaffDistribution.map(item => item.count),
                          backgroundColor: [
                            'rgba(79, 70, 229, 0.7)',   // Indigo - Kitchen
                            'rgba(16, 185, 129, 0.7)',  // Green - Service
                            'rgba(245, 158, 11, 0.7)',  // Amber - Management
                            'rgba(59, 130, 246, 0.7)',  // Blue - Cleaning
                            'rgba(239, 68, 68, 0.7)',   // Red - Security
                          ],
                          borderColor: [
                            'rgb(79, 70, 229)',
                            'rgb(16, 185, 129)',
                            'rgb(245, 158, 11)',
                            'rgb(59, 130, 246)',
                            'rgb(239, 68, 68)'
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            font: {
                              size: 12
                            },
                            padding: 20
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const item = safeStaffDistribution[context.dataIndex];
                              return `${item.department}: ${item.count} (${item.costPercentage}% of costs)`;
                            }
                          }
                        }
                      },
                    }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Work Hours</h2>
                <div className="h-64">
                  <Bar 
                    data={{
                      labels: safeWorkHours.map(day => day.day),
                      datasets: [
                        {
                          label: 'Total Hours',
                          data: safeWorkHours.map(day => day.hours),
                          backgroundColor: 'rgba(79, 70, 229, 0.7)',
                          borderColor: 'rgb(79, 70, 229)',
                          borderWidth: 1,
                        }
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.label}: ${context.parsed.y} hours`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Total Hours'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Staff Cost Trend & Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Staff Cost Trend */}
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Staff Cost Trend (6 Months)</h2>
                <div className="h-64">
                  <Line 
                    data={{
                      labels: safeStaffingCosts.map(month => month.month),
                      datasets: [
                        {
                          label: 'Monthly Cost',
                          data: safeStaffingCosts.map(month => month.cost),
                          borderColor: 'rgb(239, 68, 68)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          tension: 0.3,
                          fill: true,
                        }
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Staff Cost: ${formatCurrency(context.parsed.y)}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '₹' + value.toLocaleString('en-IN');
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Top Performers */}
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold text-gray-800">Top Performers</h2>
                  <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeTopPerformers.map((staff, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">{staff.name}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-600">{staff.role}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                                <div 
                                  className="bg-indigo-600 h-2.5 rounded-full" 
                                  style={{ width: `${staff.efficiency}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-600 text-sm">{staff.efficiency}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {staff.role === 'Chef' ? (
                              <p className="text-gray-600">{staff.orderCompletion} orders</p>
                            ) : (
                              <div className="flex items-center">
                                <p className="text-gray-600 mr-1">{staff.customerRating}</p>
                                <FaStar className="text-yellow-400 text-xs" />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Menu Performance Reports Content */}
        {activeReport === 'menu' && (
          <>
            {/* Menu Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard 
                title="Total Menu Items" 
                value="51" 
                icon={<FaUtensils />} 
                change="+3 from last month" 
                changeType="positive" 
              />
              <StatCard 
                title="Avg. Item Price" 
                value={formatCurrency(245)} 
                icon={<FaMoneyBillWave />} 
                change="+5.3% from last month" 
                changeType="neutral" 
              />
              <StatCard 
                title="Avg. Profit Margin" 
                value="48%" 
                icon={<FaPercentage />} 
                change="+2.1% from last month" 
                changeType="positive" 
              />
              <StatCard 
                title="Most Popular" 
                value="Butter Chicken" 
                icon={<FaAward />} 
                change="142 orders this month" 
                changeType="positive" 
              />
            </div>
            
            {/* Menu Category Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Category Revenue</h2>
                <div className="h-64">
                  <Bar 
                    data={{
                      labels: safeCategoryPerformance.map(cat => cat.category),
                      datasets: [
                        {
                          label: 'Revenue',
                          data: safeCategoryPerformance.map(cat => cat.revenue),
                          backgroundColor: 'rgba(79, 70, 229, 0.7)',
                          borderColor: 'rgb(79, 70, 229)',
                          borderWidth: 1,
                        }
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Revenue: ${formatCurrency(context.parsed.y)}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '₹' + value.toLocaleString('en-IN');
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Time of Day</h2>
                <div className="h-64 flex items-center">
                  <Doughnut
                    data={{
                      labels: safeRevenueByTimeOfDay.map(slot => slot.timeSlot),
                      datasets: [
                        {
                          data: safeRevenueByTimeOfDay.map(slot => slot.revenue),
                          backgroundColor: [
                            'rgba(245, 158, 11, 0.7)',  // Amber
                            'rgba(79, 70, 229, 0.7)',   // Indigo
                            'rgba(59, 130, 246, 0.7)',  // Blue
                            'rgba(16, 185, 129, 0.7)',  // Green
                          ],
                          borderColor: [
                            'rgb(245, 158, 11)',
                            'rgb(79, 70, 229)',
                            'rgb(59, 130, 246)',
                            'rgb(16, 185, 129)'
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            font: {
                              size: 12
                            },
                            padding: 20
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed;
                              const totalRevenue = safeRevenueByTimeOfDay.reduce((a, b) => a + b.revenue, 0);
                              const percentage = Math.round((value / totalRevenue) * 100);
                              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                          }
                        }
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Menu Item Profitability & Popularity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Profitability */}
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold text-gray-800">Item Profitability</h2>
                  <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Price</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Margin %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeMenuItemProfitability.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">{item.name}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-600">{formatCurrency(item.cost)}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">{formatCurrency(item.price)}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-green-600 font-medium">{formatCurrency(item.margin)}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                                <div 
                                  className="bg-green-500 h-2.5 rounded-full" 
                                  style={{ width: `${item.marginPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-600 text-sm">{item.marginPercentage}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Item Popularity */}
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold text-gray-800">Item Popularity</h2>
                  <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeItemPopularity.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">{item.name}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-600">{item.orders}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">{formatCurrency(item.revenue)}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <p className="text-gray-700 font-medium mr-1">{item.rating.toFixed(1)}</p>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar 
                                    key={i} 
                                    className={`text-xs ${i < Math.floor(item.rating) 
                                      ? 'text-yellow-400' 
                                      : i < item.rating 
                                        ? 'text-yellow-300' 
                                        : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Report Actions */}
      <div className="flex justify-end mt-8 space-x-4">
        <button className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
          <FaDownload className="mr-2" />
          <span>Download CSV</span>
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <FaPrint className="mr-2" />
          <span>Print Report</span>
        </button>
      </div>
    </div>
  );
} 