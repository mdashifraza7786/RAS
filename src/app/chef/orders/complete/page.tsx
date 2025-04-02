'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft, 
  FaCheck, 
  FaExclamationTriangle, 
  FaFireAlt,
  FaCamera,
  FaCheckCircle
} from 'react-icons/fa';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  special: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  estimatedTime?: number;
}

interface Order {
  id: number;
  table: string;
  items: OrderItem[];
  timeReceived: string;
  priority: 'high' | 'normal';
  status: 'pending' | 'cooking' | 'ready' | 'delivered';
  estimatedTime: number;
  startedAt: string;
}

// Sample active order for completion
const activeOrder: Order = {
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
      status: 'in-progress', 
      assignedTo: 'Chef Kumar',
      estimatedTime: 10
    }
  ],
  timeReceived: '11:45 AM',
  priority: 'high',
  status: 'cooking',
  estimatedTime: 15,
  startedAt: '12:00 PM'
};

export default function CompleteOrderPage() {
  const router = useRouter();
  const [currentOrder, setCurrentOrder] = useState<Order>(activeOrder);
  const [notes, setNotes] = useState<string>('');
  const [photoUploaded, setPhotoUploaded] = useState<boolean>(false);
  
  // Calculate elapsed time
  const startTime = new Date();
  startTime.setHours(
    parseInt(currentOrder.startedAt.split(':')[0]),
    parseInt(currentOrder.startedAt.split(':')[1].split(' ')[0]),
    0
  );
  const elapsedMinutes = Math.floor((new Date().getTime() - startTime.getTime()) / 60000);
  
  // Function to mark item as completed
  const markItemCompleted = (itemId: number) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, status: 'completed' as const }
          : item
      )
    }));
  };
  
  // Check if all items are completed
  const allItemsCompleted = currentOrder.items.every(item => item.status === 'completed');
  
  // Function to complete the order
  const completeOrder = () => {
    // Update order status to ready
    const completedOrder = {
      ...currentOrder,
      status: 'ready' as const,
      completedAt: new Date().toLocaleTimeString(),
      notes: notes,
      hasPhoto: photoUploaded
    };
    
    console.log('Completing order:', completedOrder);
    // In a real app, this would make an API call
    
    // Redirect to orders page
    router.push('/chef/orders');
  };
  
  // Function to cancel and go back
  const cancelAndGoBack = () => {
    router.push('/chef/orders');
  };

  // Function to simulate photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, this would upload the file to a server
      setPhotoUploaded(true);
    }
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
          <h1 className="text-2xl font-bold text-gray-800">Complete Order #{currentOrder.id}</h1>
          <p className="text-gray-600">Mark items as complete and finalize order</p>
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
          <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-500">
            <div className="mr-4">Started: {currentOrder.startedAt}</div>
            <div className="flex items-center">
              <FaFireAlt className="text-orange-500 mr-1" />
              <span>
                {elapsedMinutes} min elapsed 
                {currentOrder.estimatedTime && ` / ${currentOrder.estimatedTime} min estimated`}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Items being prepared */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Order Items</h2>
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
                <div className="flex items-center">
                  <div className="text-sm text-gray-500 mr-4">
                    <span>Chef: {item.assignedTo}</span>
                  </div>
                  {item.status === 'in-progress' && (
                    <button 
                      onClick={() => markItemCompleted(item.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded flex items-center text-sm hover:bg-green-600"
                    >
                      <FaCheck className="mr-1" size={10} />
                      Mark as Complete
                    </button>
                  )}
                </div>
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
      
      {/* Order Completion Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Order Completion</h2>
        
        {/* Photo upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo of Completed Order (optional)
          </label>
          <div className="flex items-center">
            <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center">
              <FaCamera className="mr-2" />
              <span>{photoUploaded ? 'Change Photo' : 'Upload Photo'}</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload}
              />
            </label>
            {photoUploaded && (
              <span className="ml-3 text-green-600 flex items-center">
                <FaCheck className="mr-1" />
                Photo uploaded
              </span>
            )}
          </div>
        </div>
        
        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Add any notes about preparation, presentation, etc."
          ></textarea>
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
          onClick={completeOrder}
          className="px-4 py-2 bg-green-500 text-white rounded-md font-medium flex items-center hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          disabled={!allItemsCompleted}
        >
          <FaCheckCircle className="mr-2" />
          Mark Order as Ready
        </button>
      </div>
      
      {!allItemsCompleted && (
        <div className="mt-4 text-center text-amber-600">
          <FaExclamationTriangle className="inline mr-2" />
          All items must be completed before marking the order as ready
        </div>
      )}
    </div>
  );
} 