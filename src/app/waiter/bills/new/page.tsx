'use client';

import React, { useState } from 'react';
import { FaArrowLeft, FaReceipt, FaTimes, FaCheck, FaPrint, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';

// Types
interface Table {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  capacity: number;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderSummary {
  id: number;
  tableId: number;
  tableName: string;
  items: OrderItem[];
  customerName: string;
  orderTime: string;
  status: 'active' | 'completed' | 'cancelled';
  total: number;
}

// Sample data
const tables: Table[] = [
  { id: 1, name: 'Table 1', status: 'occupied', capacity: 2 },
  { id: 3, name: 'Table 3', status: 'occupied', capacity: 4 },
  { id: 7, name: 'Table 7', status: 'occupied', capacity: 6 },
  { id: 12, name: 'Table 12', status: 'occupied', capacity: 8 },
];

const activeOrders: OrderSummary[] = [
  {
    id: 1042,
    tableId: 1,
    tableName: 'Table 1',
    items: [
      { id: 1, name: 'Butter Chicken', price: 350, quantity: 1 },
      { id: 2, name: 'Naan', price: 50, quantity: 2 },
      { id: 3, name: 'Jeera Rice', price: 180, quantity: 1 }
    ],
    customerName: 'Rahul Sharma',
    orderTime: '2023-04-02T12:35:00',
    status: 'active',
    total: 630
  },
  {
    id: 1041,
    tableId: 3,
    tableName: 'Table 3',
    items: [
      { id: 4, name: 'Paneer Tikka', price: 280, quantity: 1 },
      { id: 5, name: 'Veg Pulao', price: 220, quantity: 1 },
      { id: 6, name: 'Gulab Jamun', price: 120, quantity: 2 }
    ],
    customerName: 'Priya Patel',
    orderTime: '2023-04-02T12:15:00',
    status: 'active',
    total: 740
  },
  {
    id: 1040,
    tableId: 7,
    tableName: 'Table 7',
    items: [
      { id: 7, name: 'Masala Dosa', price: 180, quantity: 2 },
      { id: 8, name: 'Filter Coffee', price: 80, quantity: 2 },
    ],
    customerName: 'Arun Singh',
    orderTime: '2023-04-02T12:05:00',
    status: 'active',
    total: 520
  },
  {
    id: 1039,
    tableId: 12,
    tableName: 'Table 12',
    items: [
      { id: 9, name: 'Chicken Biryani', price: 300, quantity: 3 },
      { id: 10, name: 'Raita', price: 60, quantity: 1 },
      { id: 11, name: 'Cold Drink', price: 60, quantity: 3 }
    ],
    customerName: 'Family Reservation',
    orderTime: '2023-04-02T11:45:00',
    status: 'active',
    total: 1080
  }
];

// Component
export default function ProcessPaymentPage() {
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  
  // Calculate final amount
  const calculateFinalAmount = () => {
    if (!selectedOrder) return 0;
    
    const subtotal = selectedOrder.total;
    const totalWithTip = subtotal + tipAmount;
    return totalWithTip - discountAmount;
  };
  
  // Handle payment processing
  const processPayment = () => {
    if (!selectedOrder) return;
    
    // Here you would normally send payment info to your backend
    const paymentInfo = {
      orderId: selectedOrder.id,
      tableId: selectedOrder.tableId,
      subtotal: selectedOrder.total,
      tip: tipAmount,
      discount: discountAmount,
      total: calculateFinalAmount(),
      paymentMethod,
      customerName: selectedOrder.customerName,
      customerEmail,
      customerPhone,
      timestamp: new Date()
    };
    
    console.log('Payment processed:', paymentInfo);
    setShowReceipt(true);
  };
  
  // Calculate change (for cash payments)
  const [cashReceived, setCashReceived] = useState<number>(0);
  const calculateChange = () => {
    if (paymentMethod !== 'cash') return 0;
    const finalAmount = calculateFinalAmount();
    return cashReceived > finalAmount ? cashReceived - finalAmount : 0;
  };
  
  // Reset state after printing receipt
  const finishPayment = () => {
    setSelectedOrder(null);
    setPaymentMethod('cash');
    setTipAmount(0);
    setDiscountAmount(0);
    setShowReceipt(false);
    setCashReceived(0);
    setCustomerEmail('');
    setCustomerPhone('');
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link href="/waiter/bills" className="mr-4 text-gray-600 hover:text-gray-800">
          <FaArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Process Payment</h1>
      </div>
      
      {showReceipt ? (
        // Receipt View
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payment Receipt</h2>
            <button 
              onClick={() => setShowReceipt(false)}
              className="text-white hover:text-gray-200"
            >
              <FaTimes size={18} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Restaurant Name</h3>
              <p className="text-sm text-gray-500">123 Main Street, City</p>
              <p className="text-sm text-gray-500">Tel: 123-456-7890</p>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Order #:</span>
                <span>{selectedOrder?.id}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Table:</span>
                <span>{selectedOrder?.tableName}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="space-y-2 py-2">
              <h4 className="font-medium text-gray-700">Items</h4>
              {selectedOrder?.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity} x {item.name}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{selectedOrder?.total}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tip</span>
                  <span>₹{tipAmount}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{calculateFinalAmount()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Payment Method</span>
                <span className="capitalize">{paymentMethod}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
              <p>Thank you for dining with us!</p>
              <p>Please visit again soon.</p>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex gap-2 justify-center">
            <button 
              onClick={finishPayment}
              className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center hover:bg-green-700"
            >
              <FaCheck className="mr-2" />
              Done
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md flex items-center hover:bg-gray-700">
              <FaPrint className="mr-2" />
              Print
            </button>
            {customerPhone && (
              <button className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600">
                <FaWhatsapp className="mr-2" />
                Send
              </button>
            )}
            {customerEmail && (
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center hover:bg-blue-600">
                <FaEnvelope className="mr-2" />
                Email
              </button>
            )}
          </div>
        </div>
      ) : (
        // Payment Form
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tables & Orders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Table</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => {
                      setSelectedOrder(null);
                      // Find orders for this table
                      const tableOrders = activeOrders.filter(order => order.tableId === table.id);
                      if (tableOrders.length === 1) {
                        setSelectedOrder(tableOrders[0]);
                      }
                    }}
                    className={`p-3 rounded-lg border flex flex-col items-center ${
                      selectedOrder?.tableId === table.id 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <FaReceipt className={`mb-1 ${selectedOrder?.tableId === table.id ? 'text-indigo-500' : 'text-gray-500'}`} />
                    <span className="font-medium">{table.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {selectedOrder && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h2>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Order #</span>
                    <span>{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Customer</span>
                    <span>{selectedOrder.customerName || 'Anonymous'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Time</span>
                    <span>{new Date(selectedOrder.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 py-4">
                  <h3 className="font-medium text-gray-700 mb-2">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <span>{item.quantity} × {item.name}</span>
                        </div>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 py-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Payment Processing */}
          <div className={`bg-white rounded-lg shadow-md p-4 ${!selectedOrder ? 'opacity-50' : ''}`}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment</h2>
            
            {!selectedOrder ? (
              <div className="text-center text-gray-500 py-8">
                <FaReceipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a table to process payment</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Payment Method */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Payment Method</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3 border rounded-md flex flex-col items-center ${
                        paymentMethod === 'cash' 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium">Cash</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 border rounded-md flex flex-col items-center ${
                        paymentMethod === 'card' 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium">Card</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 border rounded-md flex flex-col items-center ${
                        paymentMethod === 'upi' 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium">UPI</span>
                    </button>
                  </div>
                </div>
                
                {/* Tip */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Add Tip</h3>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <button
                      onClick={() => setTipAmount(Math.round(selectedOrder.total * 0.05))}
                      className={`p-2 border rounded-md ${
                        tipAmount === Math.round(selectedOrder.total * 0.05) 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                          : 'border-gray-200'
                      }`}
                    >
                      5%
                    </button>
                    <button
                      onClick={() => setTipAmount(Math.round(selectedOrder.total * 0.1))}
                      className={`p-2 border rounded-md ${
                        tipAmount === Math.round(selectedOrder.total * 0.1) 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                          : 'border-gray-200'
                      }`}
                    >
                      10%
                    </button>
                    <button
                      onClick={() => setTipAmount(Math.round(selectedOrder.total * 0.15))}
                      className={`p-2 border rounded-md ${
                        tipAmount === Math.round(selectedOrder.total * 0.15) 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                          : 'border-gray-200'
                      }`}
                    >
                      15%
                    </button>
                    <button
                      onClick={() => setTipAmount(0)}
                      className={`p-2 border rounded-md ${
                        tipAmount === 0 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                          : 'border-gray-200'
                      }`}
                    >
                      None
                    </button>
                  </div>
                  <div className="flex items-center">
                    <label className="mr-2 text-sm">Custom:</label>
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                      <input
                        type="number"
                        value={tipAmount || ''}
                        onChange={(e) => setTipAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Discount */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-700">Discount</h3>
                    <button
                      onClick={() => setDiscountAmount(0)}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                    <input
                      type="number"
                      value={discountAmount || ''}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value <= selectedOrder.total) {
                          setDiscountAmount(value);
                        }
                      }}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {/* Cash received (only for cash payments) */}
                {paymentMethod === 'cash' && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Cash Received</h3>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <button
                        onClick={() => setCashReceived(500)}
                        className="p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        ₹500
                      </button>
                      <button
                        onClick={() => setCashReceived(1000)}
                        className="p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        ₹1000
                      </button>
                      <button
                        onClick={() => setCashReceived(2000)}
                        className="p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        ₹2000
                      </button>
                      <button
                        onClick={() => setCashReceived(calculateFinalAmount())}
                        className="p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        Exact
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                      <input
                        type="number"
                        value={cashReceived || ''}
                        onChange={(e) => setCashReceived(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                      />
                    </div>
                    {cashReceived > 0 && (
                      <div className="flex justify-between mt-2 font-medium">
                        <span>Change:</span>
                        <span>₹{calculateChange()}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Customer contact (optional) */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Customer Contact (Optional)</h3>
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="Email for receipt"
                    />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="Phone for WhatsApp receipt"
                    />
                  </div>
                </div>
                
                {/* Total and process button */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Subtotal</span>
                    <span>₹{selectedOrder.total}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Tip</span>
                      <span>₹{tipAmount}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Discount</span>
                      <span className="text-red-600">-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-4 text-lg font-bold">
                    <span>Total</span>
                    <span>₹{calculateFinalAmount()}</span>
                  </div>
                  
                  <button
                    onClick={processPayment}
                    disabled={paymentMethod === 'cash' && cashReceived < calculateFinalAmount()}
                    className="w-full py-3 bg-indigo-600 text-white rounded-md font-medium flex items-center justify-center 
                      disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700"
                  >
                    <FaCheck className="mr-2" />
                    Process Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 