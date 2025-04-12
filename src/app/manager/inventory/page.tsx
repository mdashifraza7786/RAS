'use client';

import { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaExclamationTriangle, 
  FaSort, 
  FaEdit, 
  FaTrashAlt, 
  FaPlus, 
  FaFilter,
  FaPrint
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import AddInventoryModal from './components/AddInventoryModal';
import InventoryReportModal from './components/InventoryReportModal';
import EditInventoryModal from './components/EditInventoryModal';

// Format date string to a readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric'
  });
};

// Format currency to Indian Rupees
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  supplier: string;
  lastRestocked: string;
  expiryDate: string;
  status: string;
  location: string;
  minStockLevel: number;
  daysUntilExpiry?: number;
  expiryStatus?: string;
}

type SortableFields = 'name' | 'category' | 'quantity' | 'costPerUnit' | 'expiryDate';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortableFields>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  });

  // Get unique categories from inventory for filter dropdown
  const categories = Array.from(new Set(inventory.map(item => item.category)));
  
  // Static categories list instead of generating from inventory
  const allCategories = [
    'Grains',
    'Dairy',
    'Meat',
    'Poultry',
    'Seafood',
    'Vegetables',
    'Fruits',
    'Spices',
    'Herbs',
    'Oils',
    'Condiments',
    'Beverages',
    'Bakery',
    'Snacks',
    'Canned Goods',
    'Dry Goods',
    'Frozen Foods',
    'Cleaning Supplies',
    'Packaging',
    'Sweeteners',
    'Other'
  ];

  // Fetch inventory data on mount and when filters/sorting change
  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, sortBy, sortOrder, pagination.page, searchQuery]);

  // Fetch inventory from API
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query string - only use pagination parameters
      const queryParams = new URLSearchParams();
      // Only category filter is still handled server-side since it affects pagination
      if (selectedCategory !== 'all') queryParams.append('category', selectedCategory);
      // Remove status filtering from the API call, we'll do this client-side
      // if (selectedStatus === 'Low Stock' || selectedStatus === 'Critical Stock' || selectedStatus === 'Out of Stock') {
      //   queryParams.append('lowStock', 'true');
      // }
      if (searchQuery) queryParams.append('search', searchQuery);
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
      
      const response = await fetch(`/api/manager/inventory?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      
      const data = await response.json();
      setInventory(data.items);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching inventory data');
      toast.error('Failed to load inventory data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter inventory based on search query and status
  const filteredInventory = inventory
    .filter(item => {
      const matchesSearch = searchQuery 
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      let matchesStatus = true;
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'Low Stock') {
          matchesStatus = item.status === 'Low Stock' || 
                          item.status === 'Critical Stock' || 
                          (item.quantity <= item.minStockLevel);
        } else {
          matchesStatus = item.status === selectedStatus;
        }
      }
      
      return matchesSearch && matchesStatus;
    });

  // Toggle sort order and field
  const handleSort = (field: SortableFields) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Delete item from inventory
  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`/api/manager/inventory?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }
      
      toast.success('Item deleted successfully');
      fetchInventory(); // Refresh the inventory list
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete item');
    }
  };

  // Update item quantities (restocking)
  const handleRestockItem = async (item: InventoryItem) => {
    const quantity = prompt(`Enter quantity to add to ${item.name}:`, '1');
    if (!quantity) return;
    
    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }
    
    try {
      const response = await fetch('/api/manager/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: item._id,
          quantity: quantityNum,
          type: 'add'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restock item');
      }
      
      toast.success(`Added ${quantity} ${item.unit} to ${item.name}`);
      fetchInventory(); // Refresh the inventory list
    } catch (err: any) {
      toast.error(err.message || 'Failed to restock item');
    }
  };

  // Calculate inventory metrics
  const totalItems = pagination.total;
  const totalValue = inventory.reduce((sum, item) => sum + item.totalCost, 0);
  
  // Fix low stock detection by checking if quantity is <= minStockLevel
  const lowStockItems = inventory.filter(item => {
    // For numerical checks
    const quantity = Number(item.quantity);
    const minStockLevel = Number(item.minStockLevel);
    
    return quantity <= minStockLevel || 
           item.status === 'Low Stock' || 
           item.status === 'Critical Stock' || 
           item.status === 'Out of Stock';
  }).length;
  
  const expiringSoonItems = inventory.filter(item => item.expiryStatus === 'Expiring Soon').length;

  if (isLoading && inventory.length === 0) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error && inventory.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <FaExclamationTriangle className="text-red-500 mt-1 mr-3" />
            <div>
              <h3 className="font-semibold">Error loading inventory</h3>
              <p>{error}</p>
              <button 
                className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm"
                onClick={() => fetchInventory()}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        <p className="text-gray-600">Track and manage your restaurant inventory</p>
      </div>
      
      {/* Inventory Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Total Items</h3>
          <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-green-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Inventory Value</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Low Stock Items</h3>
          <p className="text-3xl font-bold text-gray-900">{lowStockItems}</p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-red-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Expiring Soon</h3>
          <p className="text-3xl font-bold text-gray-900">{expiringSoonItems}</p>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[150px]">
              <select 
                className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            </div>
            
            <div className="relative min-w-[150px]">
              <select 
                className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            </div>
            
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              onClick={() => setShowAddItemModal(true)}
            >
              <FaPlus className="mr-2" size={12} />
              Add Item
            </button>
            
            <button 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              onClick={() => setShowReportModal(true)}
            >
              <FaPrint className="mr-2" size={12} />
              Print Report
            </button>
          </div>
        </div>
      </div>
      
      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    Item Name
                    {sortBy === 'name' && (
                      <FaSort className={`ml-1 text-gray-400 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} size={12} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('category')}>
                  <div className="flex items-center">
                    Category
                    {sortBy === 'category' && (
                      <FaSort className={`ml-1 text-gray-400 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} size={12} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center">
                    Quantity
                    {sortBy === 'quantity' && (
                      <FaSort className={`ml-1 text-gray-400 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} size={12} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('costPerUnit')}>
                  <div className="flex items-center">
                    Cost
                    {sortBy === 'costPerUnit' && (
                      <FaSort className={`ml-1 text-gray-400 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} size={12} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('expiryDate')}>
                  <div className="flex items-center">
                    Expiry
                    {sortBy === 'expiryDate' && (
                      <FaSort className={`ml-1 text-gray-400 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} size={12} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FaBoxOpen className="text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">ID: {item._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                      <div className="text-xs text-gray-500">Min: {item.minStockLevel} {item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(item.costPerUnit)}/{item.unit}</div>
                      <div className="text-xs text-gray-500">Total: {formatCurrency(item.totalCost)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className={item.expiryStatus === 'Expiring Soon' ? 'text-orange-600 font-medium' : ''}>
                        {formatDate(item.expiryDate)}
                      </div>
                      {item.daysUntilExpiry !== undefined && item.daysUntilExpiry <= 30 && (
                        <div className="text-xs">
                          {item.daysUntilExpiry <= 0 
                            ? <span className="text-red-600">Expired</span>
                            : `${item.daysUntilExpiry} days left`
                          }
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'In Stock' 
                          ? 'bg-green-100 text-green-800' 
                          : item.status === 'Low Stock' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : item.status === 'Critical Stock'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => setItemToEdit(item)}
                          title="Edit Item"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteItem(item._id)}
                          title="Delete Item"
                        >
                          <FaTrashAlt />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => handleRestockItem(item)}
                          title="Restock Item"
                        >
                          <FaShoppingCart />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {isLoading 
                      ? 'Loading inventory items...' 
                      : 'No inventory items found. Try adjusting your search or filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredInventory.length}</span> of <span className="font-medium">{pagination.total}</span> items
          </div>
          <div className="flex items-center space-x-2">
            {lowStockItems > 0 && (
              <span className="text-sm text-yellow-600 flex items-center">
                <FaExclamationTriangle className="mr-1" size={14} />
                {lowStockItems} items need restocking
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Inventory Modal */}
      {showAddItemModal && (
        <AddInventoryModal
          isOpen={showAddItemModal}
          onClose={() => setShowAddItemModal(false)}
          onItemAdded={() => {
            setShowAddItemModal(false);
            fetchInventory();
          }}
          categories={allCategories}
        />
      )}
      
      {/* Report Modal */}
      {showReportModal && (
        <InventoryReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          categories={allCategories}
        />
      )}
      
      {/* Edit Item Modal (simplified - would need to implement fully like Add Modal) */}
      {itemToEdit && (
        <EditInventoryModal
          isOpen={!!itemToEdit}
          onClose={() => setItemToEdit(null)}
          onItemUpdated={() => {
            setItemToEdit(null);
            fetchInventory();
          }}
          item={itemToEdit}
          categories={allCategories}
        />
      )}
    </div>
  );
} 