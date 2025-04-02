'use client';

import { useState } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaPrint, 
  FaCheckCircle, 
  FaTruck, 
  FaTimesCircle,
  FaCalendarAlt,
  FaSortAmountDown
} from 'react-icons/fa';

// Sample orders data
const initialOrders = [
  {
    id: '3842',
    customer: 'Raj Mehta',
    date: '2023-04-02T10:30:00',
    items: 3,
    total: 842.50,
    status: 'completed',
    payment: 'paid',
    paymentMethod: 'Credit Card',
    address: '123 Park Street, Mumbai',
    phone: '+91 9876543210'
  },
  {
    id: '3841',
    customer: 'Priya Singh',
    date: '2023-04-02T09:45:00',
    items: 2,
    total: 655.00,
    status: 'preparing',
    payment: 'paid',
    paymentMethod: 'UPI',
    address: '456 Lake View, Delhi',
    phone: '+91 9876543211'
  },
  {
    id: '3840',
    customer: 'Aman Verma',
    date: '2023-04-02T09:15:00',
    items: 5,
    total: 1245.00,
    status: 'delivered',
    payment: 'paid',
    paymentMethod: 'Cash on Delivery',
    address: '789 Hill Road, Bangalore',
    phone: '+91 9876543212'
  },
  {
    id: '3839',
    customer: 'Nisha Patel',
    date: '2023-04-02T08:30:00',
    items: 1,
    total: 320.00,
    status: 'completed',
    payment: 'paid',
    paymentMethod: 'Credit Card',
    address: '101 River Lane, Chennai',
    phone: '+91 9876543213'
  },
  {
    id: '3838',
    customer: 'Sandeep Kumar',
    date: '2023-04-01T19:45:00',
    items: 4,
    total: 920.50,
    status: 'cancelled',
    payment: 'refunded',
    paymentMethod: 'Debit Card',
    address: '202 Valley Road, Hyderabad',
    phone: '+91 9876543214'
  },
  {
    id: '3837',
    customer: 'Kavita Sharma',
    date: '2023-04-01T18:30:00',
    items: 2,
    total: 425.00,
    status: 'delivered',
    payment: 'paid',
    paymentMethod: 'UPI',
    address: '303 Mountain View, Pune',
    phone: '+91 9876543215'
  }
];

// Status options for filtering
const statusOptions = ['All Status', 'Preparing', 'Completed', 'Delivered', 'Cancelled'];

// Date range options for filtering
const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' }
];

// Format date string to a readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Check if a date falls within a specific range
const isDateInRange = (dateString: string, range: string): boolean => {
  const orderDate = new Date(dateString);
  const now = new Date();
  
  // Reset time to start of day for accurate day comparisons
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday as first day
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  switch (range) {
    case 'today':
      return orderDate >= today && orderDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    case 'yesterday':
      return orderDate >= yesterday && orderDate < today;
    case 'week':
      return orderDate >= startOfWeek && orderDate < now;
    case 'month':
      return orderDate >= startOfMonth && orderDate < now;
    default:
      return true; // 'all' or invalid ranges
  }
};

// Get appropriate status badge styling
const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case 'preparing':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'delivered':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get appropriate status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'preparing':
      return <FaFilter className="mr-1" />;
    case 'completed':
      return <FaCheckCircle className="mr-1" />;
    case 'delivered':
      return <FaTruck className="mr-1" />;
    case 'cancelled':
      return <FaTimesCircle className="mr-1" />;
    default:
      return null;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [dateRange, setDateRange] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Filter orders based on search query, selected status, and date range
  const filteredOrders = orders.filter(order => {
    // Match search query
    const matchesSearch = 
      order.id.includes(searchQuery) || 
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Match status
    const matchesStatus = 
      selectedStatus === 'All Status' || 
      order.status.toLowerCase() === selectedStatus.toLowerCase();
    
    // Match date range
    const matchesDateRange = isDateInRange(order.date, dateRange);
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Toggle order details expansion
  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        <p className="text-gray-600">View and manage customer orders</p>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex space-x-4">
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    Date & Time
                    <FaSortAmountDown className="ml-1 text-gray-400" size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <>
                    <tr key={order.id} className={`hover:bg-gray-50 ${expandedOrderId === order.id ? 'bg-indigo-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(order.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.items}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`flex items-center px-2.5 py-1 text-xs rounded-full ${getStatusBadgeStyles(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{order.payment}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => toggleOrderDetails(order.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            aria-label="View order details"
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="text-gray-600 hover:text-gray-900"
                            aria-label="Print order"
                          >
                            <FaPrint />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Order Details */}
                    {expandedOrderId === order.id && (
                      <tr className="bg-indigo-50" key={`${order.id+1}`}>
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-800 mb-2">Customer Information</h4>
                              <p className="text-sm text-gray-600">{order.customer}</p>
                              <p className="text-sm text-gray-600">{order.phone}</p>
                              <p className="text-sm text-gray-600">{order.address}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-800 mb-2">Payment Information</h4>
                              <p className="text-sm text-gray-600">Method: {order.paymentMethod}</p>
                              <p className="text-sm text-gray-600">Status: <span className="capitalize">{order.payment}</span></p>
                              <p className="text-sm text-gray-600">Total Amount: ₹{order.total.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="flex mt-4 pt-4 border-t border-indigo-100">
                            <h4 className="text-sm font-medium text-gray-800 mr-4">Update Status:</h4>
                            <div className="flex space-x-2">
                              {order.status !== 'preparing' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                                  className="px-3 py-1 text-xs rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                >
                                  Preparing
                                </button>
                              )}
                              {order.status !== 'completed' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'completed')}
                                  className="px-3 py-1 text-xs rounded-md bg-green-100 text-green-800 hover:bg-green-200"
                                >
                                  Completed
                                </button>
                              )}
                              {order.status !== 'delivered' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                                  className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
                                >
                                  Delivered
                                </button>
                              )}
                              {order.status !== 'cancelled' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                  className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-800 hover:bg-red-200"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No orders found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredOrders.length}</span> of <span className="font-medium">{orders.length}</span> orders
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-green-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Completed Orders</h3>
          <p className="text-3xl font-bold text-gray-900">
            {orders.filter(order => order.status === 'completed').length}
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Preparing</h3>
          <p className="text-3xl font-bold text-gray-900">
            {orders.filter(order => order.status === 'preparing').length}
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Delivered</h3>
          <p className="text-3xl font-bold text-gray-900">
            {orders.filter(order => order.status === 'delivered').length}
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-red-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Cancelled</h3>
          <p className="text-3xl font-bold text-gray-900">
            {orders.filter(order => order.status === 'cancelled').length}
          </p>
        </div>
      </div>
    </div>
  );
} 