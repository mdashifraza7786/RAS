'use client';

import React, { useState } from 'react';
import { FaUtensils, FaUsers, FaCircle, FaClipboardList, FaReceipt } from 'react-icons/fa';

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  occupied_since?: string;
  reservation_time?: string;
  order_status?: 'none' | 'ordered' | 'in-progress' | 'ready' | 'served';
  customer_count?: number;
}

// Sample data
const initialTables: Table[] = [
  { id: 1, name: 'Table 1', capacity: 2, status: 'available' },
  { id: 2, name: 'Table 2', capacity: 4, status: 'occupied', occupied_since: '12:30 PM', order_status: 'served', customer_count: 3 },
  { id: 3, name: 'Table 3', capacity: 6, status: 'reserved', reservation_time: '7:00 PM' },
  { id: 4, name: 'Table 4', capacity: 2, status: 'available' },
  { id: 5, name: 'Table 5', capacity: 8, status: 'available' },
  { id: 6, name: 'Table 6', capacity: 4, status: 'occupied', occupied_since: '1:15 PM', order_status: 'in-progress', customer_count: 4 },
  { id: 7, name: 'Table 7', capacity: 2, status: 'available' },
  { id: 8, name: 'Table 8', capacity: 6, status: 'occupied', occupied_since: '2:05 PM', order_status: 'ordered', customer_count: 5 },
  { id: 9, name: 'Table 9', capacity: 4, status: 'occupied', occupied_since: '1:45 PM', order_status: 'ready', customer_count: 2 },
];

const statusColors = {
  available: 'text-green-500',
  occupied: 'text-red-500',
  reserved: 'text-amber-500',
};

const statusLabels = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
};

const orderStatusColors = {
  'none': 'bg-gray-100 text-gray-600',
  'ordered': 'bg-blue-100 text-blue-600',
  'in-progress': 'bg-amber-100 text-amber-600',
  'ready': 'bg-green-100 text-green-600',
  'served': 'bg-indigo-100 text-indigo-600',
};

const orderStatusLabels = {
  'none': 'No Order',
  'ordered': 'Order Taken',
  'in-progress': 'Preparing',
  'ready': 'Ready to Serve',
  'served': 'Served',
};

