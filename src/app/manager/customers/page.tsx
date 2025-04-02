'use client';

import { useState } from 'react';
import { 
  FaSearch, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaHistory, 
  FaSortAmountDown,
  FaEllipsisH,
  FaStar
} from 'react-icons/fa';

// Sample customer data
const initialCustomers = [
  {
    id: 1,
    name: 'Raj Mehta',
    email: 'raj.mehta@example.com',
    phone: '+91 9876543210',
    address: '123 Park Street, Mumbai',
    joinDate: '2022-11-15',
    totalOrders: 28,
    totalSpent: 15420,
    lastOrderDate: '2023-04-02',
    loyaltyPoints: 560,
    status: 'active',
    preferredPayment: 'Credit Card'
  },
  {
    id: 2,
    name: 'Priya Singh',
    email: 'priya.singh@example.com',
    phone: '+91 9876543211',
    address: '456 Lake View, Delhi',
    joinDate: '2023-01-05',
    totalOrders: 12,
    totalSpent: 8740,
    lastOrderDate: '2023-04-02',
    loyaltyPoints: 240,
    status: 'active',
    preferredPayment: 'UPI'
  },
  {
    id: 3,
    name: 'Aman Verma',
    email: 'aman.verma@example.com',
    phone: '+91 9876543212',
    address: '789 Hill Road, Bangalore',
    joinDate: '2022-08-20',
    totalOrders: 32,
    totalSpent: 21550,
    lastOrderDate: '2023-04-02',
    loyaltyPoints: 720,
    status: 'active',
    preferredPayment: 'Cash on Delivery'
  },
  {
    id: 4,
    name: 'Nisha Patel',
    email: 'nisha.patel@example.com',
    phone: '+91 9876543213',
    address: '101 River Lane, Chennai',
    joinDate: '2023-02-10',
    totalOrders: 8,
    totalSpent: 4520,
    lastOrderDate: '2023-04-02',
    loyaltyPoints: 120,
    status: 'active',
    preferredPayment: 'Credit Card'
  },
  {
    id: 5,
    name: 'Sandeep Kumar',
    email: 'sandeep.kumar@example.com',
    phone: '+91 9876543214',
    address: '202 Valley Road, Hyderabad',
    joinDate: '2022-05-12',
    totalOrders: 45,
    totalSpent: 32450,
    lastOrderDate: '2023-04-01',
    loyaltyPoints: 890,
    status: 'inactive',
    preferredPayment: 'Debit Card'
  },
  {
    id: 6,
    name: 'Kavita Sharma',
    email: 'kavita.sharma@example.com',
    phone: '+91 9876543215',
    address: '303 Mountain View, Pune',
    joinDate: '2022-12-30',
    totalOrders: 15,
    totalSpent: 9620,
    lastOrderDate: '2023-04-01',
    loyaltyPoints: 330,
    status: 'active',
    preferredPayment: 'UPI'
  }
];

// Format date string to a readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric'
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

