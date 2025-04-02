'use client';

import React, { useState } from 'react';
import { 
  FaClipboardList, 
  FaHistory, 
  FaUtensils, 
  FaUsers, 
  FaClock,
  FaSearch,
  FaCheck,
  FaBell,
  FaArrowRight
} from 'react-icons/fa';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  status: 'pending' | 'in-progress' | 'ready' | 'served' | 'cancelled';
}

interface Order {
  id: number;
  tableId: number;
  tableName: string;
  items: OrderItem[];
  status: 'pending' | 'in-progress' | 'ready' | 'served' | 'cancelled';
  time: string;
  total: number;
  customerCount: number;
}

// Sample data
const initialOrders: Order[] = [
  {
    id: 1042,
    tableId: 3,
    tableName: 'Table 3',
    status: 'ready',
    time: '12:30 PM',
    total: 78.50,
    customerCount: 4,
    items: [
      { id: 1, name: 'Grilled Salmon', quantity: 2, price: 22.50, status: 'ready' },
      { id: 2, name: 'Caesar Salad', quantity: 1, price: 9.50, status: 'ready' },
      { id: 3, name: 'Garlic Bread', quantity: 1, price: 4.50, status: 'ready' },
      { id: 4, name: 'Cheesecake', quantity: 2, price: 8.50, status: 'ready' },
    ]
  },
  {
    id: 1041,
    tableId: 6,
    tableName: 'Table 6',
    status: 'in-progress',
    time: '12:15 PM',
    total: 64.00,
    customerCount: 3,
    items: [
      { id: 5, name: 'Steak', quantity: 1, price: 28.00, status: 'in-progress' },
      { id: 6, name: 'Pasta Carbonara', quantity: 1, price: 16.00, status: 'ready' },
      { id: 7, name: 'French Fries', quantity: 1, price: 6.00, status: 'ready' },
      { id: 8, name: 'Chocolate Mousse', quantity: 2, price: 7.00, status: 'pending' },
    ]
  },
  {
    id: 1040,
    tableId: 2,
    tableName: 'Table 2',
    status: 'served',
    time: '11:45 AM',
    total: 42.50,
    customerCount: 2,
    items: [
      { id: 9, name: 'Burger', quantity: 2, price: 15.50, status: 'served' },
      { id: 10, name: 'Onion Rings', quantity: 1, price: 5.50, status: 'served' },
      { id: 11, name: 'Ice Cream', quantity: 1, price: 6.00, status: 'served' },
    ]
  },
  {
    id: 1039,
    tableId: 9,
    tableName: 'Table 9',
    status: 'pending',
    time: '12:45 PM',
    total: 34.00,
    customerCount: 2,
    items: [
      { id: 12, name: 'Pizza Margherita', quantity: 1, price: 14.00, status: 'pending' },
      { id: 13, name: 'Bruschetta', quantity: 1, price: 8.00, status: 'pending' },
      { id: 14, name: 'Tiramisu', quantity: 1, price: 7.00, status: 'pending' },
      { id: 15, name: 'Soda', quantity: 2, price: 2.50, status: 'pending' },
    ]
  }
];

const statusColors = {
  'pending': 'bg-blue-100 text-blue-600',
  'in-progress': 'bg-amber-100 text-amber-600',
  'ready': 'bg-green-100 text-green-600',
  'served': 'bg-indigo-100 text-indigo-600',
  'cancelled': 'bg-red-100 text-red-600'
};

const statusIcons = {
  'pending': <FaClipboardList className="h-4 w-4" />,
  'in-progress': <FaClock className="h-4 w-4" />,
  'ready': <FaBell className="h-4 w-4" />,
  'served': <FaCheck className="h-4 w-4" />,
  'cancelled': <FaHistory className="h-4 w-4" />
};

