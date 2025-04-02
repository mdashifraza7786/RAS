'use client';

import React, { useState } from 'react';
import { 
  FaReceipt, 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaClock, 
  FaCheck,
  FaSearch,
  FaPrint,
  FaUtensils
} from 'react-icons/fa';

interface BillItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Bill {
  id: number;
  tableId: number;
  tableName: string;
  items: BillItem[];
  status: 'pending' | 'paid' | 'cancelled';
  time: string;
  subtotal: number;
  tax: number;
  total: number;
  customerCount: number;
  paymentMethod?: 'cash' | 'credit_card' | 'debit_card';
}

// Sample data
const initialBills: Bill[] = [
  {
    id: 5042,
    tableId: 2,
    tableName: 'Table 2',
    status: 'pending',
    time: '12:45 PM',
    subtotal: 42.50,
    tax: 4.25,
    total: 46.75,
    customerCount: 2,
    items: [
      { id: 1, name: 'Burger', quantity: 2, price: 15.50 },
      { id: 2, name: 'Onion Rings', quantity: 1, price: 5.50 },
      { id: 3, name: 'Ice Cream', quantity: 1, price: 6.00 },
    ]
  },
  {
    id: 5041,
    tableId: 8,
    tableName: 'Table 8',
    status: 'pending',
    time: '12:30 PM',
    subtotal: 87.50,
    tax: 8.75,
    total: 96.25,
    customerCount: 5,
    items: [
      { id: 5, name: 'Steak', quantity: 3, price: 28.00 },
      { id: 6, name: 'Caesar Salad', quantity: 2, price: 9.50 },
      { id: 7, name: 'Cheesecake', quantity: 1, price: 8.00 },
      { id: 8, name: 'Wine', quantity: 1, price: 12.00 },
    ]
  },
  {
    id: 5040,
    tableId: 6,
    tableName: 'Table 6',
    status: 'paid',
    time: '12:15 PM',
    subtotal: 64.00,
    tax: 6.40,
    total: 70.40,
    customerCount: 3,
    paymentMethod: 'credit_card',
    items: [
      { id: 9, name: 'Pizza', quantity: 1, price: 18.00 },
      { id: 10, name: 'Pasta', quantity: 2, price: 16.00 },
      { id: 11, name: 'Bruschetta', quantity: 1, price: 8.00 },
      { id: 12, name: 'Tiramisu', quantity: 1, price: 6.00 },
    ]
  },
  {
    id: 5039,
    tableId: 3,
    tableName: 'Table 3',
    status: 'paid',
    time: '11:45 AM',
    subtotal: 78.50,
    tax: 7.85,
    total: 86.35,
    customerCount: 4,
    paymentMethod: 'cash',
    items: [
      { id: 13, name: 'Grilled Salmon', quantity: 2, price: 22.50 },
      { id: 14, name: 'Caesar Salad', quantity: 1, price: 9.50 },
      { id: 15, name: 'Garlic Bread', quantity: 1, price: 4.50 },
      { id: 16, name: 'Cheesecake', quantity: 2, price: 8.50 },
      { id: 17, name: 'Soda', quantity: 3, price: 2.50 },
    ]
  }
];

const statusColors = {
  'pending': 'bg-amber-100 text-amber-600',
  'paid': 'bg-green-100 text-green-600',
  'cancelled': 'bg-red-100 text-red-600'
};

const statusIcons = {
  'pending': <FaClock className="h-4 w-4" />,
  'paid': <FaCheck className="h-4 w-4" />,
  'cancelled': <FaReceipt className="h-4 w-4 line-through" />
};

const paymentMethodIcons = {
  'cash': <FaMoneyBillWave className="h-4 w-4 text-green-500" />,
  'credit_card': <FaCreditCard className="h-4 w-4 text-blue-500" />,
  'debit_card': <FaCreditCard className="h-4 w-4 text-indigo-500" />
};

const paymentMethodLabels = {
  'cash': 'Cash',
  'credit_card': 'Credit Card',
  'debit_card': 'Debit Card'
};