export default function CustomersPage() {
  const [customers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'totalOrders' | 'totalSpent' | 'loyaltyPoints' | 'joinDate'>('totalSpent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedCustomerId, setExpandedCustomerId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter customers based on search query and selected filter
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery);
      
      const matchesFilter = 
        selectedFilter === 'all' || 
        customer.status === selectedFilter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      // Sort based on the selected field
      switch(sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'totalOrders':
          comparison = a.totalOrders - b.totalOrders;
          break;
        case 'totalSpent':
          comparison = a.totalSpent - b.totalSpent;
          break;
        case 'loyaltyPoints':
          comparison = a.loyaltyPoints - b.loyaltyPoints;
          break;
        case 'joinDate':
          comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
          break;
      }
      
      // Apply sort order (ascending or descending)
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Toggle customer details expansion
  const toggleCustomerDetails = (customerId: number) => {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
    } else {
      setExpandedCustomerId(customerId);
    }
  };
  
  // Toggle sort order and field
  const handleSort = (field: 'name' | 'totalOrders' | 'totalSpent' | 'loyaltyPoints' | 'joinDate') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to descending for new sort field
    }
  };
  
  // Get total customer metrics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const totalLoyaltyPoints = customers.reduce((sum, customer) => sum + customer.loyaltyPoints, 0);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
        <p className="text-gray-600">View and manage your restaurant customers</p>
      </div>
      
      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-indigo-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Total Customers</h3>
          <p className="text-3xl font-bold text-gray-900">{totalCustomers}</p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-green-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Active Customers</h3>
          <p className="text-3xl font-bold text-gray-900">{activeCustomers}</p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Loyalty Points</h3>
          <p className="text-3xl font-bold text-gray-900">{totalLoyaltyPoints.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex space-x-4">
            <div className="relative">
              <select 
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <option value="all">All Customers</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={() => alert('Export functionality would go here')}
            >
              Export Customers
            </button>
          </div>
        </div>
      </div>
      
      {/* Customers List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Customer
                    {sortBy === 'name' && (
                      <FaSortAmountDown className={`ml-1 text-gray-400 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} size={12} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('joinDate')}
                  >
                    Join Date
                    {sortBy === 'joinDate' && (
                      <FaSortAmountDown className={`ml-1 text-gray-400 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} size={12} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('totalOrders')}
                  >
                    Orders
                    {sortBy === 'totalOrders' && (
                      <FaSortAmountDown className={`ml-1 text-gray-400 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} size={12} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('totalSpent')}
                  >
                    Total Spent
                    {sortBy === 'totalSpent' && (
                      <FaSortAmountDown className={`ml-1 text-gray-400 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} size={12} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('loyaltyPoints')}
                  >
                    Loyalty
                    {sortBy === 'loyaltyPoints' && (
                      <FaSortAmountDown className={`ml-1 text-gray-400 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} size={12} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <>
                    <tr key={customer.id} className={`hover:bg-gray-50 ${expandedCustomerId === customer.id ? 'bg-indigo-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">
                              <span className={`inline-flex px-2 text-xs rounded-full ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {customer.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center mb-1">
                          <FaEnvelope className="text-gray-400 mr-2" size={12} />
                          {customer.email}
                        </div>
                        <div className="text-sm text-gray-900 flex items-center">
                          <FaPhone className="text-gray-400 mr-2" size={12} />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.joinDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.totalOrders}</div>
                        <div className="text-sm text-gray-500">Last: {formatDate(customer.lastOrderDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 mr-1" size={14} />
                          <span className="text-sm text-gray-900">{customer.loyaltyPoints} pts</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => toggleCustomerDetails(customer.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEllipsisH />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Customer Details */}
                    {expandedCustomerId === customer.id && (
                      <tr key={`${customer.id}-details`} className="bg-indigo-50">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                              <h3 className="flex items-center text-sm font-medium text-gray-800 mb-3">
                                <FaMapMarkerAlt className="text-indigo-500 mr-2" /> Address Information
                              </h3>
                              <p className="text-sm text-gray-600">{customer.address}</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                              <h3 className="flex items-center text-sm font-medium text-gray-800 mb-3">
                                <FaHistory className="text-indigo-500 mr-2" /> Order History
                              </h3>
                              <p className="text-sm text-gray-600 mb-1">Total Orders: <span className="font-medium">{customer.totalOrders}</span></p>
                              <p className="text-sm text-gray-600 mb-1">Total Spent: <span className="font-medium">{formatCurrency(customer.totalSpent)}</span></p>
                              <p className="text-sm text-gray-600">Last Order: <span className="font-medium">{formatDate(customer.lastOrderDate)}</span></p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                              <h3 className="flex items-center text-sm font-medium text-gray-800 mb-3">
                                <FaUser className="text-indigo-500 mr-2" /> Payment Information
                              </h3>
                              <p className="text-sm text-gray-600 mb-1">Preferred Method: <span className="font-medium">{customer.preferredPayment}</span></p>
                              <p className="text-sm text-gray-600">Loyalty Points: <span className="font-medium">{customer.loyaltyPoints}</span></p>
                            </div>
                          </div>
                          
                          <div className="flex mt-4 pt-4 border-t border-indigo-100 justify-end">
                            <button 
                              className="mr-3 px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                              onClick={() => alert(`Sending message to ${customer.name}`)}
                            >
                              Send Message
                            </button>
                            <button 
                              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                              onClick={() => alert(`View full profile for ${customer.name}`)}
                            >
                              View Full Profile
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No customers found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredCustomers.length}</span> of <span className="font-medium">{customers.length}</span> customers
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
    </div>
  );
} 