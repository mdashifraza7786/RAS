'use client'
import Layout from '@/components/layout/Layout';
import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
};

type OrderItem = {
  menuItem: MenuItem;
  quantity: number;
};

// Dummy data for demonstration
const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    price: 12.99,
    category: 'Pizza',
  },
  {
    id: '2',
    name: 'Spaghetti Carbonara',
    price: 14.99,
    category: 'Pasta',
  },
  {
    id: '3',
    name: 'Chicken Wings',
    price: 9.99,
    category: 'Appetizers',
  },
  {
    id: '4',
    name: 'Caesar Salad',
    price: 8.99,
    category: 'Salads',
  },
];

export default function NewOrderPage() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const addItemToOrder = (menuItem: MenuItem) => {
    setOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.menuItem.id === menuItem.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { menuItem, quantity: 1 }];
    });
  };

  const removeItemFromOrder = (menuItemId: string) => {
    setOrderItems(prevItems => prevItems.filter(item => item.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setOrderItems(prevItems =>
      prevItems.map(item =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  };

  return (
    <Layout userRole="salesClerk">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">New Order</h1>
          <div className="flex space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">Menu Items</h2>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {filteredMenuItems.map((item) => (
                    <li key={item.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium text-gray-900">
                            ${item.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => addItemToOrder(item)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {orderItems.map((item) => (
                    <li key={item.menuItem.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.menuItem.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ${item.menuItem.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItemFromOrder(item.menuItem.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                  {orderItems.length === 0 && (
                    <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                      No items in order
                    </li>
                  )}
                </ul>
                {orderItems.length > 0 && (
                  <div className="px-4 py-4 sm:px-6 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">Total</span>
                      <span className="text-lg font-medium text-gray-900">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                    <button
                      className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => {/* TODO: Implement order submission */}}
                    >
                      Place Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 