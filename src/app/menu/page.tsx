'use client'
import Layout from '@/components/layout/Layout';
import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

// Dummy data for demonstration
const initialMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic tomato sauce, mozzarella, and fresh basil',
    price: 12.99,
    category: 'Pizza',
  },
  {
    id: '2',
    name: 'Spaghetti Carbonara',
    description: 'Pasta with eggs, cheese, pancetta, and black pepper',
    price: 14.99,
    category: 'Pasta',
  },
  {
    id: '3',
    name: 'Chicken Wings',
    description: 'Crispy chicken wings with your choice of sauce',
    price: 9.99,
    category: 'Appetizers',
  },
  {
    id: '4',
    name: 'Caesar Salad',
    description: 'Romaine lettuce, croutons, parmesan cheese with caesar dressing',
    price: 8.99,
    category: 'Salads',
  },
];

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setNewPrice(item.price.toString());
  };

  const handleSavePrice = () => {
    if (editingItem && newPrice) {
      setMenuItems(menuItems.map(item =>
        item.id === editingItem.id
          ? { ...item, price: parseFloat(newPrice) }
          : item
      ));
      setEditingItem(null);
      setNewPrice('');
    }
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <Layout userRole="manager">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Menu Management</h1>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            onClick={() => {/* TODO: Implement add new item */}}
          >
            Add New Item
          </button>
        </div>

        {Object.entries(groupedMenuItems).map(([category, items]) => (
          <div key={category} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">{category}</h2>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {editingItem?.id === item.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-20 px-2 py-1 border rounded-md"
                              step="0.01"
                            />
                            <button
                              onClick={handleSavePrice}
                              className="text-green-600 hover:text-green-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(null);
                                setNewPrice('');
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-900">
                              ${item.price.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleEditClick(item)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
} 