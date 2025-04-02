'use client';

import { useState } from 'react';
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

// Sample inventory data
const initialInventory = [
  {
    id: 1,
    name: 'Basmati Rice',
    category: 'Grains',
    quantity: 45,
    unit: 'kg',
    costPerUnit: 120,
    totalCost: 5400,
    supplier: 'Quality Foods Ltd',
    lastRestocked: '2023-03-10',
    expiryDate: '2023-10-10',
    status: 'In Stock',
    location: 'Dry Storage',
    minStockLevel: 10
  },
  {
    id: 2,
    name: 'Chicken Breast',
    category: 'Meat',
    quantity: 12,
    unit: 'kg',
    costPerUnit: 260,
    totalCost: 3120,
    supplier: 'Farm Fresh Supplies',
    lastRestocked: '2023-04-01',
    expiryDate: '2023-04-07',
    status: 'Low Stock',
    location: 'Cold Storage',
    minStockLevel: 15
  },
  {
    id: 3,
    name: 'Tomatoes',
    category: 'Vegetables',
    quantity: 25,
    unit: 'kg',
    costPerUnit: 80,
    totalCost: 2000,
    supplier: 'Local Farmers Market',
    lastRestocked: '2023-04-02',
    expiryDate: '2023-04-09',
    status: 'In Stock',
    location: 'Vegetable Cooler',
    minStockLevel: 8
  },
  {
    id: 4,
    name: 'Olive Oil',
    category: 'Oils',
    quantity: 18,
    unit: 'liter',
    costPerUnit: 450,
    totalCost: 8100,
    supplier: 'Gourmet Imports',
    lastRestocked: '2023-02-15',
    expiryDate: '2023-12-15',
    status: 'In Stock',
    location: 'Dry Storage',
    minStockLevel: 5
  },
  {
    id: 5,
    name: 'Yogurt',
    category: 'Dairy',
    quantity: 3,
    unit: 'kg',
    costPerUnit: 160,
    totalCost: 480,
    supplier: 'Dairy Delight',
    lastRestocked: '2023-04-01',
    expiryDate: '2023-04-10',
    status: 'Critical Stock',
    location: 'Cold Storage',
    minStockLevel: 5
  },
  {
    id: 6,
    name: 'Garlic',
    category: 'Vegetables',
    quantity: 7,
    unit: 'kg',
    costPerUnit: 110,
    totalCost: 770,
    supplier: 'Local Farmers Market',
    lastRestocked: '2023-04-01',
    expiryDate: '2023-04-20',
    status: 'In Stock',
    location: 'Dry Storage',
    minStockLevel: 2
  },
  {
    id: 7,
    name: 'Cardamom',
    category: 'Spices',
    quantity: 1.2,
    unit: 'kg',
    costPerUnit: 1800,
    totalCost: 2160,
    supplier: 'Exotic Spice Traders',
    lastRestocked: '2023-03-15',
    expiryDate: '2023-09-15',
    status: 'Low Stock',
    location: 'Spice Cabinet',
    minStockLevel: 1
  },
  {
    id: 8,
    name: 'Paneer',
    category: 'Dairy',
    quantity: 8,
    unit: 'kg',
    costPerUnit: 280,
    totalCost: 2240,
    supplier: 'Dairy Delight',
    lastRestocked: '2023-04-02',
    expiryDate: '2023-04-08',
    status: 'In Stock',
    location: 'Cold Storage',
    minStockLevel: 5
  }
];

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

type InventoryItem = typeof initialInventory[0];
type SortableFields = 'name' | 'category' | 'quantity' | 'costPerUnit' | 'expiryDate';

export default function InventoryPage() {
  const [inventory, setInventory] = useState(initialInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortableFields>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);

  // Get unique categories from inventory for filter dropdown
  const categories = Array.from(new Set(inventory.map(item => item.category)));

  // Filter and sort inventory based on search query, category, and status
  const filteredInventory = inventory
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      // Sort based on the selected field
      switch(sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'costPerUnit':
          comparison = a.costPerUnit - b.costPerUnit;
          break;
        case 'expiryDate':
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          break;
      }
      
      // Apply sort order (ascending or descending)
      return sortOrder === 'asc' ? comparison : -comparison;
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
  const handleDeleteItem = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  // Calculate inventory metrics
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + item.totalCost, 0);
  const lowStockItems = inventory.filter(item => item.status === 'Low Stock' || item.status === 'Critical Stock').length;
  const expiringSoonItems = inventory.filter(item => {
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    return expiryDate <= sevenDaysLater && expiryDate >= today;
  }).length;

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
                {categories.map(category => (
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
                <option value="Critical Stock">Critical Stock</option>
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
              onClick={() => alert('Print inventory report')}
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
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FaBoxOpen className="text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">ID: {item.id}</div>
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
                      {formatDate(item.expiryDate)}
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
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete Item"
                        >
                          <FaTrashAlt />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => alert(`Restock ${item.name}`)}
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
                    No inventory items found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredInventory.length}</span> of <span className="font-medium">{inventory.length}</span> items
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
      
      {/* Item Edit/Add Modal (simplified for this example) */}
      {(showAddItemModal || itemToEdit) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {itemToEdit ? `Edit Item: ${itemToEdit.name}` : 'Add New Inventory Item'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Sample form fields - in a real app these would be controlled inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded" defaultValue={itemToEdit?.name || ''} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full p-2 border border-gray-300 rounded" defaultValue={itemToEdit?.category || ''}>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" min="0" step="0.1" className="w-full p-2 border border-gray-300 rounded" defaultValue={itemToEdit?.quantity || ''} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select className="w-full p-2 border border-gray-300 rounded" defaultValue={itemToEdit?.unit || ''}>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="liter">Liters</option>
                  <option value="unit">Units</option>
                  <option value="dozen">Dozen</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Unit</label>
                <input type="number" min="0" step="0.01" className="w-full p-2 border border-gray-300 rounded" defaultValue={itemToEdit?.costPerUnit || ''} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded" defaultValue={itemToEdit?.supplier || ''} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input type="date" className="w-full p-2 border border-gray-300 rounded" defaultValue={itemToEdit?.expiryDate || ''} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded" defaultValue={itemToEdit?.location || ''} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                <input type="number" min="0" step="0.1" className="w-full p-2 border border-gray-300 rounded" defaultValue={itemToEdit?.minStockLevel || ''} />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowAddItemModal(false);
                  setItemToEdit(null);
                }}
              >
                Cancel
              </button>
              
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => {
                  // In a real app we would validate and save the data
                  alert(itemToEdit ? 'Item updated!' : 'Item added!');
                  setShowAddItemModal(false);
                  setItemToEdit(null);
                }}
              >
                {itemToEdit ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 