'use client'
import Layout from '@/components/layout/Layout';
import { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  threshold: number;
  unit: string;
  lastOrdered: string;
  pricePerUnit: number;
};

// Dummy data for demonstration
const initialInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Tomatoes',
    category: 'Produce',
    currentStock: 5,
    threshold: 10,
    unit: 'kg',
    lastOrdered: '2024-03-19',
    pricePerUnit: 2.99,
  },
  {
    id: '2',
    name: 'Mozzarella Cheese',
    category: 'Dairy',
    currentStock: 2,
    threshold: 5,
    unit: 'kg',
    lastOrdered: '2024-03-18',
    pricePerUnit: 8.99,
  },
  {
    id: '3',
    name: 'Flour',
    category: 'Baking',
    currentStock: 10,
    threshold: 15,
    unit: 'kg',
    lastOrdered: '2024-03-17',
    pricePerUnit: 3.99,
  },
  {
    id: '4',
    name: 'Chicken Wings',
    category: 'Meat',
    currentStock: 8,
    threshold: 12,
    unit: 'kg',
    lastOrdered: '2024-03-19',
    pricePerUnit: 12.99,
  },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(inventory.map(item => item.category))];

  const filteredInventory = selectedCategory === 'all'
    ? inventory
    : inventory.filter(item => item.category === selectedCategory);

  const handleReorder = (item: InventoryItem) => {
    // TODO: Implement reorder functionality
    console.log('Reorder:', item);
  };

  const isLowStock = (item: InventoryItem) => item.currentStock <= item.threshold;

  return (
    <Layout userRole="inventoryManager">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
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

        {/* Low Stock Alert */}
        {inventory.some(isLowStock) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    The following items are running low on stock:
                    {inventory
                      .filter(isLowStock)
                      .map(item => ` ${item.name}`)
                      .join(',')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Current Inventory</h2>
          </div>
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Ordered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        isLowStock(item) ? 'text-red-600 font-medium' : 'text-gray-900'
                      }`}>
                        {item.currentStock} {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.threshold} {item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.lastOrdered}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${item.pricePerUnit.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleReorder(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
} 