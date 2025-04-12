'use client';

import { useState } from 'react';
import { useOrders, OrderFilters } from '@/hooks/useOrders';
import OrdersTable from '@/components/orders/OrdersTable';
import { FaPlus, FaSyncAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function WaiterOrdersPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Define filters for each tab
  const filterMap: Record<string, OrderFilters> = {
    all: {},
    pending: { status: 'pending' },
    'in-progress': { status: 'in-progress' },
    ready: { status: 'ready' },
    completed: { status: 'completed' }
  };
  
  // Use the orders hook with initial filter
  const { 
    orders, 
    loading, 
    error, 
    updateOrder, 
    fetchOrders, 
    updateFilters 
  } = useOrders(filterMap[activeFilter]);
  
  // Handler for updating order status
  const handleUpdateStatus = async (orderId: string, newStatus: 'pending' | 'in-progress' | 'ready' | 'completed' | 'cancelled') => {
    await updateOrder(orderId, { status: newStatus });
  };
  
  // Handler for filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    updateFilters(filterMap[filter]);
  };
  
  // Handler for manual refresh
  const handleRefresh = () => {
    fetchOrders();
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
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
          {Object.keys(filterMap).map((filter) => (
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