'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

// Define simplified table interface for the component
interface Table {
  _id: string;
  number: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  location?: string;
  currentOrder?: any;
}

// Define type for new table without _id
type NewTable = Omit<Table, '_id' | 'currentOrder'>;

const statusColors = {
  available: 'text-green-500',
  occupied: 'text-red-500',
  reserved: 'text-amber-500',
  cleaning: 'text-blue-500'
};

const statusLabels = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  cleaning: 'Cleaning'
};

export default function TablesPage() {
  const { data: session } = useSession();
  const [tables, setTables] = useState<Table[]>([]);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTable, setNewTable] = useState<NewTable>({
    number: 0,
    name: '',
    capacity: 2,
    status: 'available',
    location: 'Main'
  });
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  // Fetch tables
  useEffect(() => {
    fetchTables();
  }, [filter]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/manager/tables?status=${filter !== 'all' ? filter : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }
      
      const data = await response.json();
      setTables(data.tables);
      setError(null);
    } catch (err) {
      setError('Error loading tables. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async () => {
    try {
      const response = await fetch('/api/manager/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTable),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create table');
      }

      const createdTable = await response.json();
      setTables([...tables, createdTable]);
      setNewTable({ number: 0, name: '', capacity: 2, status: 'available', location: 'Main' });
      setIsAddingTable(false);
      toast.success('Table created successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create table');
    }
  };

  const handleUpdateStatus = async (id: string, status: Table['status']) => {
    try {
      const tableToUpdate = tables.find(t => t._id === id);
      if (!tableToUpdate) return;

      const response = await fetch('/api/manager/tables', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update table status');
      }

      const updatedTable = await response.json();
      setTables(tables.map(table => table._id === id ? updatedTable : table));
      toast.success('Table status updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update table status');
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      const response = await fetch(`/api/manager/tables?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete table');
      }

      setTables(tables.filter(table => table._id !== id));
      toast.success('Table deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete table');
    }
  };

  const handleEditClick = (table: Table) => {
    setEditingTable(table);
    setIsEditingTable(true);
  };

  const handleEditSave = async () => {
    if (!editingTable) return;
    
    try {
      const response = await fetch('/api/manager/tables', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingTable._id,
          name: editingTable.name,
          capacity: editingTable.capacity,
          number: editingTable.number,
          status: editingTable.status
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update table');
      }

      const updatedTable = await response.json();
      setTables(tables.map(table => table._id === editingTable._id ? updatedTable : table));
      setIsEditingTable(false);
      setEditingTable(null);
      toast.success('Table updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update table');
    }
  };

  const filteredTables = tables;

  return (
    <div className='p-8'>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Table Management</h1>
          <p className="text-gray-600">Manage your restaurant&apos;s tables and their status</p>
        </div>
        <button 
          onClick={() => setIsAddingTable(true)}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaPlus className="mr-2" />
          Add New Table
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
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
          onClick={() => setFilter('cleaning')}
          className={`px-4 py-2 rounded-lg flex items-center ${filter === 'cleaning' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-600'} border border-gray-300`}
        >
          <FaCircle className="mr-2 text-blue-500 text-xs" />
          Cleaning
        </button>
      </div>

      {/* Loading and error states */}
      {loading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tables...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <button 
            onClick={fetchTables}
            className="mt-2 text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Table layout */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTables.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              <p>No tables found. Create a new table to get started.</p>
            </div>
          ) : (
            filteredTables.map(table => (
              <div key={table._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{table.name}</h3>
                    <div className="flex items-center mt-1">
                      <FaUsers className="text-gray-500 mr-2" />
                      <span className="text-gray-600">Capacity: {table.capacity}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Table #{table.number}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      onClick={() => handleEditClick(table)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      onClick={() => handleDeleteTable(table._id)}
                      disabled={table.currentOrder}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center">
                    <FaCircle className={`mr-2 text-xs ${statusColors[table.status]}`} />
                    <span className="font-medium">{statusLabels[table.status]}</span>
                    {table.currentOrder && (
                      <span className="ml-2 text-xs text-orange-500 font-medium">• Has Active Order</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {table.status !== 'available' && (
                    <button 
                      onClick={() => handleUpdateStatus(table._id, 'available')}
                      className="text-sm py-1.5 px-3 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                      disabled={!!table.currentOrder}
                    >
                      Mark Available
                    </button>
                  )}
                  {table.status !== 'occupied' && (
                    <button 
                      onClick={() => handleUpdateStatus(table._id, 'occupied')}
                      className="text-sm py-1.5 px-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Mark Occupied
                    </button>
                  )}
                  {table.status !== 'reserved' && (
                    <button 
                      onClick={() => handleUpdateStatus(table._id, 'reserved')}
                      className="text-sm py-1.5 px-3 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200"
                      disabled={!!table.currentOrder}
                    >
                      Mark Reserved
                    </button>
                  )}
                  {table.status !== 'cleaning' && (
                    <button 
                      onClick={() => handleUpdateStatus(table._id, 'cleaning')}
                      className="text-sm py-1.5 px-3 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      disabled={!!table.currentOrder}
                    >
                      Mark Cleaning
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add table modal */}
      {isAddingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add New Table</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Table Number</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newTable.number || ''}
                onChange={(e) => setNewTable({...newTable, number: parseInt(e.target.value)})}
                placeholder="e.g. 9"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Table Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newTable.name}
                onChange={(e) => setNewTable({...newTable, name: e.target.value})}
                placeholder="e.g. Table 9"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Capacity</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newTable.capacity}
                onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
              >
                {[2, 4, 6, 8, 10, 12].map(num => (
                  <option key={num} value={num}>{num} people</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Initial Status</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newTable.status}
                onChange={(e) => setNewTable({...newTable, status: e.target.value as Table['status']})}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsAddingTable(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddTable}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                disabled={!newTable.name || !newTable.number}
              >
                Add Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit table modal */}
      {isEditingTable && editingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Table</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Table Number</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={editingTable.number || ''}
                onChange={(e) => setEditingTable({...editingTable, number: parseInt(e.target.value)})}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Table Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={editingTable.name}
                onChange={(e) => setEditingTable({...editingTable, name: e.target.value})}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Capacity</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={editingTable.capacity}
                onChange={(e) => setEditingTable({...editingTable, capacity: parseInt(e.target.value)})}
              >
                {[2, 4, 6, 8, 10, 12].map(num => (
                  <option key={num} value={num}>{num} people</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Status</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={editingTable.status}
                onChange={(e) => setEditingTable({...editingTable, status: e.target.value as Table['status']})}
                disabled={!!editingTable.currentOrder}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning</option>
              </select>
              {editingTable.currentOrder && (
                <p className="text-xs text-orange-500 mt-1">
                  Cannot change status while table has an active order
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setIsEditingTable(false);
                  setEditingTable(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                disabled={!editingTable.name || !editingTable.number}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 