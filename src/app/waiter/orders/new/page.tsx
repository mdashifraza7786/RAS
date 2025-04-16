'use client';

import { useState, useEffect } from 'react';
import { FaArrowLeft, FaPlus, FaSearch, FaTimesCircle, FaUtensils } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useTables } from '@/hooks/useTables';
import { useMenuItems, MenuItem } from '@/hooks/useMenuItems';
import { useOrders } from '@/hooks/useOrders';
import { toast } from 'react-hot-toast';

export default function NewOrderPage() {
  const router = useRouter();
  const { 
    tables, 
    loading: tablesLoading, 
    updateFilters, 
    refreshTables,
    updateTableStatus 
  } = useTables();
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
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  
  // Force showAll filter on load to ensure we see all tables
  useEffect(() => {
    console.log("Initializing tables load with direct API call");
    
    // Set the correct filter once
    updateFilters({ showAll: true });
    
    // Direct API call to the correct endpoint
    const fetchTablesDirectly = async () => {
      try {
        console.log("Making direct API call to /api/waiter/tables?showAll=true");
        const response = await fetch('/api/waiter/tables?showAll=true');
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        const data = await response.json();
        
        if (data && data.tables && data.tables.length > 0) {
          console.log(`API call successful: ${data.tables.length} tables loaded`);
          // No need for additional refreshes if we got data
        } else {
          console.log("API returned empty tables array, scheduling one retry");
          // Only retry once if no tables were found
          setTimeout(() => refreshTables(), 2000);
        }
      } catch (error) {
        console.error("Error in direct API call:", error);
        // Only retry once on error
        setTimeout(() => refreshTables(), 2000);
      }
    };
    
    // Execute direct API call immediately
    fetchTablesDirectly();
    
    // No need for interval timers or multiple calls
  }, []); // Empty dependency array - run once on mount
  
  // Log tables for debugging
  useEffect(() => {
    console.log(`Tables count: ${tables.length}`);
    tables.forEach(table => {
      console.log(`Table #${table.number}: ${table.status} (ID: ${table.id})`);
    });
  }, [tables]);
  
  // Auto-select table from URL param
  useEffect(() => {
    if (tables.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const tableId = urlParams.get('tableId');
      
      if (tableId) {
        const foundTable = tables.find(t => t.id === tableId);
        if (foundTable) {
          setSelectedTable(tableId);
          console.log('Auto-selected table from URL:', foundTable.number);
        }
      }
    }
  }, [tables]);
  
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
  
  const addItemToOrder = (menuItem: MenuItem) => {
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
    // Validate table selection
    if (!selectedTable) {
      toast.error("Please select a table");
      return;
    }
    
    // Validate items
    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order");
      return;
    }
    
    try {
      // Calculate totals
      const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      const tax = subtotal * 0.1; // Assuming 10% tax
      const total = subtotal + tax;
      
      // If customer details are provided, create or find a customer
      let customerId = null;
      if (customerName && customerPhone) {
        setIsCreatingCustomer(true);
        try {
          // Try to create a new customer
          console.log("Attempting to create/find customer with name:", customerName, "and phone:", customerPhone);
          const customerResponse = await fetch('/api/customers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              name: customerName,
              phone: customerPhone,
              visits: 1,
              totalSpent: 0,
              lastVisit: new Date().toISOString()
            })
          });
          
          const customerData = await customerResponse.json();
          console.log("Customer API response:", customerData);
          
          if (customerResponse.ok) {
            // New customer created successfully
            customerId = customerData._id;
            console.log("New customer created with ID:", customerId);
          } else if (customerData.customer && customerData.customer._id) {
            // Customer already exists with this phone number
            customerId = customerData.customer._id;
            console.log("Found existing customer with ID:", customerId);
          } else {
            console.error("Error response from customer API:", customerData);
            if (customerData.error) {
              toast.error(`Customer error: ${customerData.error}`);
            }
          }
        } catch (err) {
          console.error('Error creating/finding customer:', err);
          toast.error("Failed to process customer information. Continuing with order.");
          // Continue with order creation even if customer creation fails
        } finally {
          setIsCreatingCustomer(false);
        }
      }
      
      const orderData = {
        table: selectedTable,
        items: orderItems.map(item => ({
          menuItem: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          status: 'pending' as const,
          notes: item.notes
        })),
        status: 'pending' as const,
        subtotal,
        tax,
        total,
        paymentStatus: 'unpaid' as const,
        customerCount,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customer: customerId || undefined
      };
      
      console.log("Submitting order data:", JSON.stringify(orderData));
      
      // Use the new waiter-specific endpoint with credentials
      const response = await fetch('/api/waiter/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include auth cookies
        body: JSON.stringify(orderData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('API Error Response:', responseData);
        throw new Error(responseData.error || `Order creation failed with status ${response.status}`);
      }
      
      const newOrder = responseData;
      console.log("Order created successfully:", newOrder);
      toast.success("Order placed successfully");
      
      // Update table status to occupied if needed
      const selectedTableData = tables.find(t => t.id === selectedTable);
      if (selectedTableData && selectedTableData.status !== 'occupied') {
        await updateTableStatus(selectedTable, 'occupied');
      }
      
      // Redirect to orders list
      router.push('/waiter/orders');
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create order. Please try again.");
    }
  };
  
  // Show loading spinner
  if (tablesLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <div className="ml-3">Loading tables...</div>
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
          
          {/* Table Selection */}
          {tables.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center mb-8">
              <p className="text-gray-500 mb-4">No tables found. Please try refreshing or go back to the tables page.</p>
              <div className="flex space-x-3 justify-center">
                <button 
                  onClick={() => refreshTables()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Refresh Tables
                </button>
                <button 
                  onClick={() => router.push('/waiter/tables')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  View Tables Page
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {tables.map(table => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={`
                    p-4 rounded-lg border text-center
                    ${selectedTable === table.id 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${table.status === 'available' ? 'bg-green-50' : ''}
                    ${table.status === 'occupied' ? 'bg-amber-50' : ''}
                    ${table.status === 'reserved' ? 'bg-blue-50' : ''}
                    ${table.status === 'cleaning' ? 'bg-gray-50' : ''}
                  `}
                >
                  <FaUtensils className="mx-auto mb-2" />
                  <div className="font-medium">Table #{table.number}</div>
                  <div className="text-xs text-gray-500 capitalize">{table.status}</div>
                  {table.isAssigned && (
                    <div className="text-xs mt-1 text-indigo-600">Assigned to you</div>
                  )}
                  {table.status === 'occupied' && (
                    <div className="text-xs mt-1 text-blue-600">Add to existing order</div>
                  )}
                </button>
              ))}
            </div>
          )}
          
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
          
          {/* Customer Information */}
          <div className="mb-8 bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-md font-medium mb-3">Customer Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * New customer will be automatically created if phone number doesn't exist in database
            </p>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => router.push('/waiter/tables')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back to Tables
            </button>
            
            <button
              onClick={() => setStep(2)}
              disabled={!selectedTable}
              className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
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
                  <div key={item.menuItemId} className="bg-white p-3 rounded-md shadow-sm relative">
                    <button 
                      onClick={() => removeItemFromOrder(item.menuItemId)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <FaTimesCircle size={14} />
                    </button>
                    <div className="flex justify-between items-start pr-5">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">₹{item.price.toFixed(2)}</div>
                      </div>
                      <div className="flex items-center">
                        <button 
                          onClick={() => updateItemQuantity(item.menuItemId, item.quantity - 1)} 
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="mx-2 w-5 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateItemQuantity(item.menuItemId, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Add notes (optional)"
                        value={item.notes}
                        onChange={(e) => updateItemNotes(item.menuItemId, e.target.value)}
                        className="w-full p-1 text-sm border border-gray-200 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (10%):</span>
                <span>₹{(calculateTotal() * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>₹{(calculateTotal() * 1.1).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={handleSubmitOrder}
                disabled={orderItems.length === 0 || orderLoading}
                className={`
                  w-full py-3 rounded-md flex justify-center items-center text-white font-medium 
                  ${orderItems.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}
                `}
              >
                {orderLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                ) : null}
                Place Order
              </button>
              
              <button
                onClick={() => setStep(1)}
                className="w-full py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back to Table Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 