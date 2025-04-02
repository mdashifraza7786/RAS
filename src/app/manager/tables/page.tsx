'use client';

import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaCircle } from 'react-icons/fa';

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  occupied_since?: string;
  reservation_time?: string;
}

// Sample data
const initialTables: Table[] = [
  { id: 1, name: 'Table 1', capacity: 2, status: 'available' },
  { id: 2, name: 'Table 2', capacity: 4, status: 'occupied', occupied_since: '12:30 PM' },
  { id: 3, name: 'Table 3', capacity: 6, status: 'reserved', reservation_time: '7:00 PM' },
  { id: 4, name: 'Table 4', capacity: 2, status: 'available' },
  { id: 5, name: 'Table 5', capacity: 8, status: 'available' },
  { id: 6, name: 'Table 6', capacity: 4, status: 'occupied', occupied_since: '1:15 PM' },
  { id: 7, name: 'Table 7', capacity: 2, status: 'available' },
  { id: 8, name: 'Table 8', capacity: 6, status: 'reserved', reservation_time: '8:30 PM' },
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

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [newTable, setNewTable] = useState<Omit<Table, 'id'>>({
    name: '',
    capacity: 2,
    status: 'available',
  });
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const handleAddTable = () => {
    const nextId = Math.max(...tables.map(table => table.id)) + 1;
    setTables([...tables, { id: nextId, ...newTable }]);
    setNewTable({ name: '', capacity: 2, status: 'available' });
    setIsAddingTable(false);
  };

  const handleUpdateStatus = (id: number, status: Table['status']) => {
    setTables(tables.map(table => 
      table.id === id 
        ? { 
            ...table, 
            status,
            occupied_since: status === 'occupied' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            reservation_time: status === 'reserved' ? table.reservation_time : undefined,
          } 
        : table
    ));
  };

  const handleDeleteTable = (id: number) => {
    setTables(tables.filter(table => table.id !== id));
  };

  const handleEditClick = (table: Table) => {
    setEditingTable(table);
    setIsEditingTable(true);
  };

  const handleEditSave = () => {
    if (!editingTable) return;
    
    setTables(tables.map(table => 
      table.id === editingTable.id ? editingTable : table
    ));
    setIsEditingTable(false);
    setEditingTable(null);
  };

  const filteredTables = filter === 'all' 
    ? tables 
    : tables.filter(table => table.status === filter);

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
        
      </div>

      {/* Table layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTables.map(table => (
          <div key={table.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{table.name}</h3>
                <div className="flex items-center mt-1">
                  <FaUsers className="text-gray-500 mr-2" />
                  <span className="text-gray-600">Capacity: {table.capacity}</span>
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
                  onClick={() => handleDeleteTable(table.id)}
                >
                  <FaTrash />
                </button>
              </div>
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
            
            <div className="mt-4 grid grid-cols-2 gap-2">
              {table.status !== 'available' && (
                <button 
                  onClick={() => handleUpdateStatus(table.id, 'available')}
                  className="text-sm py-1.5 px-3 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Mark Available
                </button>
              )}
              {table.status !== 'occupied' && (
                <button 
                  onClick={() => handleUpdateStatus(table.id, 'occupied')}
                  className="text-sm py-1.5 px-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Mark Occupied
                </button>
              )}
              {table.status !== 'reserved' && (
                <button 
                  onClick={() => handleUpdateStatus(table.id, 'reserved')}
                  className="text-sm py-1.5 px-3 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200"
                >
                  Mark Reserved
                </button>
              )}
              
            </div>
          </div>
        ))}
      </div>

      {/* Add table modal */}
      {isAddingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add New Table</h3>
            
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
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsAddingTable(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddTable}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                disabled={!newTable.name}
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
              <label className="block text-gray-700 mb-2">Current Status</label>
              <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <FaCircle className={`mr-2 text-xs ${statusColors[editingTable.status]}`} />
                <span>{statusLabels[editingTable.status]}</span>
                {editingTable.occupied_since && (
                  <span className="ml-2 text-xs text-gray-500">since {editingTable.occupied_since}</span>
                )}
                {editingTable.reservation_time && (
                  <span className="ml-2 text-xs text-gray-500">at {editingTable.reservation_time}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Note: Use the table card buttons to change status</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setIsEditingTable(false);
                  setEditingTable(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                disabled={!editingTable.name}
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