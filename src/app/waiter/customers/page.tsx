'use client';

import React, { useState } from 'react';
import { 
  FaUser, 
  FaSearch, 
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaSyncAlt
} from 'react-icons/fa';
import Link from 'next/link';
import { useCustomers, CustomerFilters } from '@/hooks/useCustomers';

interface CustomerNote {
  id: number;
  text: string;
  date: string;
}

interface CustomerVisit {
  id: number;
  date: string;
  tableId: number;
  tableName: string;
  totalSpent: number;
  guests: number;
}

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  joinDate: string;
  visits: number;
  totalSpent: number;
  favoriteItems?: string[];
  allergies?: string[];
  notes?: CustomerNote[];
  visitHistory?: CustomerVisit[];
  vip: boolean;
  lastVisit: string;
}

// Sample data
const initialCustomers: Customer[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    joinDate: '2023-06-15',
    visits: 12,
    totalSpent: 546.80,
    favoriteItems: ['Grilled Salmon', 'Cheesecake'],
    allergies: ['Nuts'],
    vip: true,
    notes: [
      { id: 1, text: 'Prefers window seating', date: '2023-07-10' },
      { id: 2, text: 'Celebrates birthday on June 15', date: '2023-06-15' }
    ],
    visitHistory: [
      { id: 101, date: '2023-09-18', tableId: 5, tableName: 'Table 5', totalSpent: 87.50, guests: 2 },
      { id: 102, date: '2023-08-30', tableId: 3, tableName: 'Table 3', totalSpent: 65.20, guests: 2 },
      { id: 103, date: '2023-08-12', tableId: 8, tableName: 'Table 8', totalSpent: 112.40, guests: 4 }
    ],
    lastVisit: '2023-09-18'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 987-6543',
    joinDate: '2023-04-22',
    visits: 8,
    totalSpent: 324.50,
    favoriteItems: ['Caesar Salad', 'Tiramisu'],
    allergies: ['Seafood'],
    vip: false,
    notes: [
      { id: 3, text: 'Prefers booth seating', date: '2023-05-10' }
    ],
    visitHistory: [
      { id: 104, date: '2023-09-05', tableId: 2, tableName: 'Table 2', totalSpent: 45.60, guests: 1 },
      { id: 105, date: '2023-08-19', tableId: 6, tableName: 'Table 6', totalSpent: 78.30, guests: 2 }
    ],
    lastVisit: '2023-09-05'
  },
  {
    id: 3,
    name: 'Michael Wong',
    email: 'michael.w@example.com',
    phone: '(555) 567-8901',
    joinDate: '2023-07-03',
    visits: 5,
    totalSpent: 178.20,
    favoriteItems: ['Steak', 'Chocolate Mousse'],
    vip: false,
    visitHistory: [
      { id: 106, date: '2023-09-10', tableId: 4, tableName: 'Table 4', totalSpent: 56.70, guests: 2 },
      { id: 107, date: '2023-08-28', tableId: 7, tableName: 'Table 7', totalSpent: 42.30, guests: 1 }
    ],
    lastVisit: '2023-09-10'
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    phone: '(555) 234-5678',
    joinDate: '2023-03-18',
    visits: 15,
    totalSpent: 732.90,
    favoriteItems: ['Pasta Carbonara', 'Cheesecake'],
    allergies: ['Gluten', 'Dairy'],
    vip: true,
    notes: [
      { id: 4, text: 'Always asks about gluten-free options', date: '2023-03-18' },
      { id: 5, text: 'Celebrating anniversary on March 18', date: '2023-09-01' }
    ],
    visitHistory: [
      { id: 108, date: '2023-09-15', tableId: 9, tableName: 'Table 9', totalSpent: 92.80, guests: 2 },
      { id: 109, date: '2023-09-01', tableId: 5, tableName: 'Table 5', totalSpent: 115.40, guests: 4 },
      { id: 110, date: '2023-08-20', tableId: 3, tableName: 'Table 3', totalSpent: 67.30, guests: 2 }
    ],
    lastVisit: '2023-09-15'
  }
];

export default function WaiterCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use customers hook with search filter
  const { 
    customers, 
    loading, 
    error, 
    fetchCustomers
  } = useCustomers({ name: searchTerm });
  
  // Handler for search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers({ name: searchTerm });
  };
  
  // Handler for manual refresh
  const handleRefresh = () => {
    fetchCustomers({ name: searchTerm });
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Search box */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex w-full md:w-96">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Failed to load customers. Please try again.</p>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Customers list */}
      {!loading && !error && (
        <>
          {customers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No customers found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map(customer => (
                <Link 
                  key={customer._id} 
                  href={`/waiter/customers/${customer._id}`}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                      <FaUser />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg">{customer.name}</h3>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <FaPhone className="mr-2 text-gray-400" />
                          {customer.phone}
                        </div>
                        
                        {customer.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaEnvelope className="mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          Last visit: {new Date(customer.lastVisit).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          {customer.visits} {customer.visits === 1 ? 'visit' : 'visits'}
                        </span>
                        <span className="text-sm font-medium">
                          ₹{customer.totalSpent.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 