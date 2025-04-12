'use client';

import { useState } from 'react';
import { useTables, Table } from '@/hooks/useTables';
import { FaSyncAlt, FaUtensils, FaUsers, FaBroom, FaCalendarAlt } from 'react-icons/fa';

export default function WaiterTablesPage() {
  const { tables, loading, error, updateTableStatus, fetchTables } = useTables();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  
  // Handler for manual refresh
  const handleRefresh = () => {
    fetchTables();
  };
  
  // Handler for updating table status
  const handleUpdateStatus = async (tableId: string, status: 'available' | 'occupied' | 'reserved' | 'cleaning') => {
    await updateTableStatus(tableId, status);
  };
  
  // Group tables by status
  const groupedTables = tables.reduce((acc: Record<string, Table[]>, table: Table) => {
    if (!acc[table.status]) {
      acc[table.status] = [];
    }
    acc[table.status].push(table);
    return acc;
  }, {} as Record<string, Table[]>);
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <FaUtensils className="text-green-500" />;
      case 'occupied':
        return <FaUsers className="text-red-500" />;
      case 'reserved':
        return <FaCalendarAlt className="text-blue-500" />;
      case 'cleaning':
        return <FaBroom className="text-amber-500" />;
      default:
        return <FaUtensils className="text-gray-500" />;
    }
  };
  
  // Get status actions based on current status
  const getStatusActions = (tableId: string, status: string) => {
    switch (status) {
      case 'available':
        return (
          <div className="space-x-2">
            <button
              onClick={() => handleUpdateStatus(tableId, 'occupied')}
              className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              Mark Occupied
            </button>
            <button
              onClick={() => handleUpdateStatus(tableId, 'reserved')}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              Mark Reserved
            </button>
          </div>
        );
      case 'occupied':
        return (
          <div className="space-x-2">
            <button
              onClick={() => handleUpdateStatus(tableId, 'cleaning')}
              className="px-2 py-1 text-xs bg-amber-100 text-amber-600 rounded hover:bg-amber-200"
            >
              Mark for Cleaning
            </button>
          </div>
        );
      case 'reserved':
        return (
          <div className="space-x-2">
            <button
              onClick={() => handleUpdateStatus(tableId, 'occupied')}
              className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              Mark Occupied
            </button>
            <button
              onClick={() => handleUpdateStatus(tableId, 'available')}
              className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200"
            >
              Mark Available
            </button>
          </div>
        );
      case 'cleaning':
        return (
          <div className="space-x-2">
            <button
              onClick={() => handleUpdateStatus(tableId, 'available')}
              className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200"
            >
              Mark Available
            </button>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tables</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Failed to load tables. Please try again.</p>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Table summary */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-bold">{groupedTables['available']?.length || 0}</p>
              </div>
              <FaUtensils className="text-green-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Occupied</p>
                <p className="text-2xl font-bold">{groupedTables['occupied']?.length || 0}</p>
              </div>
              <FaUsers className="text-red-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Reserved</p>
                <p className="text-2xl font-bold">{groupedTables['reserved']?.length || 0}</p>
              </div>
              <FaCalendarAlt className="text-blue-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-amber-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Cleaning</p>
                <p className="text-2xl font-bold">{groupedTables['cleaning']?.length || 0}</p>
              </div>
              <FaBroom className="text-amber-500 text-xl" />
            </div>
          </div>
        </div>
      )}
      
      {/* Tables grid */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table: Table) => (
            <div 
              key={table._id}
              className={`bg-white rounded-lg shadow p-4 ${selectedTable === table._id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedTable(table._id)}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">{table.name}</h3>
                {getStatusIcon(table.status)}
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-500">Capacity: {table.capacity}</p>
                <p className="text-sm text-gray-500 capitalize">Status: {table.status}</p>
                {table.location && <p className="text-sm text-gray-500">Location: {table.location}</p>}
              </div>
              
              {getStatusActions(table._id, table.status)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 