export default function WaiterOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<string>('all');
  const [viewOrderId, setViewOrderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpdateOrderStatus = (orderId: number, status: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status,
            items: order.items.map(item => ({
              ...item,
              status: status === 'served' ? 'served' : item.status
            }))
          } 
        : order
    ));
  };

  const handleUpdateItemStatus = (orderId: number, itemId: number, status: OrderItem['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            items: order.items.map(item => 
              item.id === itemId 
                ? { ...item, status } 
                : item
            ),
            // If all items are ready, mark order as ready
            status: status === 'ready' && 
              order.items.every(item => item.id === itemId ? true : item.status === 'ready') 
              ? 'ready' 
              : order.status
          } 
        : order
    ));
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const searchedOrders = searchQuery 
    ? filteredOrders.filter(order => 
        order.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toString().includes(searchQuery) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : filteredOrders;

  const viewingOrder = viewOrderId !== null 
    ? orders.find(order => order.id === viewOrderId) 
    : null;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
          <p className="text-gray-600">Track and manage customer orders</p>
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
            placeholder="Search orders by table, ID or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-600'} border border-gray-300`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg flex items-center ${filter === 'pending' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-600'} border border-gray-300`}
          >
            <FaClipboardList className="mr-2 text-blue-500 text-xs" />
            Pending
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg flex items-center ${filter === 'in-progress' ? 'bg-amber-100 text-amber-800' : 'bg-white text-gray-600'} border border-gray-300`}
          >
            <FaClock className="mr-2 text-amber-500 text-xs" />
            In Progress
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-4 py-2 rounded-lg flex items-center ${filter === 'ready' ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600'} border border-gray-300`}
          >
            <FaBell className="mr-2 text-green-500 text-xs" />
            Ready
          </button>
          <button
            onClick={() => setFilter('served')}
            className={`px-4 py-2 rounded-lg flex items-center ${filter === 'served' ? 'bg-indigo-100 text-indigo-800' : 'bg-white text-gray-600'} border border-gray-300`}
          >
            <FaCheck className="mr-2 text-indigo-500 text-xs" />
            Served
          </button>
        </div>
      </div>

      {/* Orders list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {searchedOrders.length > 0 ? (
            searchedOrders.map((order) => (
              <li key={order.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => setViewOrderId(order.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FaUtensils className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-indigo-600 truncate">
                            Order #{order.id}
                          </div>
                          <div className={`ml-2 px-2 py-1 text-xs rounded-full flex items-center ${statusColors[order.status]}`}>
                            <span className="mr-1">{statusIcons[order.status]}</span>
                            <span className="capitalize">{order.status.replace('-', ' ')}</span>
                          </div>
                        </div>
                        <div className="flex items-center mt-1">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">{order.tableName}</span> · {order.customerCount} {order.customerCount === 1 ? 'guest' : 'guests'} · {order.time}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{order.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              No orders match your search criteria
            </li>
          )}
        </ul>
      </div>

      {/* Order details modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Order #{viewingOrder.id} Details</h3>
                <p className="text-sm text-gray-600">{viewingOrder.tableName} · {viewingOrder.time}</p>
              </div>
              <div className={`px-3 py-1 text-sm rounded-full flex items-center ${statusColors[viewingOrder.status]}`}>
                {statusIcons[viewingOrder.status]}
                <span className="ml-1 capitalize">{viewingOrder.status.replace('-', ' ')}</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center mb-4">
                <FaUsers className="text-gray-500 mr-2" />
                <span className="text-gray-700">{viewingOrder.customerCount} {viewingOrder.customerCount === 1 ? 'guest' : 'guests'}</span>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
                <div className="space-y-3">
                  {viewingOrder.items.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{item.name}</span>
                            <span className="ml-2 text-sm text-gray-500">× {item.quantity}</span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-500 mt-1">Note: {item.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center">
                          <div className={`mr-2 px-2 py-1 text-xs rounded-full flex items-center ${statusColors[item.status]}`}>
                            <span className="capitalize">{item.status.replace('-', ' ')}</span>
                          </div>
                          <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {viewingOrder.status !== 'served' && viewingOrder.status !== 'cancelled' && (
                        <div className="mt-2 flex justify-end">
                          {item.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateItemStatus(viewingOrder.id, item.id, 'in-progress')}
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                            >
                              Send to Kitchen
                            </button>
                          )}
                          {item.status === 'ready' && (
                            <button
                              onClick={() => handleUpdateItemStatus(viewingOrder.id, item.id, 'served')}
                              className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                            >
                              Mark as Served
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{viewingOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">₹{(viewingOrder.total * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{(viewingOrder.total * 1.1).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
              <button
                onClick={() => setViewOrderId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <div className="flex space-x-2">
                {viewingOrder.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(viewingOrder.id, 'in-progress')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <FaArrowRight className="mr-2" />
                    Send to Kitchen
                  </button>
                )}
                {viewingOrder.status === 'ready' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(viewingOrder.id, 'served')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <FaCheck className="mr-2" />
                    Mark All Served
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 