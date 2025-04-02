'use client';

import { useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFilter, FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa';

// Sample menu data
const initialMenuItems = [
  { 
    id: 1, 
    name: 'Butter Chicken', 
    category: 'Main Course', 
    price: 320, 
    status: 'active',
    description: 'Tender chicken in a creamy tomato sauce',
    image: 'https://ashifraza.in/assests/ashif-hero1.png'
  },
  { 
    id: 2, 
    name: 'Paneer Tikka', 
    category: 'Starters', 
    price: 220, 
    status: 'active',
    description: 'Grilled cottage cheese marinated in spices',
    image: 'https://ashifraza.in/assests/ashif-hero1.png'
  },
  { 
    id: 3, 
    name: 'Veg Biryani', 
    category: 'Rice', 
    price: 250, 
    status: 'active',
    description: 'Fragrant rice cooked with mixed vegetables and spices',
    image: 'https://ashifraza.in/assests/ashif-hero1.png'
  },
  { 
    id: 4, 
    name: 'Chocolate Brownie', 
    category: 'Dessert', 
    price: 150, 
    status: 'active',
    description: 'Rich chocolate brownie served with vanilla ice cream',
    image: 'https://ashifraza.in/assests/ashif-hero1.png'
  },
  { 
    id: 5, 
    name: 'Mango Lassi', 
    category: 'Beverages', 
    price: 120, 
    status: 'inactive',
    description: 'Sweet yogurt-based drink with mango flavor',
    image: 'https://ashifraza.in/assests/ashif-hero1.png'
  },
  { 
    id: 6, 
    name: 'Masala Dosa', 
    category: 'Breakfast', 
    price: 180, 
    status: 'active',
    description: 'Crispy rice pancake with spiced potato filling',
    image: 'https://ashifraza.in/assests/ashif-hero1.png'
  }
];

// Menu category options for filtering
const categories = [
  'All Categories', 'Breakfast', 'Starters', 'Main Course', 
  'Rice', 'Bread', 'Dessert', 'Beverages'
];

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  // Filter and sort menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.price - b.price;
    } else if (sortOrder === 'desc') {
      return b.price - a.price;
    }
    return 0;
  });

  // Handler functions for menu item actions
  const handleEdit = (id: number) => {
    // Implement edit functionality
    console.log('Edit item with ID:', id);
  };

  const handleDelete = (id: number) => {
    // Implement delete functionality
    console.log('Delete item with ID:', id);
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const toggleStatus = (id: number) => {
    // Implement status toggle
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' } : item
    ));
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    if (sortOrder === 'none' || sortOrder === 'desc') {
      setSortOrder('asc');
    } else {
      setSortOrder('desc');
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
          <p className="text-gray-600">Manage your restaurant&apos;s menu items and categories</p>
        </div>
        <button className="flex items-center bg-indigo-600 px-4 py-2 text-white rounded-lg hover:bg-indigo-700 transition-colors">
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
      
      {/* Menu Items List */}
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
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden mr-4">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
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
                        onClick={() => toggleStatus(item.id)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={() => handleEdit(item.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
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
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No menu items found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredMenuItems.length}</span> of <span className="font-medium">{menuItems.length}</span> items
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}