export default function WaiterBillsPage() {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processPaymentId, setProcessPaymentId] = useState<number | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    method: 'credit_card' as 'cash' | 'credit_card' | 'debit_card',
    amount: 0,
    tip: 0
  });

  const handleProcessPayment = () => {
    if (processPaymentId === null) return;
    
    setBills(bills.map(bill => 
      bill.id === processPaymentId 
        ? { 
            ...bill, 
            status: 'paid',
            paymentMethod: paymentDetails.method,
            total: bill.total + paymentDetails.tip
          } 
        : bill
    ));
    
    setProcessPaymentId(null);
    setPaymentDetails({
      method: 'credit_card',
      amount: 0,
      tip: 0
    });
  };

  const filteredBills = filter === 'all' 
    ? bills 
    : bills.filter(bill => bill.status === filter);

  const searchedBills = searchQuery 
    ? filteredBills.filter(bill => 
        bill.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.id.toString().includes(searchQuery) ||
        bill.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : filteredBills;

  const viewingBill = processPaymentId !== null 
    ? bills.find(bill => bill.id === processPaymentId) 
    : null;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bills Management</h1>
          <p className="text-gray-600">Process payments and manage bills</p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search bills by table or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-600'} border border-gray-300`}
          >
            All Bills
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg flex items-center ${filter === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-white text-gray-600'} border border-gray-300`}
          >
            <FaClock className="mr-2 text-amber-500 text-xs" />
            Pending
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg flex items-center ${filter === 'paid' ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600'} border border-gray-300`}
          >
            <FaCheck className="mr-2 text-green-500 text-xs" />
            Paid
          </button>
        </div>
      </div>

      {/* Bills list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {searchedBills.length > 0 ? (
            searchedBills.map((bill) => (
              <li key={bill.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => bill.status === 'pending' && setProcessPaymentId(bill.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FaUtensils className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-indigo-600 truncate">
                            Bill #{bill.id}
                          </div>
                          <div className={`ml-2 px-2 py-1 text-xs rounded-full flex items-center ${statusColors[bill.status]}`}>
                            <span className="mr-1">{statusIcons[bill.status]}</span>
                            <span className="capitalize">{bill.status}</span>
                          </div>
                          {bill.paymentMethod && (
                            <div className="ml-2 px-2 py-1 text-xs rounded-full flex items-center bg-gray-100 text-gray-600">
                              <span className="mr-1">{paymentMethodIcons[bill.paymentMethod]}</span>
                              <span>{paymentMethodLabels[bill.paymentMethod]}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">{bill.tableName}</span> · {bill.customerCount} {bill.customerCount === 1 ? 'guest' : 'guests'} · {bill.time}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{bill.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {bill.items.length} {bill.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                  </div>
                  
                  {bill.status === 'pending' && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProcessPaymentId(bill.id);
                          setPaymentDetails({...paymentDetails, amount: bill.total});
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-green-600 text-sm leading-5 font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none"
                      >
                        <FaCreditCard className="mr-2 h-4 w-4" />
                        Process Payment
                      </button>
                    </div>
                  )}
                  
                  {bill.status === 'paid' && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <FaPrint className="mr-2 h-4 w-4" />
                        Print Receipt
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              No bills match your search criteria
            </li>
          )}
        </ul>
      </div>

      {/* Process payment modal */}
      {processPaymentId !== null && viewingBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg overflow-hidden max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Process Payment</h3>
              <p className="text-sm text-gray-600">{viewingBill.tableName} · Bill #{viewingBill.id}</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Bill Summary</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{viewingBill.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">₹{viewingBill.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{viewingBill.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentDetails({...paymentDetails, method: 'credit_card'})}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                      paymentDetails.method === 'credit_card' 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaCreditCard className="h-6 w-6 mb-1" />
                    <span className="text-sm">Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentDetails({...paymentDetails, method: 'debit_card'})}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                      paymentDetails.method === 'debit_card' 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaCreditCard className="h-6 w-6 mb-1" />
                    <span className="text-sm">Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentDetails({...paymentDetails, method: 'cash'})}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                      paymentDetails.method === 'cash' 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaMoneyBillWave className="h-6 w-6 mb-1" />
                    <span className="text-sm">Cash</span>
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Tip Amount</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[10, 15, 20, 25].map(percent => {
                    const tipAmount = (viewingBill.subtotal * (percent / 100));
                    return (
                      <button
                        key={percent}
                        type="button"
                        onClick={() => setPaymentDetails({...paymentDetails, tip: tipAmount})}
                        className={`py-2 px-3 rounded-lg border ${
                          Math.abs(paymentDetails.tip - tipAmount) < 0.01
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-sm font-bold">{percent}%</div>
                        <div className="text-xs">₹{tipAmount.toFixed(2)}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Custom tip amount"
                    value={paymentDetails.tip || ''}
                    onChange={(e) => setPaymentDetails({...paymentDetails, tip: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-3 mb-6">
                <div className="flex justify-between font-bold text-indigo-700">
                  <span>Final Total</span>
                  <span>₹{(viewingBill.total + paymentDetails.tip).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setProcessPaymentId(null);
                  setPaymentDetails({
                    method: 'credit_card',
                    amount: 0,
                    tip: 0
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <FaCheck className="mr-2" />
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 