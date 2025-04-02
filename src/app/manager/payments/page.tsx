'use client';

import React, { useState } from 'react';
import {
  FaSearch,
  FaFilter,
  FaMoneyBillWave,
  FaCreditCard,
  FaWallet,
  FaFileInvoiceDollar,
  FaChartLine,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaRegClock,
  FaSortAmountDown,
  FaTimes,
  FaPrint,
  FaDownload,
  FaBuilding
} from 'react-icons/fa';

// Sample payments data
const initialPayments = [
  {
    id: 'PAY-5621',
    orderId: '#3842',
    customer: 'Raj Mehta',
    date: '2023-04-02T10:35:00',
    amount: 842.50,
    method: 'Credit Card',
    status: 'completed',
    cardInfo: '**** **** **** 4512'
  },
  {
    id: 'PAY-5620',
    orderId: '#3841',
    customer: 'Priya Singh',
    date: '2023-04-02T09:50:00',
    amount: 655.00,
    method: 'UPI',
    status: 'completed',
    cardInfo: 'priya@upibank'
  },
  {
    id: 'PAY-5619',
    orderId: '#3840',
    customer: 'Aman Verma',
    date: '2023-04-02T09:30:00',
    amount: 1245.00,
    method: 'Cash',
    status: 'completed',
    cardInfo: ''
  },
  {
    id: 'PAY-5618',
    orderId: '#3839',
    customer: 'Nisha Patel',
    date: '2023-04-02T08:45:00',
    amount: 320.00,
    method: 'Credit Card',
    status: 'completed',
    cardInfo: '**** **** **** 7890'
  },
  {
    id: 'PAY-5617',
    orderId: '#3838',
    customer: 'Sandeep Kumar',
    date: '2023-04-01T20:10:00',
    amount: 920.50,
    method: 'Debit Card',
    status: 'refunded',
    cardInfo: '**** **** **** 3456'
  },
  {
    id: 'PAY-5616',
    orderId: '#3837',
    customer: 'Kavita Sharma',
    date: '2023-04-01T18:45:00',
    amount: 425.00,
    method: 'UPI',
    status: 'completed',
    cardInfo: 'kavita@upibank'
  },
  {
    id: 'PAY-5615',
    orderId: '#3836',
    customer: 'Mohit Agarwal',
    date: '2023-04-01T17:30:00',
    amount: 1100.00,
    method: 'Credit Card',
    status: 'pending',
    cardInfo: '**** **** **** 1234'
  },
  {
    id: 'PAY-5614',
    orderId: '#3835',
    customer: 'Sneha Reddy',
    date: '2023-04-01T15:15:00',
    amount: 750.50,
    method: 'Debit Card',
    status: 'completed',
    cardInfo: '**** **** **** 5678'
  }
];

// Payment method options for filtering
const paymentMethods = [
  'All Methods', 'Credit Card', 'Debit Card', 'UPI', 'Cash', 'Wallet'
];

// Payment status options for filtering
const paymentStatuses = [
  'All Statuses', 'Completed', 'Pending', 'Refunded', 'Failed'
];

// Date range options for filtering
const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' }
];

// Payment summary stats
const paymentStats = [
  { 
    title: 'Total Revenue', 
    value: '₹178,560', 
    icon: <FaMoneyBillWave />, 
    change: '+8.2% from last month',
    changeType: 'positive' as const
  },
  { 
    title: 'Transactions', 
    value: '342', 
    icon: <FaFileInvoiceDollar />, 
    change: '+12.5% from last month',
    changeType: 'positive' as const
  },
  { 
    title: 'Average Order', 
    value: '₹522', 
    icon: <FaChartLine />, 
    change: '-2.3% from last month',
    changeType: 'negative' as const
  },
  { 
    title: 'Refunded', 
    value: '₹3,250', 
    icon: <FaWallet />, 
    change: 'Total for this month',
    changeType: 'neutral' as const
  }
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

// Format currency to Indian Rupees
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

// Check if a date falls within a specific range
const isDateInRange = (dateString: string, range: string): boolean => {
  const paymentDate = new Date(dateString);
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
      return paymentDate >= today && paymentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    case 'yesterday':
      return paymentDate >= yesterday && paymentDate < today;
    case 'week':
      return paymentDate >= startOfWeek && paymentDate < now;
    case 'month':
      return paymentDate >= startOfMonth && paymentDate < now;
    default:
      return true; // 'all' or invalid ranges
  }
};

// Get appropriate status badge styling
const getStatusBadgeStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'refunded':
      return 'bg-blue-100 text-blue-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get appropriate status icon
const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <FaCheckCircle className="mr-1" />;
    case 'pending':
      return <FaRegClock className="mr-1" />;
    case 'refunded':
      return <FaWallet className="mr-1" />;
    case 'failed':
      return <FaTimesCircle className="mr-1" />;
    default:
      return null;
  }
};

