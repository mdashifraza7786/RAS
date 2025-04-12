'use client';

import { useState, useEffect } from 'react';
import { FaArrowLeft, FaPlus, FaSearch, FaTimesCircle, FaUtensils } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useTables } from '@/hooks/useTables';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useOrders } from '@/hooks/useOrders';

export default function NewOrderPage() {
  const router = useRouter();
  const { tables, loading: tablesLoading } = useTables();
  const { menuItems, loading: menuLoading } = useMenuItems();
  const { createOrder, loading: orderLoading } = useOrders();
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [customerCount, setCustomerCount] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState<Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes: string;
  }>>([]);
  
  const [step, setStep] = useState(1);
  
  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const groupedMenuItems = filteredMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);
  
  const addItemToOrder = (menuItem: any) => {
    const existingItem = orderItems.find(item => item.menuItemId === menuItem._id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.menuItemId === menuItem._id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setOrderItems([
        ...orderItems,
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
  
  const removeItemFromOrder = (menuItemId: string) => {
    setOrderItems(orderItems.filter(item => item.menuItemId !== menuItemId));
  };
  
  const updateItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(menuItemId);
      return;
    }
    
    setOrderItems(orderItems.map(item => 
      item.menuItemId === menuItemId 
        ? { ...item, quantity } 
        : item
    ));
  };
  
  const updateItemNotes = (menuItemId: string, notes: string) => {
    setOrderItems(orderItems.map(item => 
      item.menuItemId === menuItemId 
        ? { ...item, notes } 
        : item
    ));
  };
  
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleSubmitOrder = async () => {
    if (!selectedTable || orderItems.length === 0) return;
    
    try {
      const orderData = {
        tableId: selectedTable,
        customerCount,
        items: orderItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes
        }))
      };
      
      await createOrder(orderData);
      router.push('/waiter/orders');
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };
  
  if (tablesLoading || menuLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()} 
          className="mr-3 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">New Order</h1>
      </div>
      
      {/* Step 1: Select Table */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Step 1: Select Table</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {tables.map(table => (
              <button
                key={table._id}
                onClick={() => setSelectedTable(table._id)}
                className={`
                  p-4 rounded-lg border text-center ${
                    selectedTable === table._id 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }
                  ${table.status !== 'available' ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={table.status !== 'available'}
              >
                <FaUtensils className="mx-auto mb-2" />
                <div className="font-medium">{table.name}</div>
                <div className="text-xs text-gray-500 capitalize">{table.status}</div>
              </button>
            ))}
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Customers</label>
            <input
              type="number"
              min="1"
              value={customerCount}
              onChange={(e) => setCustomerCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedTable}
              className={`
                px-4 py-2 rounded-md text-white ${
                  selectedTable ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }
              `}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      
      {/* Step 2: Add Menu Items */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Step 2: Add Menu Items</h2>
            
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                />
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-6">
              {Object.keys(groupedMenuItems).length > 0 ? (
                Object.entries(groupedMenuItems).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-md font-medium mb-3 text-gray-700 border-b pb-2">{category}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {items.map(item => (
                        <div 
                          key={item._id} 
                          className="border border-gray-200 rounded-lg p-3 flex justify-between items-center hover:border-blue-300 cursor-pointer"
                          onClick={() => addItemToOrder(item)}
                        >
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                          <div className="flex items-center">
                            <div className="font-medium mr-3">₹{item.price.toFixed(2)}</div>
                            <button className="p-1 bg-blue-100 text-blue-600 rounded-full">
                              <FaPlus size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No menu items match your search
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-4">Order Summary</h3>
            
            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items added to order yet</p>
            ) : (
              <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                {orderItems.map(item => (
                  <div key={item.menuItemId} className="border-b border-gray-200 pb-3">
                    <div className="flex justify-between">
                      <div className="font-medium">{item.name}</div>
                      <button 
                        onClick={() => removeItemFromOrder(item.menuItemId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimesCircle size={16} />
                      </button>
                    </div>
                    <div className="text-gray-700 mt-1">₹{item.price.toFixed(2)}</div>
                    <div className="flex items-center mt-2">
                      <button 
                        onClick={() => updateItemQuantity(item.menuItemId, item.quantity - 1)}
                        className="px-2 py-1 border border-gray-300 rounded-l-md"
                      >
                        -
                      </button>
                      <div className="px-3 py-1 border-t border-b border-gray-300 min-w-[40px] text-center">
                        {item.quantity}
                      </div>
                      <button 
                        onClick={() => updateItemQuantity(item.menuItemId, item.quantity + 1)}
                        className="px-2 py-1 border border-gray-300 rounded-r-md"
                      >
                        +
                      </button>
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Add notes..."
                        value={item.notes}
                        onChange={(e) => updateItemNotes(item.menuItemId, e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col space-y-2">
              <button
                onClick={handleSubmitOrder}
                disabled={orderItems.length === 0 || orderLoading}
                className={`
                  w-full py-2 rounded-md text-white ${
                    orderItems.length > 0 && !orderLoading 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {orderLoading ? 'Processing...' : 'Place Order'}
              </button>
              <button
                onClick={() => setStep(1)}
                className="w-full py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Back to Tables
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 