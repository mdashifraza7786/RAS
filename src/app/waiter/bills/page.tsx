'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaReceipt, FaPrint, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Define interfaces for type safety
interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  status: string;
}

interface OrderTable {
  _id: string;
  number: number;
  name?: string;
}

interface Order {
  _id: string;
  orderNumber: number;
  table?: OrderTable;
  items: OrderItem[];
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BillsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Get all orders that are served or completed
      const response = await axios.get('/api/waiter/orders');
      const filteredOrders = response.data.orders.filter(
        (order: Order) => order.status === 'served' || order.status === 'completed'
      );
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (orderId: string, paymentMethod: string = 'cash') => {
    try {
      // Update order payment status
      await axios.patch(`/api/waiter/orders/${orderId}/status`, {
        paymentStatus: 'paid',
        paymentMethod
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, paymentStatus: 'paid', paymentMethod } 
          : order
      ));
      
      toast.success('Payment completed and table marked available');
    } catch (error) {
      console.error('Error marking order as paid:', error);
      toast.error('Failed to process payment');
    }
  };

  const printReceipt = (order: Order) => {
    router.push(`/waiter/bills/print?orderId=${order._id}`);
  };

  const generateBill = (order: Order) => {
    try {
      // Create a bill for the order
      axios.post('/api/waiter/bills', {
        order: order._id,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        paymentMethod: 'cash',
        paymentStatus: 'unpaid'  // Using 'unpaid' which is valid in the schema
      }).then(() => {
        // Once bill is created, redirect to bill view/edit page
        router.push(`/waiter/bills/print?orderId=${order._id}`);
      }).catch(error => {
        console.error('Error creating bill:', error);
        // If bill creation fails, still go to print page
        router.push(`/waiter/bills/print?orderId=${order._id}`);
      });
    } catch (error) {
      console.error('Error initiating bill creation:', error);
      // If there's any error, still try to go to the print page
      router.push(`/waiter/bills/print?orderId=${order._id}`);
    }
  };

  const filteredOrders = orders.filter(order => {
    // Filter by payment status if not "all"
    if (statusFilter !== 'all' && order.paymentStatus !== statusFilter) {
      return false;
    }
    
    // Search by order number, table number, or total
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        order.orderNumber.toString().includes(term) ||
        (order.table?.number.toString() || '').includes(term)
      );
    }
    
    return true;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Billing & Receipts</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order # or table #"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded min-w-[150px]"
        >
          <option value="all">All Orders</option>
          <option value="unpaid">Unpaid Only</option>
          <option value="paid">Paid Only</option>
        </select>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <FaReceipt className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No Orders Found</h3>
          <p className="text-gray-500">No orders match your current filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Order #{order.orderNumber}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">Table #{order.table?.number || 'N/A'}</p>
              </div>
              
              <div className="p-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{order.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>₹{order.tax?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                    <span>Total:</span>
                    <span>₹{order.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  {order.paymentStatus !== 'paid' ? (
                    <>
                      <button
                        onClick={() => markAsPaid(order._id, 'cash')}
                        className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center justify-center"
                      >
                        <FaCheck className="mr-1" /> Mark as Paid
                      </button>
                      <button
                        onClick={() => generateBill(order)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center justify-center"
                      >
                        <FaReceipt className="mr-1" /> Generate Bill
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => printReceipt(order)}
                        className="px-3 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 flex items-center justify-center col-span-2"
                      >
                        <FaPrint className="mr-1" /> Print Receipt
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 