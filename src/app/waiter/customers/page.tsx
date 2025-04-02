'use client';

import React, { useState } from 'react';
import { 
  FaUser, 
  FaUserPlus, 
  FaSearch, 
  FaEdit, 
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaPlus,
  FaRegStar,
  FaStar
} from 'react-icons/fa';

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
    ]
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
    ]
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
    ]
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
    ]
  }
];

export default function WaiterCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewCustomerId, setViewCustomerId] = useState<number | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (!viewCustomerId || !newNote.trim()) return;
    
    setCustomers(customers.map(customer => 
      customer.id === viewCustomerId 
        ? { 
            ...customer, 
            notes: [
              ...(customer.notes || []),
              {
                id: Date.now(),
                text: newNote.trim(),
                date: new Date().toISOString().split('T')[0]
              }
            ]
          } 
        : customer
    ));
    
    setIsAddingNote(false);
    setNewNote('');
  };

  const handleToggleVip = (customerId: number) => {
    setCustomers(customers.map(customer => 
      customer.id === customerId 
        ? { 
            ...customer, 
            vip: !customer.vip
          } 
        : customer
    ));
  };

  const searchedCustomers = searchQuery 
    ? customers.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (customer.phone && customer.phone.includes(searchQuery))
      )
    : customers;

  const viewingCustomer = viewCustomerId !== null 
    ? customers.find(customer => customer.id === viewCustomerId) 
    : null;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
          <p className="text-gray-600">Track and manage customer information</p>
        </div>
        <button 
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaUserPlus className="mr-2" />
          Add New Customer
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search customers by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customers list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {searchedCustomers.length > 0 ? (
            searchedCustomers.map((customer) => (
              <li key={customer.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => setViewCustomerId(customer.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <FaUser className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="font-medium text-indigo-600">
                            {customer.name}
                          </div>
                          {customer.vip && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {customer.email && (
                            <span className="flex items-center">
                              <FaEnvelope className="mr-1 h-3 w-3" />
                              {customer.email}
                            </span>
                          )}
                        </div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <FaPhone className="mr-1 h-3 w-3" />
                              {customer.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.visits} {customer.visits === 1 ? 'visit' : 'visits'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ₹{customer.totalSpent.toFixed(2)} spent
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        <span className="flex items-center">
                          <FaCalendarAlt className="mr-1 h-3 w-3" />
                          Customer since {new Date(customer.joinDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              No customers match your search criteria
            </li>
          )}
        </ul>
      </div>

      {/* Customer details modal */}
      {viewingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FaUser className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-xl font-bold text-gray-800">{viewingCustomer.name}</h3>
                  <p className="text-sm text-gray-600">Customer #{viewingCustomer.id}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleToggleVip(viewingCustomer.id)}
                  className={`p-2 rounded-full ${
                    viewingCustomer.vip 
                      ? 'bg-yellow-100 text-yellow-600' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  title={viewingCustomer.vip ? "Remove VIP status" : "Mark as VIP"}
                >
                  {viewingCustomer.vip ? <FaStar className="h-5 w-5" /> : <FaRegStar className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => {/* Edit customer logic */}}
                  className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                  title="Edit customer"
                >
                  <FaEdit className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    {viewingCustomer.email && (
                      <div className="flex items-center">
                        <FaEnvelope className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{viewingCustomer.email}</span>
                      </div>
                    )}
                    {viewingCustomer.phone && (
                      <div className="flex items-center">
                        <FaPhone className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{viewingCustomer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <FaCalendarAlt className="h-4 w-4 text-gray-400 mr-2" />
                      <span>Customer since {new Date(viewingCustomer.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Customer Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total visits:</span>
                      <span className="font-medium">{viewingCustomer.visits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total spent:</span>
                      <span className="font-medium">₹{viewingCustomer.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average per visit:</span>
                      <span className="font-medium">
                        ₹{(viewingCustomer.totalSpent / viewingCustomer.visits).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-700 mb-3">Preferences & Allergies</h4>
                  <div className="space-y-3">
                    {viewingCustomer.favoriteItems && viewingCustomer.favoriteItems.length > 0 && (
                      <div>
                        <span className="text-gray-600 block mb-1">Favorite items:</span>
                        <div className="flex flex-wrap gap-2">
                          {viewingCustomer.favoriteItems.map((item, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {viewingCustomer.allergies && viewingCustomer.allergies.length > 0 && (
                      <div>
                        <span className="text-gray-600 block mb-1">Allergies:</span>
                        <div className="flex flex-wrap gap-2">
                          {viewingCustomer.allergies.map((allergy, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Notes</h4>
                    {!isAddingNote && (
                      <button
                        onClick={() => setIsAddingNote(true)}
                        className="text-sm flex items-center text-indigo-600 hover:text-indigo-800"
                      >
                        <FaPlus className="h-3 w-3 mr-1" />
                        Add Note
                      </button>
                    )}
                  </div>
                  
                  {isAddingNote && (
                    <div className="mb-3 border border-gray-300 rounded-lg p-3">
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows={3}
                        placeholder="Add a note about this customer..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      ></textarea>
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          onClick={() => {
                            setIsAddingNote(false);
                            setNewNote('');
                          }}
                          className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddNote}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          disabled={!newNote.trim()}
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {viewingCustomer.notes && viewingCustomer.notes.length > 0 ? (
                      viewingCustomer.notes.map((note) => (
                        <div key={note.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="text-sm text-gray-800">{note.text}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(note.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : !isAddingNote && (
                      <div className="text-sm text-gray-500 italic">No notes yet</div>
                    )}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-700 mb-3">Recent Visits</h4>
                  {viewingCustomer.visitHistory && viewingCustomer.visitHistory.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Table
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Guests
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {viewingCustomer.visitHistory.map((visit) => (
                            <tr key={visit.id}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                {new Date(visit.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                {visit.tableName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                {visit.guests}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₹{visit.totalSpent.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">No visit history available</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setViewCustomerId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 