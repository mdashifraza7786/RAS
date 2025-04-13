'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaEdit, FaPrint, FaPlus, FaTrash, FaUtensils } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface OrderItem {
  _id: string;
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  status: string;
  notes?: string;
}

interface Order {
  _id: string;
  orderNumber: number;
  table: {
    _id: string;
    number: number;
    name: string;
  };
  items: OrderItem[];
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: string;
  customerCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Create a wrapper component to handle params unwrapping
function OrderDetailsContent({ id }: { id: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingItems, setIsAddingItems] = useState(false);
  
  // Fetch order details
  useEffect(() => {    
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/waiter/orders/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch order details: ${response.status}`);
        }
        
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
        toast.error('Could not load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  // Function to update order status
  const updateOrderStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/waiter/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update order status: ${response.status}`);
      }
      
      // Update local state
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
  };
  
  // Function to update item status
  const updateItemStatus = async (itemId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/waiter/orders/${id}/items/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update item status: ${response.status}`);
      }
      
      // Update local state
      setOrder(prev => {
        if (!prev) return null;
        
        const updatedItems = prev.items.map(item => 
          item._id === itemId ? { ...item, status: newStatus } : item
        );
        
        return { ...prev, items: updatedItems };
      });
      
      toast.success(`Item status updated`);
    } catch (err) {
      console.error('Error updating item status:', err);
      toast.error('Failed to update item status');
    }
  };
  
  // Function to add more items to order
  const addMoreItems = () => {
    // Navigate to the add items page with the order ID
    router.push(`/waiter/orders/update/${id}`);
  };
  
  // Handle print bill
  const printBill = () => {
    router.push(`/waiter/bills/new?orderId=${id}`);
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <div className="ml-3">Loading order details...</div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-medium mb-2">Error Loading Order</h2>
          <p>{error || 'Order not found'}</p>
          <button 
            onClick={() => router.push('/waiter/orders')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()} 
            className="mr-3 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
        </div>
        
        <div className="flex space-x-3">
          {order.status !== 'completed' && (
            <button
              onClick={addMoreItems}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaPlus className="mr-2" size={12} />
              Add Items
            </button>
          )}
          
          {order.status === 'served' && order.paymentStatus === 'unpaid' && (
            <button
              onClick={printBill}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FaPrint className="mr-2" size={12} />
              Generate Bill
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <div className={`text-sm font-semibold mt-1 capitalize ${
                  order.status === 'pending' ? 'text-yellow-600' :
                  order.status === 'in-progress' ? 'text-blue-600' :
                  order.status === 'ready' ? 'text-purple-600' :
                  order.status === 'served' ? 'text-green-600' :
                  order.status === 'completed' ? 'text-gray-600' :
                  'text-red-600'
                }`}>
                  {order.status}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Table</label>
                <div className="text-sm font-semibold mt-1">
                  Table #{order.table.number}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Payment</label>
                <div className={`text-sm font-semibold mt-1 capitalize ${
                  order.paymentStatus === 'paid' ? 'text-green-600' :
                  order.paymentStatus === 'refunded' ? 'text-blue-600' :
                  'text-red-600'
                }`}>
                  {order.paymentStatus}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Customers</label>
                <div className="text-sm font-semibold mt-1">
                  {order.customerCount || 1}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Order Items</h3>
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <select 
                    onChange={(e) => updateOrderStatus(e.target.value)}
                    value={order.status}
                    className="p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="ready">Ready</option>
                    <option value="served">Served</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.status !== 'completed' && order.status !== 'cancelled' ? (
                            <select
                              value={item.status}
                              onChange={(e) => updateItemStatus(item._id, e.target.value)}
                              className={`text-xs p-1 border rounded capitalize ${
                                item.status === 'pending' ? 'text-yellow-600 border-yellow-300' :
                                item.status === 'preparing' ? 'text-blue-600 border-blue-300' :
                                item.status === 'ready' ? 'text-purple-600 border-purple-300' :
                                item.status === 'served' ? 'text-green-600 border-green-300' :
                                'text-red-600 border-red-300'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="served">Served</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                              item.status === 'served' ? 'bg-green-100 text-green-800' :
                              item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {item.notes || '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Order Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FaUtensils className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              
              {order.status !== 'pending' && (
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <FaUtensils className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order In Progress</p>
                    <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              )}
              
              {(order.status === 'ready' || order.status === 'served' || order.status === 'completed') && (
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <FaUtensils className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order Ready</p>
                    <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              )}
              
              {(order.status === 'served' || order.status === 'completed') && (
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <FaUtensils className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order Served</p>
                    <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              )}
              
              {order.status === 'completed' && (
                <div className="flex items-start">
                  <div className="bg-gray-100 p-2 rounded-full mr-3">
                    <FaUtensils className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order Completed</p>
                    <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              )}
              
              {order.status === 'cancelled' && (
                <div className="flex items-start">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <FaUtensils className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order Cancelled</p>
                    <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%):</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
              {/* Could add discounts here if needed */}
              <div className="flex justify-between pt-3 border-t border-gray-200 font-semibold">
                <span>Total:</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>
            
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <div className="mt-6 space-y-3">
                <button
                  onClick={addMoreItems}
                  className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <FaPlus className="mr-2" size={12} />
                  Add More Items
                </button>
                
                {order.status === 'served' && order.paymentStatus === 'unpaid' && (
                  <button
                    onClick={printBill}
                    className="w-full flex justify-center items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FaPrint className="mr-2" size={12} />
                    Generate Bill
                  </button>
                )}
                
                <button
                  onClick={() => updateOrderStatus('cancelled')}
                  className="w-full flex justify-center items-center px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                >
                  <FaTrash className="mr-2" size={12} />
                  Cancel Order
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/waiter/orders')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back to Orders
              </button>
              
              <button
                onClick={() => router.push(`/waiter/tables`)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                View Tables
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that properly unwraps params using React.use
export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use
  const resolvedParams = use(params);
  return <OrderDetailsContent id={resolvedParams.id} />;
} 