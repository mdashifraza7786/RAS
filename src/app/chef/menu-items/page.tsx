'use client';

import React, { useState } from 'react';
import { 
  FaSearch, 
  FaEdit, 
  FaPlus, 
  FaEye,
  FaTimes,
  FaCheck 
} from 'react-icons/fa';

// Types
interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  ingredients: string[];
  preparationTime: number;
  isSpecial: boolean;
  isVegetarian: boolean;
  image: string;
  available: boolean;
}

// Sample data
const menuItemsData: MenuItem[] = [
  {
    id: 1,
    name: 'Butter Chicken',
    category: 'Main Course',
    price: 250,
    description: 'Tender chicken cooked in a rich and creamy tomato-based sauce.',
    ingredients: ['Chicken', 'Butter', 'Cream', 'Tomato puree', 'Spices'],
    preparationTime: 20,
    isSpecial: true,
    isVegetarian: false,
    image: '/images/butter-chicken.jpg',
    available: true
  },
  {
    id: 2,
    name: 'Paneer Tikka',
    category: 'Appetizers',
    price: 180,
    description: 'Marinated cottage cheese cubes grilled to perfection.',
    ingredients: ['Paneer', 'Yogurt', 'Bell peppers', 'Onions', 'Spices'],
    preparationTime: 15,
    isSpecial: false,
    isVegetarian: true,
    image: '/images/paneer-tikka.jpg',
    available: true
  },
  {
    id: 3,
    name: 'Vegetable Biryani',
    category: 'Rice',
    price: 200,
    description: 'Fragrant basmati rice cooked with mixed vegetables and aromatic spices.',
    ingredients: ['Basmati rice', 'Mixed vegetables', 'Saffron', 'Ghee', 'Spices'],
    preparationTime: 25,
    isSpecial: false,
    isVegetarian: true,
    image: '/images/veg-biryani.jpg',
    available: true
  },
  {
    id: 4,
    name: 'Chicken Tikka',
    category: 'Appetizers',
    price: 220,
    description: 'Marinated chicken pieces grilled in a tandoor.',
    ingredients: ['Chicken', 'Yogurt', 'Lemon juice', 'Spices'],
    preparationTime: 15,
    isSpecial: false,
    isVegetarian: false,
    image: '/images/chicken-tikka.jpg',
    available: true
  },
  {
    id: 5,
    name: 'Gulab Jamun',
    category: 'Desserts',
    price: 120,
    description: 'Deep-fried milk solids soaked in sugar syrup.',
    ingredients: ['Milk powder', 'Flour', 'Sugar', 'Cardamom', 'Rose water'],
    preparationTime: 10,
    isSpecial: false,
    isVegetarian: true,
    image: '/images/gulab-jamun.jpg',
    available: true
  },
  {
    id: 6,
    name: 'Malai Kofta',
    category: 'Main Course',
    price: 220,
    description: 'Potato and paneer dumplings served in a creamy sauce.',
    ingredients: ['Potato', 'Paneer', 'Cream', 'Cashews', 'Spices'],
    preparationTime: 25,
    isSpecial: false,
    isVegetarian: true,
    image: '/images/malai-kofta.jpg',
    available: false
  }
];

export default function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(menuItemsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [sortConfig] = useState<{
    key: keyof MenuItem,
    direction: 'asc' | 'desc'
  }>({ key: 'name', direction: 'asc' });
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  
  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    
    const matchesAvailability = availabilityFilter === 'All' || 
      (availabilityFilter === 'Available' && item.available) || 
      (availabilityFilter === 'Unavailable' && !item.available);
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });
  
  // Sort menu items
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
  
  // Toggle availability
  const toggleAvailability = (id: number) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, available: !item.available };
      }
      return item;
    }));
  };
  
  // View item details
  const viewItemDetails = (item: MenuItem) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };
  
  // Close modal
  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Menu Items</h1>
        <p className="text-gray-600">Manage your restaurant&apos;s menu</p>
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
              placeholder="Search menu items..."
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
            
            <select 
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="All">All Items</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
            
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700">
              <FaPlus /> Add New Item
            </button>
          </div>
        </div>
      </div>
      
      {/* Menu items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.length > 0 ? (
          sortedItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 overflow-hidden">
                <div 
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.image || '/images/placeholder.jpg'})` }}
                ></div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <span className="text-indigo-600 font-semibold">₹{item.price.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    {item.category}
                  </span>
                  
                  {item.isVegetarian && (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Vegetarian
                    </span>
                  )}
                  
                  {item.isSpecial && (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                      Special
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span>{item.preparationTime} min prep time</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => viewItemDetails(item)}
                      className="bg-indigo-100 text-indigo-700 p-2 rounded hover:bg-indigo-200"
                      title="View details"
                    >
                      <FaEye size={14} />
                    </button>
                    <button
                      className="bg-amber-100 text-amber-700 p-2 rounded hover:bg-amber-200"
                      title="Edit item"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={`${
                        item.available 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      } p-2 rounded`}
                      title={item.available ? 'Mark as unavailable' : 'Mark as available'}
                    >
                      {item.available ? <FaCheck size={14} /> : <FaTimes size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center p-6 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">No menu items found matching your filters.</p>
          </div>
        )}
      </div>
      
      {/* Item Details Modal */}
      {isViewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedItem.name}</h3>
                      <button 
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Close</span>
                        <FaTimes />
                      </button>
                    </div>
                    
                    <div className="mt-2">
                      <div className="h-48 bg-gray-200 mb-4 overflow-hidden rounded-md">
                        <div 
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${selectedItem.image || '/images/placeholder.jpg'})` }}
                        ></div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700">Description</h4>
                        <p className="text-sm text-gray-600">{selectedItem.description}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700">Price</h4>
                        <p className="text-sm text-gray-600">₹{selectedItem.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700">Category</h4>
                        <p className="text-sm text-gray-600">{selectedItem.category}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700">Preparation Time</h4>
                        <p className="text-sm text-gray-600">{selectedItem.preparationTime} minutes</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700">Ingredients</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {selectedItem.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mb-4 flex gap-2">
                        {selectedItem.isVegetarian && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Vegetarian
                          </span>
                        )}
                        
                        {selectedItem.isSpecial && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                            Chef&apos;s Special
                          </span>
                        )}
                        
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedItem.available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedItem.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => toggleAvailability(selectedItem.id)}
                >
                  {selectedItem.available ? 'Mark as Unavailable' : 'Mark as Available'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 