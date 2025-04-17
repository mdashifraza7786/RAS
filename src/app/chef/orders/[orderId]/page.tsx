'use client';

import React, { useState, useEffect } from 'react';
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
  FaClock,
  FaSpinner
} from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '@/config/constants';
import { toast } from 'react-hot-toast';

// Types
interface OrderItem {
  itemId: string;
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
  id: string;
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

interface PageProps {
  params: {
    orderId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function OrderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log(`Fetching order details for orderId: ${params.orderId}`);
        setIsLoading(true);
        
        const response = await axios.get(`${API_URL}/orders/${params.orderId}`);
        
        if (!response.data || !response.data.order) {
          throw new Error('Invalid response format: missing order data');
        }

        console.log('Order fetch successful:', response.data);
        setOrder(response.data.order);
      } catch (error) {
        console.error('Error fetching order:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order details';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();

    // Poll for updates every 30 seconds
    const intervalId = setInterval(fetchOrder, 30000);

    return () => clearInterval(intervalId);
  }, [params.orderId]);
  
  // Function to go back to orders list
  const goBack = () => {
    router.push('/chef/orders');
  };
  
  // Calculate elapsed time if order is cooking
  let elapsedMinutes = 0;
  if (order?.status === 'cooking' && order.startedAt) {
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
  
  // Function to update item status
  const updateItemStatus = async (itemId: string, newStatus: OrderItem['status']) => {
    try {
      console.log(`Updating item ${itemId} to status: ${newStatus}`);
      setIsLoading(true);
      
      const response = await axios.put(`${API_URL}/orders/${params.orderId}/items/${itemId}/status`, {
        status: newStatus
      });

      if (!response.data || !response.data.order) {
        throw new Error('Invalid response format: missing order data');
      }

      console.log('Order update successful:', response.data);
      setOrder(response.data.order);
      toast.success(`Item status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating item status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item status';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Functions for action buttons based on order status
  const startCooking = async () => {
    try {
      await axios.post(`${API_URL}/chef/orders/${params.orderId}/start`);
      // Refetch order details
      const response = await axios.get(`${API_URL}/chef/orders/${params.orderId}`);
      setOrder(response.data.order);
    } catch (err: any) {
      console.error('Error starting order:', err);
      // Handle error (show toast, etc.)
    }
  };
  
  const completeOrder = async () => {
    try {
      await axios.post(`${API_URL}/chef/orders/${params.orderId}/complete`);
      // Refetch order details
      const response = await axios.get(`${API_URL}/chef/orders/${params.orderId}`);
      setOrder(response.data.order);
    } catch (err: any) {
      console.error('Error completing order:', err);
      // Handle error (show toast, etc.)
    }
  };
  
  const printOrder = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-amber-500 text-4xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600">{error || 'Order not found'}</p>
            </div>
          </div>
          <button
            onClick={goBack}
            className="mt-4 text-red-600 hover:text-red-800 font-medium"
          >
            Return to Orders
          </button>
        </div>
      </div>
    );
  }
  
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
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                getStatusBadgeStyle(order.status)
              }`}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
              </span>
            </div>
            <div className="text-sm text-gray-500">
              <span>Waiter: {order.waiter}</span>
              <span className="mx-2">•</span>
              <span>Received: {order.timeReceived}</span>
            </div>
          </div>
          
          {order.status === 'cooking' && (
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-orange-600">
                <FaFireAlt className="inline mr-1" />
                <span>Cooking: {elapsedMinutes} min elapsed</span>
              </div>
              {order.estimatedTime && (
                <div className="text-sm text-gray-500">
                  {order.estimatedTime} min estimated
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {order.status === 'pending' && (
            <button
              onClick={startCooking}
              className="flex items-center px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
            >
              <FaUtensils className="mr-2" />
              Start Cooking
            </button>
          )}
          
          {order.status === 'cooking' && (
            <button
              onClick={completeOrder}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <FaCheckCircle className="mr-2" />
              Complete Order
            </button>
          )}
          
          <button
            onClick={printOrder}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            <FaPrint className="mr-2" />
            Print
          </button>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Order Items</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <div key={item.itemId} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-800">
                    {item.quantity}× {item.name}
                  </span>
                  <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusBadgeStyle(item.status)
                  }`}>
                    {getStatusIcon(item.status)}
                    <span className="ml-1">
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.assignedTo && (
                    <span className="text-sm text-gray-500">
                      Chef: {item.assignedTo}
                      {item.estimatedTime && ` (${item.estimatedTime} min)`}
                    </span>
                  )}
                  {/* Status Update Buttons */}
                  <div className="flex space-x-2">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => updateItemStatus(item.itemId, 'in-progress')}
                        className="px-3 py-1 bg-amber-500 text-white text-sm rounded-md hover:bg-amber-600 flex items-center"
                      >
                        <FaFireAlt className="mr-1" size={12} />
                        Start
                      </button>
                    )}
                    {item.status === 'in-progress' && (
                      <button
                        onClick={() => updateItemStatus(item.itemId, 'completed')}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 flex items-center"
                      >
                        <FaCheckCircle className="mr-1" size={12} />
                        Complete
                      </button>
                    )}
                    {item.status === 'completed' && (
                      <button
                        onClick={() => updateItemStatus(item.itemId, 'in-progress')}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 flex items-center"
                      >
                        <FaFireAlt className="mr-1" size={12} />
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {item.special && (
                <div className="text-sm text-red-600">
                  Special request: {item.special}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Order Timeline */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaHistory className="mr-2 text-gray-400" />
            Order Timeline
          </h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {order.events.map((event, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                  <div className="h-full w-px bg-gray-200"></div>
                </div>
                <div className="flex-grow pb-4">
                  <div className="text-sm text-gray-500">{event.time}</div>
                  <div className="font-medium text-gray-800">{event.action}</div>
                  <div className="text-sm text-gray-500">{event.user}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Notes Section */}
      {order.notes && (
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Notes</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-700">{order.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
} 