// Get appropriate payment method icon
const getMethodIcon = (method: string) => {
  switch (method.toLowerCase()) {
    case 'credit card':
    case 'debit card':
      return <FaCreditCard className="mr-2 text-gray-500" />;
    case 'upi':
      return <FaWallet className="mr-2 text-gray-500" />;
    case 'cash':
      return <FaMoneyBillWave className="mr-2 text-gray-500" />;
    default:
      return <FaMoneyBillWave className="mr-2 text-gray-500" />;
  }
};

// Stat Card Component
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

export default function PaymentsPage() {
  const [payments] = useState(initialPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('All Methods');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [dateRange, setDateRange] = useState('all');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<string | null>(null);

  // Filter payments based on search query, selected method, selected status, and date range
  const filteredPayments = payments.filter(payment => {
    // Match search query
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Match payment method
    const matchesMethod = 
      selectedMethod === 'All Methods' || 
      payment.method === selectedMethod;
    
    // Match status
    const matchesStatus = 
      selectedStatus === 'All Statuses' || 
      payment.status.toLowerCase() === selectedStatus.toLowerCase();
    
    // Match date range
    const matchesDateRange = isDateInRange(payment.date, dateRange);
    
    return matchesSearch && matchesMethod && matchesStatus && matchesDateRange;
  });

  // Toggle payment details expansion
  const togglePaymentDetails = (paymentId: string) => {
    if (selectedPaymentId === paymentId) {
      setSelectedPaymentId(null);
    } else {
      setSelectedPaymentId(paymentId);
    }
  };

  // Get current viewed payment for invoice
  const currentInvoicePayment = viewInvoice 
    ? payments.find(payment => payment.id === viewInvoice) 
    : null;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Payment Management</h1>
        <p className="text-gray-600">Monitor and manage all payment transactions</p>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {paymentStats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title} 
            value={stat.value} 
            icon={stat.icon} 
            change={stat.change}
            changeType={stat.changeType}
          />
        ))}
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-5">
          <div className="relative mb-4 md:mb-0 md:w-64">
            <input
              type="text"
              placeholder="Search by ID, order or customer..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              <FaCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {paymentStatuses.map((status) => (
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
        
        {/* Payment Summary Display */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing <span className="font-semibold">{filteredPayments.length}</span> of <span className="font-semibold">{payments.length}</span> payments
          </div>
          
          <div className="flex items-center">
            <span className="mr-2">Sort by:</span>
            <button className="flex items-center px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">
              <span className="mr-1">Date</span>
              <FaSortAmountDown className="text-xs" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <React.Fragment key={payment.id}>
                  <tr 
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedPaymentId === payment.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => togglePaymentDetails(payment.id)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {payment.customer}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMethodIcon(payment.method)}
                        <span>{payment.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span 
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyles(payment.status)}`}
                      >
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-indigo-600 font-medium whitespace-nowrap">
                      {payment.orderId}
                    </td>
                  </tr>
                  
                  {/* Expanded Payment Details */}
                  {selectedPaymentId === payment.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Details</h3>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">Payment ID:</span> <span className="text-gray-800 font-medium">{payment.id}</span></p>
                                <p><span className="text-gray-500">Order ID:</span> <span className="text-gray-800 font-medium">{payment.orderId}</span></p>
                                <p><span className="text-gray-500">Amount:</span> <span className="text-gray-800 font-medium">{formatCurrency(payment.amount)}</span></p>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h3>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <span className="text-gray-500">Method:</span> <span className="text-gray-800 font-medium">{payment.method}</span>
                                </p>
                                <p>
                                  <span className="text-gray-500">Status:</span> <span className={`font-medium ${
                                    payment.status === 'completed' ? 'text-green-600' : 
                                    payment.status === 'refunded' ? 'text-blue-600' :
                                    payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-1">Customer Information</h3>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">Name:</span> <span className="text-gray-800 font-medium">{payment.customer}</span></p>
                                <p><span className="text-gray-500">Date:</span> <span className="text-gray-800 font-medium">{formatDate(payment.date)}</span></p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end space-x-3">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewInvoice(payment.id);
                              }} 
                              className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50"
                            >
                              View Invoice
                            </button>
                            {payment.status === 'completed' && (
                              <button className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-sm text-blue-600 hover:bg-blue-100">
                                Process Refund
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No payments found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-semibold">1</span> to <span className="font-semibold">{filteredPayments.length}</span> of <span className="font-semibold">{payments.length}</span> payments
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-md text-sm text-indigo-600 font-medium">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
      
      {/* Invoice Modal */}
      {viewInvoice && currentInvoicePayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800">Invoice #{currentInvoicePayment.id}</h3>
              <button 
                onClick={() => setViewInvoice(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              {/* Restaurant Info */}
              <div className="flex justify-between mb-8">
                <div>
                  <div className="flex items-center">
                    <FaBuilding className="text-indigo-600 mr-2" />
                    <h2 className="text-xl font-bold text-gray-800">Spice Garden Restaurant</h2>
                  </div>
                  <p className="text-gray-600 mt-1">123 Food Street, Flavor District</p>
                  <p className="text-gray-600">Mumbai, Maharashtra 400001</p>
                  <p className="text-gray-600">GSTIN: 27AABCS1234Z1Z5</p>
                </div>
                
                <div className="text-right">
                  <h4 className="text-lg font-bold text-gray-800">Invoice</h4>
                  <p className="text-gray-600">Date: {formatDate(currentInvoicePayment.date)}</p>
                  <p className="text-gray-600">Invoice #: {currentInvoicePayment.id}</p>
                  <p className="text-gray-600">Order #: {currentInvoicePayment.orderId}</p>
                </div>
              </div>
              
              {/* Customer Info */}
              <div className="mb-8 bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-800 mb-2">Customer Information</h4>
                <p><span className="text-gray-600">Name:</span> <span className="text-gray-800 font-medium">{currentInvoicePayment.customer}</span></p>
                <p><span className="text-gray-600">Phone:</span> <span className="text-gray-800 font-medium">+91 98765 43210</span></p>
                <p><span className="text-gray-600">Email:</span> <span className="text-gray-800 font-medium">{currentInvoicePayment.customer.split(' ')[0].toLowerCase()}@email.com</span></p>
              </div>
              
              {/* Order Items (Sample) */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-800 mb-3">Order Details</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 text-sm font-medium text-gray-600 w-12">#</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">Item</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600 text-right">Qty</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600 text-right">Price</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Generate random items based on payment amount */}
                      {[...Array(Math.floor(Math.random() * 4) + 2)].map((_, index) => {
                        const items = [
                          { name: 'Butter Chicken', price: 320 },
                          { name: 'Paneer Tikka', price: 260 },
                          { name: 'Veg Biryani', price: 220 },
                          { name: 'Tandoori Roti', price: 40 },
                          { name: 'Dal Makhani', price: 180 },
                          { name: 'Chicken Biryani', price: 320 },
                          { name: 'Masala Dosa', price: 160 },
                          { name: 'Veg Fried Rice', price: 180 }
                        ];
                        const item = items[Math.floor(Math.random() * items.length)];
                        const qty = Math.floor(Math.random() * 3) + 1;
                        return (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-sm text-gray-800">{index + 1}</td>
                            <td className="py-3 px-4 text-sm text-gray-800">{item.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-800 text-right">{qty}</td>
                            <td className="py-3 px-4 text-sm text-gray-800 text-right">{formatCurrency(item.price)}</td>
                            <td className="py-3 px-4 text-sm text-gray-800 font-medium text-right">{formatCurrency(item.price * qty)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200">
                        <td colSpan={4} className="py-3 px-4 text-sm text-gray-600 font-medium text-right">Subtotal</td>
                        <td className="py-3 px-4 text-sm text-gray-800 font-medium text-right">
                          {formatCurrency(currentInvoicePayment.amount * 0.95)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="py-3 px-4 text-sm text-gray-600 font-medium text-right">CGST (2.5%)</td>
                        <td className="py-3 px-4 text-sm text-gray-800 font-medium text-right">
                          {formatCurrency(currentInvoicePayment.amount * 0.025)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="py-3 px-4 text-sm text-gray-600 font-medium text-right">SGST (2.5%)</td>
                        <td className="py-3 px-4 text-sm text-gray-800 font-medium text-right">
                          {formatCurrency(currentInvoicePayment.amount * 0.025)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="py-3 px-4 text-sm text-gray-800 font-bold text-right">Total</td>
                        <td className="py-3 px-4 text-sm text-gray-800 font-bold text-right">
                          {formatCurrency(currentInvoicePayment.amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {/* Payment Info */}
              <div className="mb-8 flex flex-col sm:flex-row sm:justify-between gap-4">
                <div className="bg-gray-50 p-4 rounded sm:w-1/2">
                  <h4 className="font-medium text-gray-800 mb-2">Payment Information</h4>
                  <p><span className="text-gray-600">Method:</span> <span className="text-gray-800 font-medium">{currentInvoicePayment.method}</span></p>
                  <p><span className="text-gray-600">Status:</span> <span className={`font-medium ${
                    currentInvoicePayment.status === 'completed' ? 'text-green-600' : 
                    currentInvoicePayment.status === 'refunded' ? 'text-blue-600' :
                    currentInvoicePayment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {currentInvoicePayment.status.charAt(0).toUpperCase() + currentInvoicePayment.status.slice(1)}
                  </span></p>
                  <p><span className="text-gray-600">Date:</span> <span className="text-gray-800 font-medium">{formatDate(currentInvoicePayment.date)}</span></p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded sm:w-1/2">
                  <h4 className="font-medium text-gray-800 mb-2">Thank You!</h4>
                  <p className="text-gray-600 mb-2">We appreciate your business and look forward to serving you again.</p>
                  <p className="text-sm text-gray-500">For questions or concerns about this invoice, please contact our support team.</p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="border-t border-gray-200 pt-4 mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  This is a computer generated invoice. No signature required.
                </div>
                <div className="flex space-x-3">
                  <button className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
                    <FaPrint className="mr-2" /> Print
                  </button>
                  <button className="flex items-center px-3 py-1.5 bg-indigo-600 rounded text-sm text-white hover:bg-indigo-700">
                    <FaDownload className="mr-2" /> Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}