'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft, 
  FaCheck, 
  FaExclamationTriangle, 
  FaFireAlt,
  FaHistory,
  FaUtensils,
  FaCheckCircle,
  FaPrint,
  FaClock
} from 'react-icons/fa';

// Types
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  special: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  estimatedTime?: number;
}

interface OrderEvent {
  time: string;
  action: string;
  user: string;
}

interface Order {
  id: number;
  table: string;
  items: OrderItem[];
  timeReceived: string;
  priority: 'high' | 'normal';
  status: 'pending' | 'cooking' | 'ready' | 'delivered';
  estimatedTime?: number;
  startedAt?: string;
  completedAt?: string;
  waiter: string;
  events: OrderEvent[];
  notes?: string;
}

// Sample order details
const orderDetails: Order = {
  id: 1042,
  table: 'Table 7',
  items: [
    { 
      id: 1, 
      name: 'Butter Chicken', 
      quantity: 1, 
      special: 'Extra spicy', 
      status: 'in-progress', 
      assignedTo: 'Chef Sharma',
      estimatedTime: 12
    },
    { 
      id: 2, 
      name: 'Garlic Naan', 
      quantity: 2, 
      special: '', 
      status: 'completed', 
      assignedTo: 'Chef Patel',
      estimatedTime: 5
    },
    { 
      id: 3, 
      name: 'Veg Biryani', 
      quantity: 1, 
      special: 'No onions', 
      status: 'pending'
    }
  ],
  timeReceived: '11:45 AM',
  priority: 'high',
  status: 'cooking',
  estimatedTime: 15,
  startedAt: '12:00 PM',
  waiter: 'Raj',
  events: [
    { time: '11:45 AM', action: 'Order received from POS', user: 'System' },
    { time: '11:50 AM', action: 'Order sent to kitchen', user: 'Raj (Waiter)' },
    { time: '12:00 PM', action: 'Started cooking', user: 'Sharma (Chef)' },
    { time: '12:05 PM', action: 'Garlic Naan completed', user: 'Patel (Chef)' }
  ],
  notes: 'Customer celebrating anniversary, extra care for presentation.'
};

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const [order] = useState<Order>(orderDetails);
  
  // In a real app, you would fetch the order details using the orderId
  const orderId = params.orderId;
  
  // Function to go back to orders list
  const goBack = () => {
    router.push('/chef/orders');
  };
  
  // Calculate elapsed time if order is cooking
  let elapsedMinutes = 0;
  if (order.status === 'cooking' && order.startedAt) {
    const startTime = new Date();
    startTime.setHours(
      parseInt(order.startedAt.split(':')[0]),
      parseInt(order.startedAt.split(':')[1].split(' ')[0]),
      0
    );
    elapsedMinutes = Math.floor((new Date().getTime() - startTime.getTime()) / 60000);
  }
  
  // Function to get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch(status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cooking':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending':
        return <FaClock className="text-amber-500" />;
      case 'cooking':
      case 'in-progress':
        return <FaFireAlt className="text-orange-500" />;
      case 'ready':
      case 'completed':
        return <FaCheck className="text-green-500" />;
      case 'delivered':
        return <FaCheck className="text-gray-500" />;
      default:
        return null;
    }
  };
  
  // Functions for action buttons based on order status
  const startCooking = () => {
    router.push(`/chef/orders/start?orderId=${orderId}`);
  };
  
  const completeOrder = () => {
    router.push(`/chef/orders/complete?orderId=${orderId}`);
  };
  
  const printOrder = () => {
    window.print();
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={goBack}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <FaArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order #{order.id}</h1>
          <p className="text-gray-600">Detailed order information</p>
        </div>
      </div>
      
      {/* Order Summary Card */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <div>
            <div className="flex items-center mb-2">
              <span className={`h-3 w-3 rounded-full mr-2 ${
                order.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'
              }`}></span>
              <span className="font-medium text-gray-700 mr-2">{order.table}</span>
              <span className={`px-2 py-1 rounded-full text-xs flex items-center ${getStatusBadgeStyle(order.status)}`}>
                <span className="mr-1">{getStatusIcon(order.status)}</span>
                <span className="capitalize">{order.status}</span>
              </span>
              {order.priority === 'high' && (
                <span className="ml-2 bg-red-100 px-2 py-1 rounded text-xs text-red-700 font-medium flex items-center">
                  <FaExclamationTriangle className="mr-1" />
                  High Priority
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mb-2">
              Waiter: {order.waiter}
            </div>
            <div className="text-sm text-gray-500">
              Received: {order.timeReceived}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            {order.status === 'cooking' && (
              <div className="text-sm text-orange-600 font-medium flex items-center">
                <FaFireAlt className="mr-1" />
                <span>
                  Cooking: {elapsedMinutes} min elapsed 
                  {order.estimatedTime && ` / ${order.estimatedTime} min estimated`}
                </span>
              </div>
            )}
            {order.startedAt && (
              <div className="text-sm text-gray-500">
                Started: {order.startedAt}
              </div>
            )}
            {order.completedAt && (
              <div className="text-sm text-gray-500">
                Completed: {order.completedAt}
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {order.status === 'pending' && (
            <button 
              onClick={startCooking}
              className="px-4 py-2 bg-amber-500 text-white rounded-md font-medium flex items-center hover:bg-amber-600"
            >
              <FaFireAlt className="mr-2" />
              Start Cooking
            </button>
          )}
          
          {order.status === 'cooking' && (
            <button 
              onClick={completeOrder}
              className="px-4 py-2 bg-green-500 text-white rounded-md font-medium flex items-center hover:bg-green-600"
            >
              <FaCheckCircle className="mr-2" />
              Complete Order
            </button>
          )}
          
          <button 
            onClick={printOrder}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium flex items-center hover:bg-gray-300"
          >
            <FaPrint className="mr-2" />
            Print
          </button>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Order Items</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <div key={item.id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                <div className="flex items-center mb-2 md:mb-0">
                  <span className="font-medium text-gray-800">{item.quantity}× {item.name}</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs flex items-center ${getStatusBadgeStyle(item.status)}`}>
                    <span className="mr-1">{getStatusIcon(item.status)}</span>
                    <span className="capitalize">{item.status}</span>
                  </span>
                </div>
                
                {item.assignedTo && (
                  <div className="text-sm text-gray-500">
                    Chef: {item.assignedTo}
                    {item.estimatedTime && ` (${item.estimatedTime} min)`}
                  </div>
                )}
              </div>
              
              {item.special && (
                <div className="mt-1 text-sm text-red-600">
                  Special request: {item.special}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Order activity timeline */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center">
          <FaHistory className="text-gray-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">Order Timeline</h2>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            {order.events.map((event, index) => (
              <div key={index} className="flex">
                <div className="mr-3 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <FaUtensils className="text-indigo-500" />
                  </div>
                  {index < order.events.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{event.action}</div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{event.time}</span>
                    <span className="mx-1">•</span>
                    <span>{event.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Notes</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-700">{order.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
} 