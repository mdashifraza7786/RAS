'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaSpinner, FaCheckCircle, FaClock, FaUtensils, FaExclamationTriangle, FaHistory, FaReceipt } from 'react-icons/fa';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';
import { API_URL } from '@/config/constants';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

interface Waiter {
  id: string;
  name: string;
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
  specialInstructions?: string;
  createdAt: string;
  waiter?: Waiter;
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/orders/track/${orderNumber}`);
        setOrder(response.data.order);
        setError(null);
      } catch (err) {
        setError('Failed to fetch order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Poll for updates every 30 seconds if there's an active order
    let intervalId: NodeJS.Timeout;
    if (orderNumber) {
      intervalId = setInterval(fetchOrder, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [orderNumber]);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        // Get guest info from localStorage
        const guestInfo = localStorage.getItem('guestInfo');
        if (!guestInfo) {
          router.push('/guest');
          return;
        }

        const { phone } = JSON.parse(guestInfo);
        const response = await axios.get(`${API_URL}/orders/guest/history?phone=${phone}`);
        setOrderHistory(response.data.orders);
      } catch (err) {
        console.error('Error fetching order history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchOrderHistory();
  }, [router]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <FaClock className="text-yellow-500" />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          label: 'Order Received',
          message: 'Your order has been received and is waiting to be prepared.'
        };
      case 'preparing':
        return {
          icon: <FaUtensils className="text-blue-500" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          label: 'Preparing',
          message: 'Our chefs are preparing your order.'
        };
      case 'ready':
        return {
          icon: <FaCheckCircle className="text-green-500" />,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Ready',
          message: 'Your order is ready and will be served shortly.'
        };
      case 'delivered':
        return {
          icon: <FaCheckCircle className="text-gray-500" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Completed',
          message: 'Your order has been delivered. Thank you for dining with us!'
        };
      case 'cancelled':
        return {
          icon: <FaExclamationTriangle className="text-red-500" />,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          label: 'Cancelled',
          message: 'This order has been cancelled.'
        };
      default:
        return {
          icon: <FaCheckCircle className="text-gray-500" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Completed',
          message: 'This order has been completed.'
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
          <Link
            href="/guest/menu"
            className="text-amber-500 hover:text-amber-600"
          >
            Return to Menu
          </Link>
        </div>

        {/* Current Order Status */}
        {orderNumber && order && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className={`${getStatusInfo(order.status).bgColor} p-6 text-center`}>
              <div className="text-4xl mb-3">{getStatusInfo(order.status).icon}</div>
              <h2 className={`text-2xl font-bold mb-2 ${getStatusInfo(order.status).color}`}>
                {getStatusInfo(order.status).label}
              </h2>
              <p className="text-gray-700">{getStatusInfo(order.status).message}</p>
            </div>

            {/* Order Details */}
            <div className="p-6 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Number</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">#{order.orderNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer Name</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{order.customerName}</p>
                </div>
                {order.waiter && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Your Server</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{order.waiter.name}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Time</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className={`flex flex-col items-center ${
                  order.status !== 'cancelled' ? 'text-green-500' : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    order.status !== 'cancelled' ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    <FaCheckCircle className="text-lg" />
                  </div>
                  <span className="text-xs mt-2">Received</span>
                </div>

                <div className={`flex-1 h-1 mx-4 ${
                  ['preparing', 'ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'
                }`} />

                <div className={`flex flex-col items-center ${
                  ['preparing', 'ready', 'delivered'].includes(order.status) ? 'text-green-500' : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    ['preparing', 'ready', 'delivered'].includes(order.status) ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    <FaUtensils className="text-lg" />
                  </div>
                  <span className="text-xs mt-2">Preparing</span>
                </div>

                <div className={`flex-1 h-1 mx-4 ${
                  ['ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'
                }`} />

                <div className={`flex flex-col items-center ${
                  ['ready', 'delivered'].includes(order.status) ? 'text-green-500' : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    ['ready', 'delivered'].includes(order.status) ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    <FaCheckCircle className="text-lg" />
                  </div>
                  <span className="text-xs mt-2">Ready</span>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Special Instructions</h3>
                <p className="text-gray-700">{order.specialInstructions}</p>
              </div>
            )}

            {/* Order Items */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.quantity}x {item.name}
                      </p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      getStatusInfo(item.status).bgColor
                    } ${getStatusInfo(item.status).color}`}>
                      {getStatusInfo(item.status).label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order History */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {orderNumber ? 'Other Orders' : 'Your Orders'}
              </h2>
              <FaReceipt className="text-gray-400 text-xl" />
            </div>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-amber-500 text-2xl" />
              </div>
            ) : orderHistory.length > 0 ? (
              <div className="space-y-4">
                {orderHistory.map((historyOrder) => (
                  <div
                    key={historyOrder.id}
                    className={`border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      orderNumber === historyOrder.orderNumber ? 'bg-amber-50 border-amber-200' : ''
                    }`}
                    onClick={() => router.push(`/guest/orders/track?orderNumber=${historyOrder.orderNumber}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">#{historyOrder.orderNumber}</span>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        getStatusInfo(historyOrder.status).bgColor
                      } ${getStatusInfo(historyOrder.status).color}`}>
                        {getStatusInfo(historyOrder.status).label}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{new Date(historyOrder.createdAt).toLocaleDateString()}</span>
                      <span>{formatCurrency(historyOrder.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaReceipt className="mx-auto text-gray-300 text-4xl mb-4" />
                <p className="text-gray-500">No orders found</p>
                <Link
                  href="/guest/menu"
                  className="mt-4 inline-block text-amber-500 hover:text-amber-600"
                >
                  Browse Menu
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 