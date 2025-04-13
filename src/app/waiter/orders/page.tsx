'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/hooks/useOrders';
import OrdersTable from '@/components/orders/OrdersTable';
import { FaPlus, FaSyncAlt } from 'react-icons/fa';
import Link from 'next/link';
import { waiterApi } from '@/utils/api';
import { toast } from 'react-hot-toast';

// Define filter options
type FilterType = 'all' | 'pending' | 'in-progress' | 'ready' | 'completed';

export default function WaiterOrdersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch orders based on current filter
  const fetchOrders = async (filter: FilterType = activeFilter) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      console.log(`Fetching orders with filter: ${filter}`);
      const response = await waiterApi.getOrders(params);
      
      console.log(`Received ${response.orders.length} orders`);
      setOrders(response.orders);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
      toast.error('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchOrders();
  }, []);
  
  // Handler for updating order status
  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await waiterApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      
      // Refetch orders to update the table
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
  };
  
  // Handler for filter change
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    fetchOrders(filter);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/waiter/orders/new"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <FaPlus className="mr-2" />
            New Order
          </Link>
        </div>
      </div>
      
      {/* Filter tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          {(['all', 'pending', 'in-progress', 'ready', 'completed'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`py-4 px-6 text-sm font-medium ${
                activeFilter === filter
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1).replace(/-/g, ' ')}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Failed to load orders. Please try again.</p>
        </div>
      )}
      
      {/* Orders table */}
      <OrdersTable 
        orders={orders} 
        isLoading={loading} 
        onUpdateStatus={handleUpdateStatus}
        isActionable={true}
        role="waiter"
      />
    </div>
  );
} 