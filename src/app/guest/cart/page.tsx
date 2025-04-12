'use client';

import { useState, useEffect } from 'react';
import { useGuest } from '@/hooks/useGuests';
import { useRouter } from 'next/navigation';
import { FaShoppingCart, FaPlus, FaMinus, FaTrash, FaArrowLeft, FaUtensils, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

export default function GuestCartPage() {
  const router = useRouter();
  const { tableId, placeOrder } = useGuest();
  
  const [cartItems, setCartItems] = useState<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  }[]>([]);
  
  const [customerName, setCustomerName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load cart items from localStorage
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
  
  // Save cart items to localStorage when they change
  useEffect(() => {
    localStorage.setItem('guest_cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Update item quantity
  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    
    setCartItems(
      cartItems.map(item => 
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };
  
  // Remove item from cart
  const removeItem = (menuItemId: string) => {
    setCartItems(cartItems.filter(item => item.menuItemId !== menuItemId));
  };
  
  // Update item notes
  const updateNotes = (menuItemId: string, notes: string) => {
    setCartItems(
      cartItems.map(item => 
        item.menuItemId === menuItemId ? { ...item, notes } : item
      )
    );
  };
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Calculate tax (assuming 5% tax)
  const calculateTax = () => {
    return calculateSubtotal() * 0.05;
  };
  
  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };
  
  // Handle order submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableId) {
      setError('No table selected. Please scan the QR code at your table again.');
      return;
    }
    
    if (cartItems.length === 0) {
      setError('Your cart is empty. Please add some items before placing an order.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const orderData = {
        items: cartItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes
        })),
        customerName: customerName || undefined,
        specialInstructions: specialInstructions || undefined
      };
      
      await placeOrder(orderData);
      
      // Clear cart and show success
      setCartItems([]);
      localStorage.removeItem('guest_cart');
      setOrderSuccess(true);
      
      // After 3 seconds, redirect to order tracking page
      setTimeout(() => {
        router.push('/guest/orders');
      }, 3000);
      
    } catch (err) {
      console.error('Failed to place order:', err);
      setError('Failed to place your order. Please try again or call a waiter for assistance.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <Link href="/guest/menu" className="mr-3 text-white">
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold flex items-center">
            <FaShoppingCart className="mr-2" /> Your Order
          </h1>
        </div>
      </header>
      
      <div className="container mx-auto p-4">
        {/* Order success message */}
        {orderSuccess ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-8 rounded mb-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Order Placed Successfully!</h2>
            <p className="mb-4">Your order has been sent to the kitchen.</p>
            <p className="text-sm">Redirecting to order tracking page...</p>
            <div className="mt-4">
              <FaSpinner className="animate-spin text-green-600 text-3xl mx-auto" />
            </div>
          </div>
        ) : (
          <>
            {/* Error message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {/* Empty cart */}
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FaShoppingCart className="text-gray-300 text-5xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Add some delicious items from our menu!</p>
                <Link
                  href="/guest/menu"
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items list */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h2 className="text-lg font-semibold">Order Items</h2>
                    </div>
                    
                    <ul className="divide-y divide-gray-200">
                      {cartItems.map((item) => (
                        <li key={item.menuItemId} className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="mb-2 sm:mb-0">
                              <h3 className="font-semibold">{item.name}</h3>
                              <p className="text-gray-600 text-sm">₹{item.price.toFixed(2)}</p>
                            </div>
                            
                            <div className="flex items-center">
                              <button
                                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                className="text-gray-500 hover:text-indigo-600 p-1"
                              >
                                <FaMinus />
                              </button>
                              <span className="mx-2 w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                className="text-gray-500 hover:text-indigo-600 p-1"
                              >
                                <FaPlus />
                              </button>
                              <button
                                onClick={() => removeItem(item.menuItemId)}
                                className="ml-4 text-red-500 hover:text-red-700 p-1"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <textarea
                              placeholder="Special instructions for this item..."
                              value={item.notes || ''}
                              onChange={(e) => updateNotes(item.menuItemId, e.target.value)}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                              rows={1}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Order summary and checkout */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>₹{calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (5%)</span>
                        <span>₹{calculateTax().toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <form onSubmit={handleSubmitOrder}>
                      <div className="mb-4">
                        <label htmlFor="customerName" className="block text-gray-700 text-sm font-medium mb-2">
                          Your Name (optional)
                        </label>
                        <input
                          type="text"
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter your name"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="specialInstructions" className="block text-gray-700 text-sm font-medium mb-2">
                          Special Instructions (optional)
                        </label>
                        <textarea
                          id="specialInstructions"
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows={3}
                          placeholder="Any allergies or special requests..."
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting || cartItems.length === 0}
                        className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaUtensils className="mr-2" />
                            Place Order
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 