export default function WaiterTablesPage() {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [filter, setFilter] = useState<string>('all');
  const [seatTableId, setSeatTableId] = useState<number | null>(null);
  const [seatingDetails, setSeatingDetails] = useState({
    customerCount: 1,
  });

  const handleUpdateStatus = (id: number, status: Table['status']) => {
    setTables(tables.map(table => 
      table.id === id 
        ? { 
            ...table, 
            status,
            occupied_since: status === 'occupied' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            reservation_time: status === 'reserved' ? table.reservation_time : undefined,
            order_status: status === 'occupied' ? 'none' : undefined,
            customer_count: status === 'occupied' ? (table.customer_count || 1) : undefined
          } 
        : table
    ));
  };

  const handleUpdateOrderStatus = (id: number, orderStatus: Table['order_status']) => {
    setTables(tables.map(table => 
      table.id === id 
        ? { 
            ...table, 
            order_status: orderStatus,
          } 
        : table
    ));
  };

  const handleSeatTable = () => {
    if (seatTableId === null) return;
    
    setTables(tables.map(table => 
      table.id === seatTableId 
        ? { 
            ...table, 
            status: 'occupied',
            occupied_since: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            customer_count: seatingDetails.customerCount,
            order_status: 'none'
          } 
        : table
    ));
    
    setSeatTableId(null);
    setSeatingDetails({ customerCount: 1 });
  };

  const filteredTables = filter === 'all' 
    ? tables 
    : filter === 'needs-service' 
      ? tables.filter(table => table.order_status === 'ready')
      : tables.filter(table => table.status === filter);

  return (
    <div className='p-8'>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Table Management</h1>
          <p className="text-gray-600">Manage tables and take orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-600'} border border-gray-300`}
        >
          All Tables
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded-lg flex items-center ${filter === 'available' ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600'} border border-gray-300`}
        >
          <FaCircle className="mr-2 text-green-500 text-xs" />
          Available
        </button>
        <button
          onClick={() => setFilter('occupied')}
          className={`px-4 py-2 rounded-lg flex items-center ${filter === 'occupied' ? 'bg-red-100 text-red-800' : 'bg-white text-gray-600'} border border-gray-300`}
        >
          <FaCircle className="mr-2 text-red-500 text-xs" />
          Occupied
        </button>
        <button
          onClick={() => setFilter('reserved')}
          className={`px-4 py-2 rounded-lg flex items-center ${filter === 'reserved' ? 'bg-amber-100 text-amber-800' : 'bg-white text-gray-600'} border border-gray-300`}
        >
          <FaCircle className="mr-2 text-amber-500 text-xs" />
          Reserved
        </button>
        <button
          onClick={() => setFilter('needs-service')}
          className={`px-4 py-2 rounded-lg flex items-center ${filter === 'needs-service' ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600'} border border-gray-300`}
        >
          <FaUtensils className="mr-2 text-green-500 text-xs" />
          Ready to Serve
        </button>
      </div>

      {/* Table layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTables.map(table => (
          <div 
            key={table.id} 
            className={`bg-white rounded-lg shadow-md p-4 border 
              ${table.order_status === 'ready' ? 'border-green-400 ring-2 ring-green-200' : 'border-gray-200'}`
            }
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{table.name}</h3>
                <div className="flex items-center mt-1">
                  <FaUsers className="text-gray-500 mr-2" />
                  <span className="text-gray-600">
                    {table.status === 'occupied' && table.customer_count 
                      ? `${table.customer_count} guests` 
                      : `Capacity: ${table.capacity}`
                    }
                  </span>
                </div>
              </div>
              {table.status === 'occupied' && table.order_status && (
                <div 
                  className={`text-xs px-2 py-1 rounded-full ${orderStatusColors[table.order_status]}`}
                >
                  {orderStatusLabels[table.order_status]}
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <div className="flex items-center">
                <FaCircle className={`mr-2 text-xs ${statusColors[table.status]}`} />
                <span className="font-medium">{statusLabels[table.status]}</span>
                {table.occupied_since && (
                  <span className="ml-2 text-xs text-gray-500">since {table.occupied_since}</span>
                )}
                {table.reservation_time && (
                  <span className="ml-2 text-xs text-gray-500">at {table.reservation_time}</span>
                )}
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-2">
              {table.status === 'available' && (
                <button 
                  onClick={() => setSeatTableId(table.id)}
                  className="py-2 px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
                >
                  <FaUsers className="mr-2" />
                  Seat Guests
                </button>
              )}
              
              {table.status === 'reserved' && (
                <button 
                  onClick={() => setSeatTableId(table.id)}
                  className="py-2 px-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center justify-center"
                >
                  <FaUsers className="mr-2" />
                  Seat Reservation
                </button>
              )}
              
              {table.status === 'occupied' && (
                <>
                  {(table.order_status === 'none' || !table.order_status) && (
                    <button 
                      onClick={() => handleUpdateOrderStatus(table.id, 'ordered')}
                      className="py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                    >
                      <FaClipboardList className="mr-2" />
                      Take Order
                    </button>
                  )}
                  
                  {table.order_status === 'ready' && (
                    <button 
                      onClick={() => handleUpdateOrderStatus(table.id, 'served')}
                      className="py-2 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                    >
                      <FaUtensils className="mr-2" />
                      Mark as Served
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleUpdateStatus(table.id, 'available')}
                    className="py-2 px-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center justify-center"
                  >
                    <FaReceipt className="mr-2" />
                    Bill & Clear Table
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Seat table modal */}
      {seatTableId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Seat Guests</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Number of Guests</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={seatingDetails.customerCount}
                onChange={(e) => setSeatingDetails({...seatingDetails, customerCount: parseInt(e.target.value)})}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setSeatTableId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleSeatTable}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Seat Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 