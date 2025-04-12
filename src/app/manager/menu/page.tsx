'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFilter, FaSortAmountUp, FaSortAmountDown, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { IMenuItem } from '@/models/MenuItem';

// Define our MenuItem type from the API
interface MenuItem extends Omit<IMenuItem, '_id'> {
  _id: string;
}

// Menu category options for filtering
const categories = [
  'All Categories', 'Breakfast', 'Starters', 'Main Course', 
  'Rice', 'Bread', 'Dessert', 'Beverages'
];

// Add Menu Item Modal Component
function AddMenuItemModal({ 
  isOpen, 
  onClose,
  onSuccess
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: (newItem: MenuItem) => void;
}) {
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Main Course',
    image: '',
    ingredients: '',
    preparationTime: 15,
    available: true,
    popular: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewItem(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'preparationTime') {
      setNewItem(prev => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      setNewItem(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Process ingredients from comma-separated string to array
      const ingredients = newItem.ingredients ? newItem.ingredients.split(',').map(i => i.trim()) : [];
      
      const response = await fetch('/api/manager/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newItem,
          ingredients
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create menu item');
      }
      
      toast.success('Menu item created successfully');
      const newItemData = await response.json();
      onSuccess(newItemData);
      onClose();
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category: 'Main Course',
        image: '',
        ingredients: '',
        preparationTime: 15,
        available: true,
        popular: false
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create menu item');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Menu Item</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={newItem.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={newItem.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={newItem.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={0}
                  step={0.01}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={newItem.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {categories.filter(c => c !== 'All Categories').map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                name="image"
                value={newItem.image}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (comma-separated)</label>
              <input
                type="text"
                name="ingredients"
                value={newItem.ingredients}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingredient 1, Ingredient 2, Ingredient 3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Time (minutes)</label>
              <input
                type="number"
                name="preparationTime"
                value={newItem.preparationTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min={1}
              />
            </div>
            
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="available"
                  id="available"
                  checked={newItem.available}
                  onChange={e => setNewItem(prev => ({ ...prev, available: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                  Available
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="popular"
                  id="popular"
                  checked={newItem.popular}
                  onChange={e => setNewItem(prev => ({ ...prev, popular: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="popular" className="ml-2 block text-sm text-gray-700">
                  Popular
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg mr-2 hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                  Saving...
                </>
              ) : (
                'Save Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Menu Item Modal Component
function EditMenuItemModal({ 
  isOpen, 
  onClose,
  onSuccess,
  menuItem
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: (updatedItem: MenuItem) => void;
  menuItem: MenuItem | null;
}) {
  const [editItem, setEditItem] = useState<any>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    ingredients: '',
    preparationTime: 15,
    available: true,
    popular: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up form when menu item changes
  useEffect(() => {
    if (menuItem) {
      setEditItem({
        ...menuItem,
        ingredients: menuItem.ingredients ? menuItem.ingredients.join(', ') : ''
      });
    }
  }, [menuItem]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditItem((prev: any) => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'preparationTime') {
      setEditItem((prev: any) => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      setEditItem((prev: any) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItem) return;
    
    setIsSubmitting(true);
    
    try {
      // Process ingredients from comma-separated string to array
      const ingredients = editItem.ingredients ? editItem.ingredients.split(',').map((i: string) => i.trim()) : [];
      
      const response = await fetch('/api/manager/menu', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: menuItem._id,
          ...editItem,
          ingredients
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update menu item');
      }
      
      toast.success('Menu item updated successfully');
      const updatedItem = await response.json();
      onSuccess(updatedItem);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update menu item');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen || !menuItem) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Menu Item</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={editItem.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={editItem.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={editItem.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={0}
                  step={0.01}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={editItem.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {categories.filter(c => c !== 'All Categories').map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                name="image"
                value={editItem.image}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (comma-separated)</label>
              <input
                type="text"
                name="ingredients"
                value={editItem.ingredients}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingredient 1, Ingredient 2, Ingredient 3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Time (minutes)</label>
              <input
                type="number"
                name="preparationTime"
                value={editItem.preparationTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min={1}
              />
            </div>
            
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="available"
                  id="edit-available"
                  checked={editItem.available}
                  onChange={e => setEditItem((prev: any) => ({ ...prev, available: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="edit-available" className="ml-2 block text-sm text-gray-700">
                  Available
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="popular"
                  id="edit-popular"
                  checked={editItem.popular}
                  onChange={e => setEditItem((prev: any) => ({ ...prev, popular: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="edit-popular" className="ml-2 block text-sm text-gray-700">
                  Popular
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg mr-2 hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                  Updating...
                </>
              ) : (
                'Update Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]); 
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); 
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);


  useEffect(() => {
    fetchMenuItems();
  }, []);
  
  
  useEffect(() => {
    filterMenuItems();
  }, [searchQuery, selectedCategory, availabilityFilter, sortOrder, allMenuItems]);


  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/manager/menu');
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      
      const data = await response.json();
      setAllMenuItems(data.menuItems);
      
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching menu items');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };


  const filterMenuItems = () => {
    let filtered = [...allMenuItems];
    
    
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(item => 
        availabilityFilter === 'available' ? item.available : !item.available
      );
    }
    
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const descMatch = item.description.toLowerCase().includes(query);
        return nameMatch || descMatch;
      });
    }
    
    
    if (sortOrder !== 'none') {
      filtered.sort((a, b) => {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      });
    }
    
    setMenuItems(filtered);
  };


  const handleEdit = (item: MenuItem) => {
    setCurrentItem(item);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/manager/menu?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete menu item');
      }
      
      toast.success('Menu item deleted successfully');
      
      // Update local data
      setAllMenuItems(prev => prev.filter(item => item._id !== id));
      // Filtered data will update via useEffect
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete menu item');
    }
  };

  const toggleStatus = async (item: MenuItem) => {
    try {
      const response = await fetch('/api/manager/menu', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item._id,
          available: !item.available
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update menu item');
      }
      
      const updatedItem = await response.json();
      
      // Update all menu items (filtered items will update via useEffect)
      setAllMenuItems(prev => 
        prev.map(menuItem => 
          menuItem._id === item._id ? updatedItem : menuItem
        )
      );
      
      toast.success(`Menu item ${updatedItem.available ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update menu item status');
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'none' || sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    // Filtering will happen in useEffect
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
          <p className="text-gray-600">Manage your restaurant&apos;s menu items and categories</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-indigo-600 px-4 py-2 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          <span>Add New Item</span>
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search menu items..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex space-x-4">
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="all">All Items</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {availabilityFilter === 'available' ? 
                  <span className="text-green-500">✓</span> : 
                  availabilityFilter === 'unavailable' ? 
                  <span className="text-red-500">✗</span> : 
                  <span>⊕</span>}
              </div>
            </div>
            
            <button 
              onClick={toggleSortOrder}
              className={`flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 ${
                sortOrder !== 'none' ? 'text-indigo-600 border-indigo-200' : 'text-gray-700'
              }`}
            >
              {sortOrder === 'asc' ? (
                <><FaSortAmountUp className="mr-2" /> Price: Low to High</>
              ) : sortOrder === 'desc' ? (
                <><FaSortAmountDown className="mr-2" /> Price: High to Low</>
              ) : (
                <>Sort by Price</>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Loading and Error States */}
      {isLoading && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading menu items...</p>
        </div>
      )}
      
      {error && !isLoading && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchMenuItems}
            className="mt-2 text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}
      
      {/* Menu Items List */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Price (₹)
                      {sortOrder !== 'none' && (
                        <span className="ml-2 text-indigo-500">
                          {sortOrder === 'asc' ? <FaSortAmountUp size={12} /> : <FaSortAmountDown size={12} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {menuItems.length > 0 ? (
                  menuItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden mr-4 bg-gray-200">
                            <img 
                              src={item.image || '/images/default-food.jpg'} 
                              alt={item.name} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/800?text=Menu&font=roboto';
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => toggleStatus(item)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.available ? 'Available' : 'Unavailable'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No menu items found. Create a new item to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Add and Edit Modals */}
      <AddMenuItemModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(newItem) => {
          // Add the new item to our local data without refetching
          setAllMenuItems(prev => [...prev, newItem]);
        }}
      />
      
      <EditMenuItemModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setCurrentItem(null);
        }}
        onSuccess={(updatedItem) => {
          // Update the item in our local data without refetching
          setAllMenuItems(prev => 
            prev.map(item => item._id === updatedItem._id ? updatedItem : item)
          );
        }}
        menuItem={currentItem}
      />
    </div>
  );
}