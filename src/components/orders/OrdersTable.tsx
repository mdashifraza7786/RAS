import React from 'react';
import { Order } from '@/hooks/useOrders';
import { FaCheck, FaClock, FaUtensilSpoon, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import Link from 'next/link';

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onUpdateStatus?: (orderId: string, status: Order['status']) => void;
  isActionable?: boolean;
  role?: 'waiter' | 'chef' | 'manager';
}

export default function OrdersTable({ 
  orders, 
  isLoading = false, 
  onUpdateStatus,
  isActionable = false,
  role = 'waiter'
}: OrdersTableProps) {
  
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"><FaClock className="mr-1" /> Pending</span>;
      case 'in-progress':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"><FaUtensilSpoon className="mr-1" /> In Progress</span>;
      case 'ready':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"><FaCheck className="mr-1" /> Ready</span>;
      case 'completed':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800"><FaCheck className="mr-1" /> Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"><FaTimesCircle className="mr-1" /> Cancelled</span>;
      default:
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>;
      case 'unpaid':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Unpaid</span>;
      case 'refunded':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Refunded</span>;
      default:
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Determine which actions should be shown based on role and order status
  const getStatusActions = (order: Order) => {
    if (!isActionable) return null;
    
    switch (role) {
      case 'chef':
        if (order.status === 'pending') {
          return (
            <button 
              onClick={() => onUpdateStatus?.(order._id, 'in-progress')}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Start Cooking
            </button>
          );
        } else if (order.status === 'in-progress') {
          return (
            <button 
              onClick={() => onUpdateStatus?.(order._id, 'ready')}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Mark Ready
            </button>
          );
        }
        break;
      
      case 'waiter':
        if (order.status === 'ready') {
          return (
            <button 
              onClick={() => onUpdateStatus?.(order._id, 'completed')}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Mark Served
            </button>
          );
        } else if (order.status === 'pending' || order.status === 'in-progress') {
          return (
            <button 
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm cursor-not-allowed"
              disabled
            >
              Waiting for Kitchen
            </button>
          );
        }
        break;
        
      case 'manager':
        return (
          <div className="flex space-x-2">
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <button 
                onClick={() => onUpdateStatus?.(order._id, 'completed')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Complete
              </button>
            )}
            {order.status !== 'cancelled' && (
              <button 
                onClick={() => onUpdateStatus?.(order._id, 'cancelled')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Cancel
              </button>
            )}
          </div>
        );
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <FaExclamationTriangle className="mx-auto text-yellow-500 text-4xl mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
        <p className="mt-2 text-sm text-gray-500">There are no orders matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            {isActionable && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/${role}/orders/${order._id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                  #{order.orderNumber}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {typeof order.table === 'string' ? 
                  order.table : 
                  (order.table?.name || 'N/A')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ₹{order.total.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(order.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getPaymentStatusBadge(order.paymentStatus)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(order.createdAt).toLocaleTimeString()}
              </td>
              {isActionable && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusActions(order)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 