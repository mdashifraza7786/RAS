'use client';

import React, { useState, useEffect } from 'react';
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
import { toast } from 'react-hot-toast';

// Payment type definition
interface Payment {
  _id: string;
  order: {
    _id: string;
    orderNumber: string;
    items: any[];
  };
  total: number;
  subtotal?: number;
  tax?: number;
  tip?: number;
  discount?: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string;
  createdAt: string;
  notes?: string;
  cardInfo?: string;
  customer?: string;
}

// Payment method options for filtering
const paymentMethods = [
  'All Methods', 'Card', 'UPI', 'Cash', 'Wallet'
];

// Payment status options for filtering
const paymentStatuses = [
  'All Statuses', 'Paid', 'Pending'
];

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

// Format currency to Indian Rupees
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
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
    case 'paid':
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
    case 'paid':
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

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const StatCard = ({ title, value, icon, change, changeType = 'neutral' }: StatCardProps) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-indigo-500">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`mt-1 text-sm ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="text-2xl text-indigo-500">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('All Methods');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    transactionCount: 0,
    averageOrderValue: 0,
    refundedAmount: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  // Fetch payments data when filters change
  useEffect(() => {
    fetchPayments();
  }, [selectedMethod, selectedDateRange, pagination.page]);

  // Fetch payments from API
  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query string
      const queryParams = new URLSearchParams();
      
      // Date range
      if (selectedDateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        if (selectedDateRange === 'today') {
          startDate.setHours(0, 0, 0, 0);
        } else if (selectedDateRange === 'yesterday') {
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
        } else if (selectedDateRange === 'week') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (selectedDateRange === 'month') {
          startDate.setMonth(startDate.getMonth() - 1);
        }
        
        queryParams.append('startDate', startDate.toISOString());
        queryParams.append('endDate', now.toISOString());
      }
      
      // Payment method
      if (selectedMethod !== 'All Methods') {
        queryParams.append('paymentMethod', selectedMethod);
      }
      
      // Pagination
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
      
      const response = await fetch(`/api/manager/payments?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();

      // Check the structure of the data to determine where the bills are
      let billsData = [];
      if (Array.isArray(data)) {
        // If the API returns an array directly
        billsData = data;
      } else if (data.bills && Array.isArray(data.bills)) {
        // If the API returns {bills: [...]}
        billsData = data.bills;
      } else if (data.data && Array.isArray(data.data)) {
        // If the API returns {data: [...]}
        billsData = data.data;
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid data structure received from API');
      }
      
      setPayments(billsData);
      
      // Set pagination if available
      if (data.pagination) {
        setPagination(data.pagination);
      } else {
        setPagination({
          total: billsData.length,
          page: 1,
          limit: 10,
          pages: Math.ceil(billsData.length / 10)
        });
      }
      
      // Set stats
      if (data.stats) {
        setPaymentStats({
          totalRevenue: data.stats.totalRevenue || 0,
          transactionCount: billsData.length || 0,
          averageOrderValue: data.stats.averageOrderValue || 0,
          refundedAmount: data.stats.refundedAmount || 0
        });
      } else {
        // Calculate basic stats if not provided
        const totalRevenue = billsData.reduce((sum: number, bill: Payment) => sum + (bill.total || 0), 0);
        setPaymentStats({
          totalRevenue,
          transactionCount: billsData.length,
          averageOrderValue: billsData.length ? totalRevenue / billsData.length : 0,
          refundedAmount: 0
        });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching payments');
      toast.error('Failed to load payment data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter payments by status and search query
  const filteredPayments = payments.filter((payment) => {
    // Status filter (case insensitive comparison)
    const matchesStatus = selectedStatus === 'All Statuses' || 
                          payment.paymentStatus.toLowerCase() === selectedStatus.toLowerCase();
    
    // Search query
    const matchesSearch = searchQuery === '' || 
                          payment.order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (payment.customer && payment.customer.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Method filter (handle combined card options)
    let matchesMethod = true;
    if (selectedMethod !== 'All Methods') {
      if (selectedMethod === 'Card') {
        matchesMethod = payment.paymentMethod.toLowerCase() === 'card' || 
                        payment.paymentMethod.toLowerCase().includes('card');
      } else {
        matchesMethod = payment.paymentMethod.toLowerCase() === selectedMethod.toLowerCase();
      }
    }
    
    return matchesStatus && matchesSearch && matchesMethod;
  });

  // Toggle payment details view
  const togglePaymentDetails = (paymentId: string) => {
    if (expandedPayment === paymentId) {
      setExpandedPayment(null);
    } else {
      setExpandedPayment(paymentId);
    }
  };

  // Handle payment status update
  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/manager/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          billId: paymentId,
          status: newStatus.toLowerCase()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment status');
      }
      
      toast.success(`Payment status updated to ${newStatus}`);
      fetchPayments(); // Refresh the payments list
    } catch (err: any) {
      toast.error(err.message || 'Failed to update payment status');
    }
  };

  // Parse value from stats
  const getStatValue = (key: keyof typeof paymentStats, prefix = '') => {
    const value = paymentStats[key];
    if (typeof value === 'number') {
      if (key === 'transactionCount') {
        return `${value}`;
      }
      return formatCurrency(value);
    }
    return prefix + value;
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Payments Management</h1>
        <p className="text-gray-600">Track and manage all payment transactions</p>
      </div>
      
      {/* Payments Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={getStatValue('totalRevenue')}
          icon={<FaMoneyBillWave />}
        />
        <StatCard 
          title="Transactions" 
          value={getStatValue('transactionCount')}
          icon={<FaFileInvoiceDollar />}
        />
        <StatCard 
          title="Average Order" 
          value={getStatValue('averageOrderValue')}
          icon={<FaChartLine />}
        />
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by order number or customer..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
              >
                {paymentMethods.map(method => (
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
                {paymentStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <button 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              onClick={() => {
                // Create a hidden iframe for printing report
                const iframeId = "report-print-frame";
                let printFrame = document.getElementById(iframeId) as HTMLIFrameElement;
                
                // Create the iframe if it doesn't exist
                if (!printFrame) {
                  printFrame = document.createElement('iframe');
                  printFrame.id = iframeId;
                  printFrame.style.position = 'fixed';
                  printFrame.style.right = '0';
                  printFrame.style.bottom = '0';
                  printFrame.style.width = '0';
                  printFrame.style.height = '0';
                  printFrame.style.border = '0';
                  document.body.appendChild(printFrame);
                }
                
                // Create the report HTML
                const reportHTML = `
                  <html>
                    <head>
                      <title>Payment Transactions Report</title>
                      <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .report { max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; margin-bottom: 30px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background-color: #f2f2f2; }
                        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                        .summary { margin: 20px 0; padding: 15px; background-color: #f8f8f8; }
                        .summary div { margin: 5px 0; }
                        .filters { margin-bottom: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 4px; }
                        @media print {
                          body { margin: 0; padding: 15px; }
                          .report { max-width: 100%; }
                        }
                      </style>
                    </head>
                    <body>
                      <div class="report">
                        <div class="header">
                          <h1>Payment Transactions Report</h1>
                          <p>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                        </div>
                        
                        <div class="filters">
                          <strong>Filters:</strong> 
                          <span>Date Range: ${dateRangeOptions.find(o => o.value === selectedDateRange)?.label || 'All Time'}</span> | 
                          <span>Payment Method: ${selectedMethod}</span> | 
                          <span>Status: ${selectedStatus}</span>
                          ${searchQuery ? `| <span>Search: "${searchQuery}"</span>` : ''}
                        </div>
                        
                        <div class="summary">
                          <h3>Summary</h3>
                          <div><strong>Total Revenue:</strong> ${formatCurrency(paymentStats.totalRevenue)}</div>
                          <div><strong>Transactions:</strong> ${paymentStats.transactionCount}</div>
                          <div><strong>Average Order Value:</strong> ${formatCurrency(paymentStats.averageOrderValue)}</div>
                        </div>
                        
                        <table>
                          <thead>
                            <tr>
                              <th>Order #</th>
                              <th>Date</th>
                              <th>Amount</th>
                              <th>Method</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${filteredPayments.map(payment => `
                              <tr>
                                <td>${payment.order.orderNumber}</td>
                                <td>${formatDate(payment.paidAt)}</td>
                                <td>${formatCurrency(payment.total)}</td>
                                <td>${payment.paymentMethod}</td>
                                <td>${payment.paymentStatus}</td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                        
                        <div class="footer">
                          <p>Generated at ${new Date().toLocaleString()}</p>
                        </div>
                      </div>
                    </body>
                  </html>
                `;
                
                // Set the iframe content
                const frameDoc = printFrame.contentWindow?.document;
                if (frameDoc) {
                  frameDoc.open();
                  frameDoc.write(reportHTML);
                  frameDoc.close();
                  
                  // Wait for the iframe content to fully load before printing
                  setTimeout(() => {
                    try {
                      printFrame.contentWindow?.focus();
                      printFrame.contentWindow?.print();
                    } catch (err) {
                      console.error('Printing failed:', err);
                      toast.error('Failed to print report');
                    }
                  }, 500);
                }
              }}
            >
              <FaPrint className="mr-2" size={14} />
              Print Report
            </button>
          </div>
        </div>
      </div>
      
      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="inline-block w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-2">Loading payments...</p>
                  </td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <React.Fragment key={payment._id}>
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => togglePaymentDetails(payment._id)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FaFileInvoiceDollar className="text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{payment.order.orderNumber}</div>
                            <div className="text-xs text-gray-500">ID: {payment._id.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.paidAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.total)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          {getMethodIcon(payment.paymentMethod)}
                          {payment.paymentMethod}
                        </div>
                        {payment.cardInfo && <div className="text-xs text-gray-400">{payment.cardInfo}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyles(payment.paymentStatus)}`}>
                          <span className="flex items-center">
                            {getStatusIcon(payment.paymentStatus)}
                            {payment.paymentStatus}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePaymentDetails(payment._id);
                            }}
                          >
                            {expandedPayment === payment._id ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded details row */}
                    {expandedPayment === payment._id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Details</h4>
                              <p className="text-sm text-gray-600">Order #: {payment.order.orderNumber}</p>
                              <p className="text-sm text-gray-600">Items: {payment.order.items?.length || 0}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Information</h4>
                              <p className="text-sm text-gray-600">Method: {payment.paymentMethod}</p>
                              <p className="text-sm text-gray-600">Status: {payment.paymentStatus}</p>
                              {payment.cardInfo && <p className="text-sm text-gray-600">Card Info: {payment.cardInfo}</p>}
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Actions</h4>
                              <div className="flex space-x-2">
                                {payment.paymentStatus !== 'paid' && (
                                  <button 
                                    className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                                    onClick={() => updatePaymentStatus(payment._id, 'paid')}
                                  >
                                    Mark as Paid
                                  </button>
                                )}
                                
                                <button 
                                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    
                                    // Fetch full order details to get item details
                                    interface OrderItem {
                                      name: string;
                                      price: number;
                                      quantity: number;
                                      note?: string;
                                    }
                                    let orderItems: OrderItem[] = [];
                                    try {
                                      const orderResponse = await fetch(`/api/orders/${payment.order._id}`, {
                                        method: 'GET',
                                        credentials: 'include'
                                      });
                                      
                                      if (orderResponse.ok) {
                                        const orderData = await orderResponse.json();
                                        orderItems = orderData.items || [];
                                      }
                                    } catch (err) {
                                      console.error("Could not fetch order details:", err);
                                      // Continue with available data even if order fetch fails
                                    }
                                    
                                    // Create a hidden iframe for printing
                                    const iframeId = "receipt-print-frame";
                                    let printFrame = document.getElementById(iframeId) as HTMLIFrameElement;
                                    
                                    // Create the iframe if it doesn't exist
                                    if (!printFrame) {
                                      printFrame = document.createElement('iframe');
                                      printFrame.id = iframeId;
                                      printFrame.style.position = 'fixed';
                                      printFrame.style.right = '0';
                                      printFrame.style.bottom = '0';
                                      printFrame.style.width = '0';
                                      printFrame.style.height = '0';
                                      printFrame.style.border = '0';
                                      document.body.appendChild(printFrame);
                                    }
                                    
                                    // Create the receipt HTML
                                    const receiptHTML = `
                                      <html>
                                        <head>
                                          <title>Payment Receipt</title>
                                          <style>
                                            @media print {
                                              body { margin: 0; padding: 0; }
                                              .no-print { display: none; }
                                            }
                                            body { 
                                              font-family: 'Courier New', monospace; 
                                              padding: 10px; 
                                              max-width: 300px; 
                                              margin: 0 auto;
                                              font-size: 12px;
                                            }
                                            .receipt { 
                                              padding: 10px 0;
                                            }
                                            .header { 
                                              text-align: center; 
                                              margin-bottom: 10px;
                                              border-bottom: 1px dashed #000;
                                              padding-bottom: 10px;
                                            }
                                            .header h1 {
                                              font-size: 18px;
                                              margin: 0;
                                              text-transform: uppercase;
                                            }
                                            .header h2 {
                                              font-size: 16px;
                                              margin: 5px 0;
                                            }
                                            .header p {
                                              margin: 3px 0;
                                              font-size: 12px;
                                            }
                                            .details { 
                                              margin-bottom: 10px;
                                            }
                                            .details p { 
                                              margin: 5px 0;
                                              display: flex;
                                              justify-content: space-between;
                                            }
                                            .items {
                                              width: 100%;
                                              border-collapse: collapse;
                                              margin: 10px 0;
                                            }
                                            .items th {
                                              text-align: left;
                                              border-bottom: 1px solid #000;
                                              padding: 5px 0;
                                            }
                                            .items td {
                                              padding: 3px 0;
                                              vertical-align: top;
                                            }
                                            .item-qty {
                                              text-align: center;
                                              width: 30px;
                                            }
                                            .item-price {
                                              text-align: right;
                                              width: 60px;
                                            }
                                            .totals {
                                              margin-top: 5px;
                                              border-top: 1px solid #000;
                                              padding-top: 5px;
                                            }
                                            .totals p {
                                              display: flex;
                                              justify-content: space-between;
                                              margin: 3px 0;
                                            }
                                            .grand-total {
                                              font-weight: bold;
                                              font-size: 14px;
                                              border-top: 1px solid #000;
                                              border-bottom: 1px solid #000;
                                              padding: 5px 0;
                                              margin-top: 5px;
                                            }
                                            .footer { 
                                              text-align: center; 
                                              margin-top: 15px;
                                              font-size: 11px;
                                              border-top: 1px dashed #000;
                                              padding-top: 10px;
                                            }
                                            .footer p { 
                                              margin: 3px 0; 
                                            }
                                          </style>
                                        </head>
                                        <body>
                                          <div class="receipt">
                                            <div class="header">
                                              <h1>Your Restaurant</h1>
                                              <p>123 Food Street, Foodville</p>
                                              <p>Tel: (123) 456-7890</p>
                                              <p>GSTIN: 12ABCDE3456F7Z8</p>
                                              <h2>INVOICE</h2>
                                              <p>Order #: ${payment.order.orderNumber}</p>
                                              <p>Date: ${formatDate(payment.paidAt || payment.createdAt)}</p>
                                              <p>Receipt #: ${payment._id.substring(0, 8)}</p>
                                            </div>
                                            
                                            <div class="details">
                                              <p><span>Payment Method:</span> <span>${payment.paymentMethod}</span></p>
                                              <p><span>Status:</span> <span>${payment.paymentStatus}</span></p>
                                              ${payment.cardInfo ? `<p><span>Card Info:</span> <span>${payment.cardInfo}</span></p>` : ''}
                                            </div>
                                            
                                            <table class="items">
                                              <thead>
                                                <tr>
                                                  <th class="item-qty">Qty</th>
                                                  <th>Item</th>
                                                  <th class="item-price">Price</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                ${orderItems.length > 0 
                                                  ? orderItems.map(item => `
                                                    <tr>
                                                      <td class="item-qty">${item.quantity}</td>
                                                      <td>${item.name}</td>
                                                      <td class="item-price">${formatCurrency(item.price * item.quantity)}</td>
                                                    </tr>
                                                    ${item.note ? `<tr><td></td><td colspan="2" style="font-size:10px;font-style:italic;">Note: ${item.note}</td></tr>` : ''}
                                                  `).join('') 
                                                  : `<tr><td colspan="3" style="text-align:center;padding:10px;">Items not available</td></tr>`
                                                }
                                              </tbody>
                                            </table>
                                            
                                            <div class="totals">
                                              <p><span>Subtotal:</span> <span>${formatCurrency(payment.subtotal || 0)}</span></p>
                                              <p><span>Tax (18%):</span> <span>${formatCurrency(payment.tax || 0)}</span></p>
                                              ${payment.tip && payment.tip > 0 ? `<p><span>Tip:</span> <span>${formatCurrency(payment.tip)}</span></p>` : ''}
                                              ${payment.discount && payment.discount > 0 ? `<p><span>Discount:</span> <span>-${formatCurrency(payment.discount)}</span></p>` : ''}
                                              <p class="grand-total"><span>TOTAL:</span> <span>${formatCurrency(payment.total)}</span></p>
                                            </div>
                                            
                                            <div class="footer">
                                              <p>Thank you for dining with us!</p>
                                              <p>Please visit again soon</p>
                                              ${payment.notes ? `<p>Note: ${payment.notes}</p>` : ''}
                                              <p>www.yourrestaurant.com</p>
                                            </div>
                                          </div>
                                        </body>
                                      </html>
                                    `;
                                    
                                    // Set the iframe content
                                    const frameDoc = printFrame.contentWindow?.document;
                                    if (frameDoc) {
                                      frameDoc.open();
                                      frameDoc.write(receiptHTML);
                                      frameDoc.close();
                                      
                                      // Wait for the iframe content to fully load before printing
                                      setTimeout(() => {
                                        try {
                                          printFrame.contentWindow?.focus();
                                          printFrame.contentWindow?.print();
                                        } catch (err) {
                                          console.error('Printing failed:', err);
                                          toast.error('Failed to print receipt');
                                        }
                                      }, 500);
                                    }
                                  }}
                                >
                                  Print Receipt
                                </button>
                              </div>
                              
                              {payment.notes && (
                                <div className="mt-2">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Notes</h4>
                                  <p className="text-sm text-gray-600">{payment.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {error ? (
                      <>
                        <p className="text-red-500 font-medium">{error}</p>
                        <button 
                          className="mt-2 px-4 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                          onClick={fetchPayments}
                        >
                          Try Again
                        </button>
                      </>
                    ) : (
                      'No payment records found. Try adjusting your filters.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredPayments.length > 0 && pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> payments
            </div>
            <div className="flex space-x-2">
              <button 
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </button>
              
              <button 
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}