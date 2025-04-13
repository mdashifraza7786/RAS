'use client';

import React, { useState } from 'react';
import { FaSync, FaFilter, FaClipboardCheck, FaCheck, FaTimes, FaEllipsisV, FaUtensils, FaBroom, FaCalendarAlt, FaInfo } from 'react-icons/fa';
import { useTables, Table } from '@/hooks/useTables';
import Link from 'next/link';

export default function TablesPage() {
  const {
    tables,
    loading,
    error,
    filters,
    updateFilters,
    availableLocations,
    metadata,
    lastUpdated,
    assignTable,
    unassignTable,
    updateTableStatus,
    refreshTables
  } = useTables();

  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Handle filter changes
  const handleFilterChange = (field: string, value: string | null) => {
    if (field === 'status') {
      updateFilters({ status: value });
    } else if (field === 'location') {
      updateFilters({ location: value });
    } else if (field === 'showAll') {
      updateFilters({ showAll: value === 'true' });
    }
  };

  // Toggle action menu for a table
  const toggleActionMenu = (tableId: string) => {
    if (actionMenuOpen === tableId) {
      setActionMenuOpen(null);
    } else {
      setActionMenuOpen(tableId);
    }
  };

  // Handle table assignment
  const handleAssign = async (tableId: string) => {
    await assignTable(tableId);
    setActionMenuOpen(null);
  };

  // Handle table unassignment
  const handleUnassign = async (tableId: string) => {
    await unassignTable(tableId);
    setActionMenuOpen(null);
  };

  // Handle status update
  const handleStatusUpdate = async (tableId: string, status: 'available' | 'occupied' | 'reserved' | 'cleaning') => {
    await updateTableStatus(tableId, status);
    setActionMenuOpen(null);
  };

  // Function to determine the status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <FaCheck className="w-4 h-4" />;
      case 'occupied':
        return <FaUtensils className="w-4 h-4" />;
      case 'reserved':
        return <FaCalendarAlt className="w-4 h-4" />;
      case 'cleaning':
        return <FaBroom className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Display loading state
  if (loading && tables.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  // Display error state
  if (error && tables.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <h3 className="text-lg font-medium">Error loading tables</h3>
          <p className="mt-2">{error.message}</p>
          <button
            onClick={refreshTables}
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FaSync className="mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tables</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your assigned tables and their status
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={() => updateFilters({ showAll: !filters.showAll })}
              className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                filters.showAll 
                ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filters.showAll ? 'Showing All Tables' : 'View All Tables'}
            </button>
            <button
              onClick={refreshTables}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaSync className="mr-2" /> Refresh
            </button>
            {lastUpdated && (
              <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <FaClipboardCheck className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    My Tables
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metadata.assigned}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FaCheck className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Available
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metadata.available}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <FaUtensils className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Occupied
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metadata.occupied}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FaCalendarAlt className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Reserved
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metadata.reserved}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            {filters.showAll !== undefined && (
              <div className="text-sm text-gray-600">
                {filters.showAll ? 'Showing all tables' : 'Showing your assigned tables'}
              </div>
            )}
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="statusFilter"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || null)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
            <div>
              <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <select
                id="locationFilter"
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value || null)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Locations</option>
                {availableLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="showAllFilter" className="block text-sm font-medium text-gray-700">
                Table View
              </label>
              <select
                id="showAllFilter"
                value={filters.showAll ? 'true' : 'false'}
                onChange={(e) => handleFilterChange('showAll', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="false">My Assigned Tables</option>
                <option value="true">All Restaurant Tables</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        {tables.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">No tables found with the selected filters.</p>
          </div>
        ) : (
          <>
            {filters.showAll && (
              <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center">
                <div className="mr-2 bg-indigo-100 rounded-full p-1">
                  <FaInfo className="text-indigo-600 w-4 h-4" />
                </div>
                <p className="text-sm text-indigo-800">
                  Showing all tables. Click on any table to place an order or update its status.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`bg-white shadow rounded-lg overflow-hidden border-l-4 cursor-pointer transition-shadow hover:shadow-lg 
                    ${table.status === 'available' ? 'border-green-500' : ''}
                    ${table.status === 'occupied' ? 'border-red-500' : ''}
                    ${table.status === 'reserved' ? 'border-blue-500' : ''}
                    ${table.status === 'cleaning' ? 'border-yellow-500' : ''}
                  `}
                  onClick={() => setActiveTable(table)}
                >
                  <div className="p-4 flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">Table #{table.number}</h3>
                        {table.isAssigned && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Assigned to you
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{table.name}</p>
                      <div className="mt-2 flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                            table.status
                          )}`}
                        >
                          {getStatusIcon(table.status)}
                          <span className="ml-1 capitalize">{table.status}</span>
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {table.timeElapsed && `${table.timeElapsed}`}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Capacity: <span className="font-medium">{table.capacity}</span> • Location:{' '}
                          <span className="font-medium">{table.location}</span>
                        </p>
                      </div>
                    </div>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleActionMenu(table.id)}
                        className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <FaEllipsisV />
                      </button>
                      {actionMenuOpen === table.id && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            {!table.isAssigned ? (
                              <button
                                onClick={() => handleAssign(table.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Assign to me
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnassign(table.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Unassign from me
                              </button>
                            )}
                            <div className="border-t border-gray-100"></div>
                            {/* Allow status updates for any table */}
                            {table.status !== 'available' && (
                              <button
                                onClick={() => handleStatusUpdate(table.id, 'available')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Mark as Available
                              </button>
                            )}
                            {table.status !== 'occupied' && (
                              <button
                                onClick={() => handleStatusUpdate(table.id, 'occupied')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Mark as Occupied
                              </button>
                            )}
                            {table.status !== 'reserved' && (
                              <button
                                onClick={() => handleStatusUpdate(table.id, 'reserved')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Mark as Reserved
                              </button>
                            )}
                            {table.status !== 'cleaning' && (
                              <button
                                onClick={() => handleStatusUpdate(table.id, 'cleaning')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Mark as Cleaning
                              </button>
                            )}
                            <div className="border-t border-gray-100"></div>
                            <Link
                              href={`/waiter/orders/new?tableId=${table.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Take Order
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Orders */}
                  {table.orders && table.orders.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4" onClick={(e) => e.stopPropagation()}>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Active Orders</h4>
                      <div className="space-y-2">
                        {table.orders.map((order) => (
                          <div key={order.id} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                  ${order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
                                  ${order.status === 'ready' ? 'bg-green-100 text-green-800' : ''}
                                `}
                              >
                                {order.status}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">{order.timeElapsed}</span>
                            </div>
                            <Link
                              href={`/waiter/orders/${order.id}`}
                              className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                            >
                              View
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Table Quick Action Modal */}
        {activeTable && (
          <div className="fixed inset-0 overflow-y-auto z-50" onClick={() => setActiveTable(null)}>
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div 
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Table #{activeTable.number} - {activeTable.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${getStatusBadge(activeTable.status)}`}>
                          {getStatusIcon(activeTable.status)}
                          <span className="ml-1 capitalize">{activeTable.status}</span>
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center mb-2">
                          <p className="text-sm text-gray-500">
                            Capacity: <span className="font-medium">{activeTable.capacity}</span> • 
                            Location: <span className="font-medium">{activeTable.location}</span>
                          </p>
                          {activeTable.isAssigned && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Assigned to you
                            </span>
                          )}
                        </div>
                        
                        {/* Take Order Section - Always Visible */}
                        <div className="mt-4 mb-6">
                          <Link
                            href={`/waiter/orders/new?tableId=${activeTable.id}`}
                            className="inline-flex justify-center w-full items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <FaUtensils className="mr-2" /> 
                            {activeTable.status === 'occupied' ? 'Add Order to Table' : 'Take New Order'}
                          </Link>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {!activeTable.isAssigned ? (
                              <button
                                onClick={() => {
                                  handleAssign(activeTable.id);
                                  setActiveTable(null);
                                }}
                                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Assign Table to Me
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleUnassign(activeTable.id);
                                  setActiveTable(null);
                                }}
                                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Unassign Table
                              </button>
                            )}
                            {activeTable.orders && activeTable.orders.length > 0 && (
                              <Link
                                href={`/waiter/orders?tableId=${activeTable.id}`}
                                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                View All Orders
                              </Link>
                            )}
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Change Status</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {activeTable.status !== 'available' && (
                              <button
                                onClick={() => {
                                  handleStatusUpdate(activeTable.id, 'available');
                                  setActiveTable(null);
                                }}
                                className="inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <FaCheck className="mr-1" /> Available
                              </button>
                            )}
                            {activeTable.status !== 'occupied' && (
                              <button
                                onClick={() => {
                                  handleStatusUpdate(activeTable.id, 'occupied');
                                  setActiveTable(null);
                                }}
                                className="inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <FaUtensils className="mr-1" /> Occupied
                              </button>
                            )}
                            {activeTable.status !== 'reserved' && (
                              <button
                                onClick={() => {
                                  handleStatusUpdate(activeTable.id, 'reserved');
                                  setActiveTable(null);
                                }}
                                className="inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <FaCalendarAlt className="mr-1" /> Reserved
                              </button>
                            )}
                            {activeTable.status !== 'cleaning' && (
                              <button
                                onClick={() => {
                                  handleStatusUpdate(activeTable.id, 'cleaning');
                                  setActiveTable(null);
                                }}
                                className="inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <FaBroom className="mr-1" /> Cleaning
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Active Orders in modal */}
                        {activeTable.orders && activeTable.orders.length > 0 && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Active Orders</h4>
                            <div className="mt-2 max-h-40 overflow-y-auto">
                              {activeTable.orders.map((order) => (
                                <div key={order.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                                  <div className="flex items-center">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                        ${order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
                                        ${order.status === 'ready' ? 'bg-green-100 text-green-800' : ''}
                                      `}
                                    >
                                      {order.status}
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500">{order.timeElapsed}</span>
                                  </div>
                                  <Link
                                    href={`/waiter/orders/${order.id}`}
                                    className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                                  >
                                    View
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setActiveTable(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination or Load More */}
        {/* Can be added in future if needed */}
      </div>
    </div>
  );
} 