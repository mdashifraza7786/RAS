'use client';

import { useState, useEffect } from 'react';
import { useGuest } from '@/hooks/useGuests';
import { FaArrowLeft, FaSpinner, FaUtensils, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';

export default function GuestOrdersPage() {
  const { getTableOrders, requestAssistance } = useGuest();
  
  const [orders, setOrders] = useState<{
    id: string;
    tableId: string;
    items: {
      menuItemId: string;
      name: string;
      quantity: number;
      status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    }[];
    status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    totalAmount: number;
    createdAt: string;
  }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callWaiterRequested, setCallWaiterRequested] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  
  // Load order data
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const orderData = await getTableOrders();
      setOrders(orderData || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Could not load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Request waiter assistance
  const handleCallWaiter = async () => {
    try {
      await requestAssistance("waiter");
      setCallWaiterRequested(true);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setCallWaiterRequested(false);
      }, 5000);
    } catch (err) {
      console.error('Failed to request assistance:', err);
      setError('Could not request waiter assistance. Please try again.');
    }
  };
  
  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status color and indicator
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100', 
          icon: <FaClock />,
          label: 'Pending' 
        };
      case 'preparing':
        return { 
          color: 'text-blue-500',
          bgColor: 'bg-blue-100', 
          icon: <FaUtensils />,
          label: 'Preparing' 
        };
      case 'ready':
        return { 
          color: 'text-green-500',
          bgColor: 'bg-green-100', 
          icon: <FaCheckCircle />, 
          label: 'Ready'
        };
      case 'delivered':
        return { 
          color: 'text-gray-500',
          bgColor: 'bg-gray-100', 
          icon: <FaCheckCircle />, 
          label: 'Delivered'
        };
      case 'cancelled':
        return { 
          color: 'text-red-500',
          bgColor: 'bg-red-100', 
          icon: <FaExclamationTriangle />, 
          label: 'Cancelled'
        };
      default:
        return { 
          color: 'text-gray-500',
          bgColor: 'bg-gray-100', 
          icon: <FaClock />, 
          label: 'Unknown'
        };
    }
  };
  
  // Toggle order details
  const toggleOrderDetails = (orderId: string) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(orderId);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <Link href="/guest/menu" className="mr-3 text-white">
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold flex-grow">Your Orders</h1>
          <button
            onClick={handleCallWaiter}
            disabled={callWaiterRequested}
            className={`${
              callWaiterRequested ? 'bg-green-500' : 'bg-white text-indigo-600'
            } px-4 py-2 rounded-md text-sm font-medium transition`}
          >
            {callWaiterRequested ? 'Waiter Called' : 'Call Waiter'}
          </button>
        </div>
      </header>
      
      <div className="container mx-auto p-4">
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={fetchOrders}
              className="ml-4 text-red-700 font-bold underline"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
          </div>
        ) : (
          <>
            {/* No orders */}
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FaUtensils className="text-gray-300 text-5xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">No Orders Found</h2>
                <p className="text-gray-500 mb-6">You haven&apos;t placed any orders yet.</p>
                <Link
                  href="/guest/menu"
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  
                  return (
                    <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      {/* Order header */}
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => toggleOrderDetails(order.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Order #{order.id.slice(-8)}</p>
                            <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                          </div>
                          
                          <div className="flex items-center">
                            <span className={`${statusInfo.bgColor} ${statusInfo.color} px-3 py-1 rounded-full text-xs font-medium flex items-center`}>
                              <span className="mr-1">{statusInfo.icon}</span>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                          <p className="font-bold">₹{order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      {/* Order details */}
                      {selectedOrder === order.id && (
                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                          <h3 className="font-medium text-gray-700 mb-2">Order Items</h3>
                          <ul className="divide-y divide-gray-200">
                            {order.items.map((item, index) => {
                              const itemStatusInfo = getStatusInfo(item.status);
                              
                              return (
                                <li key={index} className="py-2">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <span className={`${itemStatusInfo.bgColor} ${itemStatusInfo.color} px-2 py-1 rounded-full text-xs flex items-center`}>
                                      <span className="mr-1">{itemStatusInfo.icon}</span>
                                      {itemStatusInfo.label}
                                    </span>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                          
                          {order.status !== 'cancelled' && (
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={handleCallWaiter}
                                disabled={callWaiterRequested}
                                className={`${
                                  callWaiterRequested ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
                                } px-4 py-2 rounded-md text-sm font-medium`}
                              >
                                {callWaiterRequested ? 'Waiter Called' : 'Need Help with Order?'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 