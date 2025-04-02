'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft, 
  FaCheck, 
  FaExclamationTriangle, 
  FaFireAlt
} from 'react-icons/fa';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  special: string;
  status?: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  estimatedTime?: number;
}

interface Order {
  id: number;
  table: string;
  items: OrderItem[];
  timeReceived: string;
  priority: 'high' | 'normal';
  status: 'pending' | 'cooking' | 'ready' | 'delivered';
  estimatedTime?: number; // in minutes
}

// Sample order for starting
const order: Order = {
  id: 1042,
  table: 'Table 7',
  items: [
    { id: 1, name: 'Butter Chicken', quantity: 1, special: 'Extra spicy', status: 'pending' },
    { id: 2, name: 'Garlic Naan', quantity: 2, special: '', status: 'pending' },
    { id: 3, name: 'Veg Biryani', quantity: 1, special: 'No onions', status: 'pending' }
  ],
  timeReceived: '11:45 AM',
  priority: 'high',
  status: 'pending'
};

// Sample chef data
const chefs = [
  { id: 1, name: 'Chef Sharma', specialty: 'Main Course' },
  { id: 2, name: 'Chef Patel', specialty: 'Tandoor' },
  { id: 3, name: 'Chef Kumar', specialty: 'Rice & Bread' },
  { id: 4, name: 'You (Head Chef)', specialty: 'All' }
];

export default function StartOrderPage() {
  const router = useRouter();
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [estimatedTime, setEstimatedTime] = useState<number>(15);
  
  // Function to assign chef to item
  const assignChef = (itemId: number, chefId: number) => {
    const chefName = chefs.find(chef => chef.id === chefId)?.name || '';
    
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, assignedTo: chefName, status: 'in-progress' as const }
          : item
      )
    }));
  };
  
  // Function to update item estimated time
  const updateItemTime = (itemId: number, time: number) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, estimatedTime: time }
          : item
      )
    }));
  };
  
  // Function to start cooking the order
  const startCooking = () => {
    // Update order status to cooking
    const updatedOrder = {
      ...currentOrder,
      status: 'cooking' as const,
      estimatedTime: estimatedTime,
      startedAt: new Date().toLocaleTimeString()
    };
    
    console.log('Starting order:', updatedOrder);
    // In a real app, this would make an API call
    
    // Redirect to orders page
    router.push('/chef/orders');
  };
  
  // Function to cancel and go back
  const cancelAndGoBack = () => {
    router.push('/chef/orders');
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={cancelAndGoBack}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <FaArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Start Order #{currentOrder.id}</h1>
          <p className="text-gray-600">Assign chefs and set estimated completion times</p>
        </div>
      </div>
      
      {/* Order details summary */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center mb-2 md:mb-0">
            <span className={`h-3 w-3 rounded-full mr-2 ${
              currentOrder.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'
            }`}></span>
            <span className="font-medium text-gray-700 mr-2">{currentOrder.table}</span>
            {currentOrder.priority === 'high' && (
              <span className="bg-red-100 px-2 py-1 rounded text-xs text-red-700 font-medium flex items-center">
                <FaExclamationTriangle className="mr-1" />
                High Priority
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Received: {currentOrder.timeReceived}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overall Estimated Time (minutes)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              min="1"
              max="60"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 15)}
              className="w-20 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="ml-2 text-gray-500">minutes</span>
          </div>
        </div>
      </div>
      
      {/* Items to prepare */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Items to Prepare</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {currentOrder.items.map((item) => (
            <div key={item.id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                <div className="flex items-center mb-2 md:mb-0">
                  <span className="font-medium text-gray-800">{item.quantity}× {item.name}</span>
                  {item.status === 'in-progress' && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center">
                      <FaFireAlt className="mr-1" size={10} />
                      In Progress
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                      <FaCheck className="mr-1" size={10} />
                      Completed
                    </span>
                  )}
                </div>
                {item.special && (
                  <div className="text-sm text-red-600 md:text-right">
                    {item.special}
                  </div>
                )}
              </div>
              
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to
                  </label>
                  <select
                    value={item.assignedTo ? chefs.find(chef => chef.name === item.assignedTo)?.id : ''}
                    onChange={(e) => assignChef(item.id, parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Chef</option>
                    {chefs.map(chef => (
                      <option key={chef.id} value={chef.id}>
                        {chef.name} ({chef.specialty})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Time (minutes)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={item.estimatedTime || ''}
                      onChange={(e) => updateItemTime(item.id, parseInt(e.target.value) || 0)}
                      className="w-20 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-gray-500">minutes</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-4">
        <button 
          onClick={cancelAndGoBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button 
          onClick={startCooking}
          className="px-4 py-2 bg-orange-500 text-white rounded-md font-medium flex items-center hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          disabled={currentOrder.items.some(item => !item.assignedTo)}
        >
          <FaFireAlt className="mr-2" />
          Start Cooking
        </button>
      </div>
    </div>
  );
} 