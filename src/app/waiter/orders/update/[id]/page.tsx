'use client';

import { useState, useEffect, use } from 'react';
import { FaArrowLeft, FaPlus, FaSearch, FaTimesCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useMenuItems, MenuItem } from '@/hooks/useMenuItems';
import { toast } from 'react-hot-toast';

interface OrderItem {
  _id: string;
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  status: string;
}

interface Order {
  _id: string;
  orderNumber: number;
  table: {
    _id: string;
    number: number;
    name: string;
  };
  items: OrderItem[];
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: string;
  customerCount?: number;
}

// Create a wrapper component to handle unwrapped params
function UpdateOrderContent({ id }: { id: string }) {
  const router = useRouter();
  const { menuItems, loading: menuLoading } = useMenuItems();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newOrderItems, setNewOrderItems] = useState<Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes: string;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch existing order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/waiter/orders/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch order details: ${response.status}`);
        }
        
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        toast.error('Could not load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  // Filter menu items based on search term
  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group menu items by category
  const groupedMenuItems = filteredMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);
  
  // Add item to new order items
  const addItemToOrder = (menuItem: MenuItem) => {
    const existingItem = newOrderItems.find(item => item.menuItemId === menuItem._id);
    
    if (existingItem) {
      setNewOrderItems(newOrderItems.map(item => 
        item.menuItemId === menuItem._id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setNewOrderItems([
        ...newOrderItems,
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
  
  // Remove item from new order items
  const removeItemFromOrder = (menuItemId: string) => {
    setNewOrderItems(newOrderItems.filter(item => item.menuItemId !== menuItemId));
  };
  
  // Update item quantity
  const updateItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(menuItemId);
      return;
    }
    
    setNewOrderItems(newOrderItems.map(item => 
      item.menuItemId === menuItemId 
        ? { ...item, quantity } 
        : item
    ));
  };
  
  // Update item notes
  const updateItemNotes = (menuItemId: string, notes: string) => {
    setNewOrderItems(newOrderItems.map(item => 
      item.menuItemId === menuItemId 
        ? { ...item, notes } 
        : item
    ));
  };
  
  // Calculate subtotal of new items
  const calculateSubtotal = () => {
    return newOrderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Submit new items to add to the order
  const handleSubmitItems = async () => {
    if (newOrderItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    
    if (!order) {
      toast.error('Order information is missing');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Calculate new totals
      const newItemsSubtotal = calculateSubtotal();
      const newTax = newItemsSubtotal * 0.1; // 10% tax
      
      // Prepare data - fix the format to match API expectations
      const items = newOrderItems.map(item => ({
        menuItem: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        status: 'pending',
        notes: item.notes
      }));
      
      console.log('Sending items to API:', JSON.stringify(items));
      
      // Update the order
      const response = await fetch(`/api/waiter/orders/${id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ items }) // Send just the items array as expected by API
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.error || `Failed to update order: ${response.status}`);
      }
      
      toast.success('Items added to order successfully');
      
      // Redirect back to order details
      router.push(`/waiter/orders/${id}`);
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading || menuLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <div className="ml-3">Loading...</div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-medium mb-2">Error Loading Order</h2>
          <p>Order not found or could not be loaded</p>
          <button 
            onClick={() => router.push('/waiter/orders')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Back to Orders
          </button>
        </div>
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
        <h1 className="text-2xl font-bold">
          Add Items to Order #{order.orderNumber}
        </h1>
      </div>
      
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Table</span>
            <p className="font-medium">Table #{order.table.number}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Order Status</span>
            <p className="font-medium capitalize">{order.status}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Items Count</span>
            <p className="font-medium">{order.items.length} items</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Current Total</span>
            <p className="font-medium">₹{order.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Add New Items</h2>
          
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
          <h3 className="font-medium mb-4">Items to Add</h3>
          
          {newOrderItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items selected yet</p>
          ) : (
            <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
              {newOrderItems.map(item => (
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
                        onClick={(e) => {
                          e.stopPropagation();
                          updateItemQuantity(item.menuItemId, item.quantity - 1);
                        }} 
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="mx-2 w-5 text-center">{item.quantity}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateItemQuantity(item.menuItemId, item.quantity + 1);
                        }}
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
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>New Items Subtotal:</span>
              <span>₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%):</span>
              <span>₹{(calculateSubtotal() * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>New Items Total:</span>
              <span>₹{(calculateSubtotal() * 1.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
              <span>New Order Total:</span>
              <span>₹{(order.total + calculateSubtotal() * 1.1).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <button
              onClick={handleSubmitItems}
              disabled={newOrderItems.length === 0 || isSubmitting}
              className={`
                w-full py-3 rounded-md flex justify-center items-center text-white font-medium 
                ${newOrderItems.length > 0 && !isSubmitting 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : null}
              Add Items to Order
            </button>
            
            <button
              onClick={() => router.push(`/waiter/orders/${id}`)}
              className="w-full py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that properly unwraps params using React.use
export default function UpdateOrderPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use
  const resolvedParams = use(params);
  return <UpdateOrderContent id={resolvedParams.id} />;
} 