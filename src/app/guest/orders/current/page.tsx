'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaCheckCircle, FaClock, FaUtensils, FaExclamationTriangle } from 'react-icons/fa';
import { formatCurrency } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
}

export default function CurrentOrderPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current order from localStorage
    const storedOrder = localStorage.getItem('currentOrder');
    if (!storedOrder) {
      router.push('/guest/menu');
      return;
    }

    setOrder(JSON.parse(storedOrder));
    setLoading(false);
  }, [router]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100', 
          icon: <FaClock />,
          label: 'Pending',
          message: 'Your order has been received and is waiting to be prepared.'
        };
      case 'preparing':
        return { 
          color: 'text-blue-500',
          bgColor: 'bg-blue-100', 
          icon: <FaUtensils />,
          label: 'Preparing',
          message: 'The kitchen is preparing your order right now.'
        };
      case 'ready':
        return { 
          color: 'text-green-500',
          bgColor: 'bg-green-100', 
          icon: <FaCheckCircle />, 
          label: 'Ready',
          message: 'Your order is ready! It will be served to you shortly.'
        };
      case 'delivered':
        return { 
          color: 'text-gray-500',
          bgColor: 'bg-gray-100', 
          icon: <FaCheckCircle />, 
          label: 'Delivered',
          message: 'Your order has been delivered. Enjoy your meal!'
        };
      case 'cancelled':
        return { 
          color: 'text-red-500',
          bgColor: 'bg-red-100', 
          icon: <FaExclamationTriangle />, 
          label: 'Cancelled',
          message: 'This order has been cancelled.'
        };
      default:
        return { 
          color: 'text-gray-500',
          bgColor: 'bg-gray-100', 
          icon: <FaClock />, 
          label: 'Unknown',
          message: 'Order status unknown.'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-amber-500 text-4xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <FaExclamationTriangle className="text-yellow-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Active Order</h2>
          <p className="text-gray-600 mb-4">You don&apos;t have any active orders at the moment.</p>
          <button
            onClick={() => router.push('/guest/menu')}
            className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className={`${statusInfo.bgColor} ${statusInfo.color} p-6 text-center`}>
            <div className="text-4xl mb-3">{statusInfo.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{statusInfo.label}</h2>
            <p>{statusInfo.message}</p>
          </div>

          {/* Progress Timeline */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center ${order.status !== 'cancelled' ? 'text-green-500' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status !== 'cancelled' ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <FaCheckCircle className="text-lg" />
                </div>
                <span className="text-xs mt-2">Received</span>
              </div>

              <div className={`flex-1 h-1 mx-4 ${['preparing', 'ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`} />

              <div className={`flex flex-col items-center ${['preparing', 'ready', 'delivered'].includes(order.status) ? 'text-green-500' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['preparing', 'ready', 'delivered'].includes(order.status) ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <FaUtensils className="text-lg" />
                </div>
                <span className="text-xs mt-2">Preparing</span>
              </div>

              <div className={`flex-1 h-1 mx-4 ${['ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`} />

              <div className={`flex flex-col items-center ${['ready', 'delivered'].includes(order.status) ? 'text-green-500' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['ready', 'delivered'].includes(order.status) ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <FaCheckCircle className="text-lg" />
                </div>
                <span className="text-xs mt-2">Ready</span>
              </div>

              <div className={`flex-1 h-1 mx-4 ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-200'}`} />

              <div className={`flex flex-col items-center ${order.status === 'delivered' ? 'text-green-500' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'delivered' ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <FaCheckCircle className="text-lg" />
                </div>
                <span className="text-xs mt-2">Delivered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order Number</span>
                <span className="font-medium">#{order.orderNumber}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer Name</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order Time</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-800 mb-3">Items</h4>
              <ul className="divide-y divide-gray-200">
                {order.items.map((item) => {
                  const itemStatus = getStatusInfo(item.status);
                  return (
                    <li key={item.id} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${itemStatus.bgColor} ${itemStatus.color}`}>
                            {itemStatus.label}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between text-base font-medium pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 