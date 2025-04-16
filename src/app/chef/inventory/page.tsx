'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaMinus, 
  FaExclamationTriangle, 
  FaSort,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSpinner
} from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '@/config/constants';
import { toast } from 'react-hot-toast';

// Types
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  lastUpdated: string;
  supplier?: string;
  notes?: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof InventoryItem,
    direction: 'asc' | 'desc'
  }>({ key: 'name', direction: 'asc' });
  const [showLowStock, setShowLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useQuantities, setUseQuantities] = useState<Record<string, number>>({});
  
  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/inventory`);
        setInventory(response.data.items);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, []);
  
  const categories = ['All', ...new Set(inventory.map(item => item.category))];
  
  // Filter inventory items
  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.supplier ? item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    
    const matchesLowStock = !showLowStock || item.currentStock < item.minThreshold;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });
  
  // Sort inventory items
  const sortedItems = [...filteredItems].sort((a, b) => {
    // Handle potential undefined values by providing defaults
    const aValue = a[sortConfig.key] ?? '';
    const bValue = b[sortConfig.key] ?? '';
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Function to request inventory update - only for reducing quantities
  const requestUseIngredient = async (id: string) => {
    const amount = useQuantities[id] || 0;
    
    if (amount <= 0) {
      toast.error('Please enter a valid quantity to use');
      return;
    }
    
    const item = inventory.find(item => item.id === id);
    if (!item) return;
    
    if (amount > item.currentStock) {
      toast.error(`Cannot use more than available stock (${item.currentStock} ${item.unit})`);
      return;
    }
    
    try {
      // Send negative amount to reduce inventory
      const response = await axios.patch(`${API_URL}/chef/inventory/update`, {
        itemId: id,
        amount: -amount
      });
      
      // Update local state
      setInventory(prev => prev.map(item => {
        if (item.id === id) {
          const newStock = Math.max(0, item.currentStock - amount);
          return {
            ...item,
            currentStock: newStock,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      }));
      
      // Reset input field
      setUseQuantities(prev => ({
        ...prev,
        [id]: 0
      }));
      
      toast.success(`Used ${amount} ${item.unit} of ${item.name}`);
    } catch (err) {
      console.error(`Error updating inventory for item ${id}:`, err);
      toast.error('Failed to update inventory');
    }
  };
  
  // Handle quantity input change
  const handleQuantityChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    setUseQuantities(prev => ({
      ...prev,
      [id]: numValue
    }));
  };
  
  // Sort function
  const handleSort = (key: keyof InventoryItem) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };
  
  // Get sort icon
  const getSortIcon = (key: keyof InventoryItem) => {
    if (sortConfig.key !== key) {
      return <FaSort className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <FaSortAmountUp className="text-indigo-600" /> : 
      <FaSortAmountDown className="text-indigo-600" />;
  };

  // Count low stock items
  const lowStockCount = inventory.filter(item => item.currentStock < item.minThreshold).length;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600 mr-3" />
        <p className="text-lg">Loading inventory...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg mx-auto max-w-4xl mt-8">
        <h2 className="text-lg font-bold text-red-800">Error Loading Inventory</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kitchen Inventory</h1>
        <p className="text-gray-600">Track and use ingredients during food preparation</p>
      </div>
      
      {/* Stock summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Items</p>
              <p className="text-2xl font-bold">{inventory.length}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Categories</p>
              <p className="text-2xl font-bold">{categories.length - 1}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Low Stock Items</p>
              <p className="text-2xl font-bold">{lowStockCount}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <FaExclamationTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search inventory..."
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <select 
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="lowStockFilter"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="lowStockFilter" className="ml-2 text-sm text-gray-700">
                Show Low Stock Only
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Inventory table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 focus:outline-none"
                    onClick={() => handleSort('name')}
                  >
                    <span>Item</span>
                    <span>{getSortIcon('name')}</span>
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 focus:outline-none"
                    onClick={() => handleSort('category')}
                  >
                    <span>Category</span>
                    <span>{getSortIcon('category')}</span>
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 focus:outline-none"
                    onClick={() => handleSort('currentStock')}
                  >
                    <span>Current Stock</span>
                    <span>{getSortIcon('currentStock')}</span>
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span>Status</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center space-x-1 focus:outline-none"
                    onClick={() => handleSort('lastUpdated')}
                  >
                    <span>Last Updated</span>
                    <span>{getSortIcon('lastUpdated')}</span>
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span>Use Ingredients</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedItems.length > 0 ? (
                sortedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.supplier && (
                        <div className="text-xs text-gray-500">
                          Supplier: {item.supplier}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {item.minThreshold} {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.currentStock < item.minThreshold ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.lastUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max={item.currentStock}
                          step="0.1"
                          value={useQuantities[item.id] || ''}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-16 border border-gray-300 rounded p-1 text-center"
                          placeholder="Qty"
                        />
                        <select
                          className="border border-gray-300 rounded p-1 text-sm"
                          value={useQuantities[item.id] || "0"}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        >
                          <option value="0">Select</option>
                          <option value="0.1">0.1 {item.unit}</option>
                          <option value="0.25">0.25 {item.unit}</option>
                          <option value="0.5">0.5 {item.unit}</option>
                          <option value="1">1 {item.unit}</option>
                          <option value="2">2 {item.unit}</option>
                        </select>
                        <button
                          onClick={() => requestUseIngredient(item.id)}
                          className="bg-amber-100 text-amber-700 p-2 rounded hover:bg-amber-200"
                          title="Use ingredient"
                          disabled={item.currentStock <= 0}
                        >
                          <FaMinus size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No inventory items found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 