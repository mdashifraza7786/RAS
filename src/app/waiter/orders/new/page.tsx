'use client';

import React, { useState } from 'react';
import { FaPlus, FaMinus, FaTrash, FaUtensils, FaCheck, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

// Types
interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

interface OrderItem {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

interface Table {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  capacity: number;
}

// Sample data
const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Paneer Butter Masala',
    price: 259,
    category: 'Main Course',
    image: '/menu/paneer-butter-masala.jpg',
    description: 'Cottage cheese cubes in a rich tomato and butter sauce'
  },
  {
    id: 2,
    name: 'Chicken Biryani',
    price: 299,
    category: 'Rice',
    image: '/menu/chicken-biryani.jpg',
    description: 'Aromatic rice dish with chicken, spices and herbs'
  },
  {
    id: 3,
    name: 'Masala Dosa',
    price: 199,
    category: 'Breakfast',
    image: '/menu/masala-dosa.jpg',
    description: 'Crispy rice crepe filled with spiced potato mixture'
  },
  {
    id: 4,
    name: 'Gulab Jamun',
    price: 149,
    category: 'Dessert',
    image: '/menu/gulab-jamun.jpg',
    description: 'Deep-fried milk solid balls soaked in sugar syrup'
  },
  {
    id: 5,
    name: 'Fresh Lime Soda',
    price: 99,
    category: 'Beverages',
    image: '/menu/lime-soda.jpg',
    description: 'Refreshing lime juice with soda and optional sugar/salt'
  },
  {
    id: 6,
    name: 'Butter Naan',
    price: 60,
    category: 'Breads',
    image: '/menu/butter-naan.jpg',
    description: 'Soft bread baked in tandoor with butter'
  },
];

const tables: Table[] = [
  { id: 1, name: 'Table 1', status: 'occupied', capacity: 2 },
  { id: 2, name: 'Table 2', status: 'available', capacity: 4 },
  { id: 3, name: 'Table 3', status: 'occupied', capacity: 4 },
  { id: 4, name: 'Table 4', status: 'available', capacity: 6 },
  { id: 5, name: 'Table 5', status: 'reserved', capacity: 8 },
  { id: 6, name: 'Table 6', status: 'available', capacity: 2 },
];

const categories = ['All', 'Main Course', 'Rice', 'Breakfast', 'Dessert', 'Beverages', 'Breads'];

export default function NewOrderPage() {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Filter menu items by category and search term
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter available tables (available or occupied only)
  const availableTables = tables.filter(table => 
    table.status === 'available' || table.status === 'occupied'
  );

  // Add item to order
  const addToOrder = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(item => item.menuItem.id === menuItem.id);
    
    if (existingItem) {
      // Increase quantity if already in order
      setOrderItems(orderItems.map(item => 
        item.menuItem.id === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Add new item to order
      setOrderItems([...orderItems, { 
        id: Date.now(), 
        menuItem, 
        quantity: 1, 
        notes: '' 
      }]);
    }
  };

  // Update item quantity
  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setOrderItems(orderItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Remove item from order
  const removeItem = (itemId: number) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  // Update item notes
  const updateNotes = (itemId: number, notes: string) => {
    setOrderItems(orderItems.map(item => 
      item.id === itemId ? { ...item, notes } : item
    ));
  };

  // Calculate total
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  };

  // Place order function
  const placeOrder = () => {
    if (!selectedTable) {
      alert('Please select a table');
      return;
    }
    
    if (orderItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }
    
    // Here you would normally send the order to your backend
    const order = {
      table: selectedTable,
      items: orderItems,
      customerName,
      specialInstructions,
      timestamp: new Date(),
      total: calculateTotal()
    };
    
    console.log('Order placed:', order);
    alert('Order placed successfully!');
    
    // Reset form after submission
    setOrderItems([]);
    setCustomerName('');
    setSpecialInstructions('');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/waiter/orders" className="mr-4 text-gray-600 hover:text-gray-800">
            <FaArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">New Order</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Menu Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table selection */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Table</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableTables.map(table => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`p-3 rounded-lg border flex flex-col items-center ${
                    selectedTable?.id === table.id 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${
                    table.status === 'occupied' ? 'bg-amber-50' : ''
                  }`}
                >
                  <FaUtensils className={`mb-1 ${selectedTable?.id === table.id ? 'text-indigo-500' : 'text-gray-500'}`} />
                  <span className="font-medium">{table.name}</span>
                  <span className="text-xs mt-1">{table.status === 'occupied' ? 'Add to existing' : 'New order'}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Menu categories and search */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Menu Items</h2>
              <div className="mt-2 sm:mt-0">
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Menu items grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMenuItems.map(item => (
                <div 
                  key={item.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-32 bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      {/* Image placeholder - in a real app you'd use next/image */}
                      <span>{item.name.substring(0, 1)}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">₹{item.price}</span>
                      <button
                        onClick={() => addToOrder(item)}
                        className="bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700"
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - Order Summary */}
        <div className="bg-white rounded-lg shadow p-4 h-fit lg:sticky lg:top-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
          
          {selectedTable ? (
            <div className="mb-4 flex items-center bg-indigo-50 p-2 rounded-md">
              <FaUtensils className="text-indigo-600 mr-2" />
              <span className="text-indigo-700 font-medium">{selectedTable.name} selected</span>
            </div>
          ) : (
            <div className="mb-4 text-amber-600 text-sm">Please select a table</div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name (Optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter customer name"
            />
          </div>
          
          {orderItems.length > 0 ? (
            <div className="border-t border-gray-200 py-4 space-y-4">
              {orderItems.map(item => (
                <div key={item.id} className="flex justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.menuItem.name}</span>
                      <span className="font-bold">₹{item.menuItem.price * item.quantity}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="mx-2 text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <FaPlus size={10} />
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="ml-3 p-1 text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
                      placeholder="Add notes..."
                      className="mt-1 w-full text-xs px-2 py-1 border border-gray-200 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-6">
              No items added to order yet
            </div>
          )}
          
          {orderItems.length > 0 && (
            <>
              <div className="border-t border-gray-200 pt-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Any special instructions..."
                ></textarea>
              </div>
              
              <div className="border-t border-gray-200 py-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Subtotal</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>
            </>
          )}
          
          <button
            onClick={placeOrder}
            disabled={orderItems.length === 0 || !selectedTable}
            className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md font-medium flex items-center justify-center 
              disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700"
          >
            <FaCheck className="mr-2" />
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
} 