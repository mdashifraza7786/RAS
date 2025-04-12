'use client';

import { useState, useEffect } from 'react';
import { useGuest } from '@/hooks/useGuests';
import { FaShoppingCart, FaUtensils, FaSearch, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

export default function GuestMenuPage() {
  const { 
    menuItems: apiMenuItems, 
    getMenuItems, 
    getCategories, 
    loading, 
    error, 
    tableId, 
    selectTable
  } = useGuest();
  
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  }[]>([]);
  
  // Fetch menu categories and items on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        await getMenuItems();
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    }
    fetchData();
  }, [getCategories, getMenuItems]);
  
  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('guest_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        console.error('Failed to parse cart data', err);
      }
    }
  }, []);
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('guest_cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  // Add item to cart
  const addToCart = (menuItem: {
    _id: string;
    name: string;
    price: number;
    available: boolean;
  }) => {
    const existingItemIndex = cartItems.findIndex(item => item.menuItemId === menuItem._id);
    
    if (existingItemIndex >= 0) {
      // Item exists, update quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += 1;
      setCartItems(updatedItems);
    } else {
      // Add new item to cart
      setCartItems([
        ...cartItems,
        {
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          notes: ''
        }
      ]);
    }
  };
  
  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Filter displayed menu items based on search term and category
  const filteredMenuItems = apiMenuItems
    .filter(item => 
      (selectedCategory ? item.category === selectedCategory : true) &&
      (searchTerm ? 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true)
    );
  
  // Mock table selection for demo
  useEffect(() => {
    if (!tableId) {
      selectTable('table123'); // For demo purposes
    }
  }, [tableId, selectTable]);
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <FaUtensils className="mr-2" /> Our Menu
          </h1>
          <Link href="/guest/cart" className="relative">
            <FaShoppingCart className="text-2xl" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
      </header>
      
      {/* Search & Filters */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto p-4">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search menu items..."
                className="w-full p-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
          </form>
          
          <div className="overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              <button
                onClick={() => handleCategorySelect('')}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedCategory === '' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Items
              </button>
              {categories.map(category => (
                <button
                  key={category._id}
                  onClick={() => handleCategorySelect(category._id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedCategory === category._id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="container mx-auto p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Failed to load menu items. Please try again.</p>
          </div>
        </div>
      )}
      
      {/* Menu items */}
      <div className="container mx-auto p-4">
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map(item => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {item.image && (
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                  ></div>
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <span className="font-bold text-indigo-600">₹{item.price.toFixed(2)}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.isVegetarian && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Vegetarian</span>
                    )}
                    {item.isVegan && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Vegan</span>
                    )}
                    {item.isGlutenFree && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Gluten Free</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">Prep time: {item.preparationTime} mins</span>
                    <button 
                      onClick={() => addToCart(item)}
                      disabled={!item.available}
                      className={`px-4 py-2 rounded-md text-white ${
                        item.available 
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {item.available ? 'Add to Order' : 'Not Available'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating cart preview */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold">{cartItems.reduce((total, item) => total + item.quantity, 0)} item(s)</span>
                <span className="ml-2 font-bold">₹{calculateTotal().toFixed(2)}</span>
              </div>
              <Link 
                href="/guest/cart"
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
              >
                View Order
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 