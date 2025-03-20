'use client'
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

type PurchaseOrderStatus = 'pending' | 'approved' | 'received' | 'cancelled';

type PurchaseOrderItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
};

type PurchaseOrder = {
  id: string;
  supplier: string;
  date: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  total: number;
};

// Dummy data for demonstration
const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-001',
    supplier: 'Fresh Produce Inc.',
    date: '2024-03-20',
    status: 'pending',
    items: [
      { id: '1', name: 'Tomatoes', quantity: 20, unit: 'kg', price: 2.99 },
      { id: '2', name: 'Onions', quantity: 15, unit: 'kg', price: 1.99 },
    ],
    total: 89.65,
  },
  {
    id: 'PO-002',
    supplier: 'Dairy Suppliers Ltd.',
    date: '2024-03-19',
    status: 'approved',
    items: [
      { id: '1', name: 'Mozzarella Cheese', quantity: 10, unit: 'kg', price: 8.99 },
      { id: '2', name: 'Butter', quantity: 5, unit: 'kg', price: 6.99 },
    ],
    total: 124.85,
  },
  {
    id: 'PO-003',
    supplier: 'Meat World',
    date: '2024-03-18',
    status: 'received',
    items: [
      { id: '1', name: 'Chicken Wings', quantity: 15, unit: 'kg', price: 12.99 },
      { id: '2', name: 'Ground Beef', quantity: 10, unit: 'kg', price: 10.99 },
    ],
    total: 304.75,
  },
];

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const statuses = ['all', 'pending', 'approved', 'received', 'cancelled'];

  const filteredOrders = selectedStatus === 'all'
    ? purchaseOrders
    : purchaseOrders.filter(order => order.status === selectedStatus);

  const handleApproveOrder = (orderId: string) => {
    setPurchaseOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'approved' as PurchaseOrderStatus }
          : order
      )
    );
  };

  const handleReceiveOrder = (orderId: string) => {
    setPurchaseOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'received' as PurchaseOrderStatus }
          : order
      )
    );
  };

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Approved</span>;
      case 'received':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Received</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <Layout userRole="inventoryManager">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Purchase Orders</h1>
          <div className="flex space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              onClick={() => {/* TODO: Implement create new order */}}
            >
              New Order
            </button>
          </div>
        </div>

        {/* Purchase Orders */}
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {order.id} - {order.supplier}
                  </h2>
                  <p className="text-sm text-gray-500">Ordered on {order.date}</p>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(order.status)}
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleApproveOrder(order.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Approve
                    </button>
                  )}
                  {order.status === 'approved' && (
                    <button
                      onClick={() => handleReceiveOrder(order.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Mark as Received
                    </button>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Items</h3>
                <ul className="mt-2 divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <li key={item.id} className="py-3 flex justify-between">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-gray-500">
                          {item.quantity} {item.unit} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order Total */}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {order.status === 'pending' && (
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-yellow-500" />
                      <span>Awaiting approval</span>
                    </div>
                  )}
                  {order.status === 'approved' && (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1 text-blue-500" />
                      <span>Order approved</span>
                    </div>
                  )}
                  {order.status === 'received' && (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                      <span>Order received</span>
                    </div>
                  )}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  Total: ${order.total.toFixed(2)}
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No purchase orders found.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 