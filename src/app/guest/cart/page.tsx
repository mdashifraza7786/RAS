'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft, 
  FaTrash, 
  FaPlus, 
  FaMinus, 
  FaCreditCard,
  FaMoneyBill,
  FaUtensils,
  FaUser,
  FaPhoneAlt,
  FaRegCheckCircle
} from 'react-icons/fa';

// Types
interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isVegetarian: boolean;
  isSpicy: boolean;
  isPopular: boolean;
}

interface GuestInfo {
  name: string;
  phone: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface OrderDetails {
  tableNumber: string;
  specialInstructions: string;
  paymentMethod: 'cash' | 'card' | 'upi';
}

export default function CartPage() {
  const router = useRouter();
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    tableNumber: '',
    specialInstructions: '',
    paymentMethod: 'cash'
  });
  const [tableNumberError, setTableNumberError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Load guest info and cart from localStorage on component mount
  useEffect(() => {
    const storedGuestInfo = localStorage.getItem('guestInfo');
    if (storedGuestInfo) {
      setGuestInfo(JSON.parse(storedGuestInfo));
    } else {
      // Redirect to guest login if no guest info found
      router.push('/guest');
    }

    const storedCart = localStorage.getItem('guestCart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [router]);

  // Cart functions
  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const removeItem = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('guestCart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('guestCart');
      if (orderPlaced) {

        router.push('/guest/menu');
      }
    }
  }, [cart, orderPlaced, router]);

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const taxes = subtotal * 0.05; // 5% tax
  const total = subtotal + taxes;

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({ ...prev, [name]: value }));
    
    // Clear error when table number is filled
    if (name === 'tableNumber' && value.trim() !== '') {
      setTableNumberError('');
    }
  };

  // Place order
  const placeOrder = () => {
    // Validate table number
    if (!orderDetails.tableNumber.trim()) {
      setTableNumberError('Please enter your table number');
      return;
    }

    setIsSubmitting(true);

    // In a real app, you would make an API call to create the order
    // For now, simulate a delay and then show success
    setTimeout(() => {
      const generatedOrderId = Math.floor(1000 + Math.random() * 9000).toString();
      setOrderId(generatedOrderId);
      setOrderPlaced(true);
      setIsSubmitting(false);
      // Clear cart after order is placed
      localStorage.removeItem('guestCart');
    }, 1500);
  };

  // Go back to menu
  const goBackToMenu = () => {
    router.push('/guest/menu');
  };

  // Start a new order
  const startNewOrder = () => {
    setCart([]);
    setOrderPlaced(false);
    router.push('/guest/menu');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <nav className="bg-white shadow-md py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={goBackToMenu}
                className="text-gray-600 hover:text-amber-500 mr-3"
              >
                <FaArrowLeft size={18} />
              </button>
              <div className="text-xl font-semibold text-gray-800 flex items-center">
                <FaUtensils className="text-amber-500 mr-2" />
                <span>{orderPlaced ? `Order #${orderId}` : 'Your Cart'}</span>
              </div>
            </div>
            
            {guestInfo && !orderPlaced && (
              <div className="hidden md:flex items-center text-sm text-gray-600">
                <div className="flex items-center mr-4">
                  <FaUser className="text-gray-400 mr-1" />
                  <span>{guestInfo.name}</span>
                </div>
                <div className="flex items-center">
                  <FaPhoneAlt className="text-gray-400 mr-1" />
                  <span>{guestInfo.phone}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {orderPlaced ? (
          // Order confirmation
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaRegCheckCircle className="text-green-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">Your order #{orderId} has been received and is being prepared.</p>
            
            <div className="bg-amber-50 rounded-lg p-4 max-w-md mx-auto mb-6">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-800">Order Details:</h3>
                <p className="text-gray-600">Table: {orderDetails.tableNumber}</p>
                <p className="text-gray-600">Payment: {
                  orderDetails.paymentMethod === 'cash' ? 'Cash' : 
                  orderDetails.paymentMethod === 'card' ? 'Card' : 'UPI'
                }</p>
              </div>
              
              {orderDetails.specialInstructions && (
                <div>
                  <h3 className="font-semibold text-gray-800">Special Instructions:</h3>
                  <p className="text-gray-600">{orderDetails.specialInstructions}</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={startNewOrder}
              className="bg-amber-500 text-white px-6 py-3 rounded-md font-medium hover:bg-amber-600"
            >
              Start New Order
            </button>
          </div>
        ) : (
          // Cart page
          <>
            {cart.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-800">Cart Items</h2>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {cart.map((item) => (
                        <div key={item.id} className="p-4 flex items-center">
                          <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            <div 
                              className="h-full w-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${item.image || '/images/placeholder.jpg'})` }}
                            ></div>
                          </div>
                          
                          <div className="ml-4 flex-grow">
                            <div className="flex justify-between">
                              <h3 className="text-base font-medium text-gray-800">{item.name}</h3>
                              <span className="font-medium text-amber-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                          </div>
                          
                          <div className="ml-4 flex items-center space-x-2">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
                            >
                              <FaMinus size={10} />
                            </button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
                            >
                              <FaPlus size={10} />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="ml-4 p-2 text-red-500 hover:text-red-700"
                            aria-label="Remove item"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      onClick={goBackToMenu}
                      className="text-amber-600 hover:text-amber-700 font-medium flex items-center"
                    >
                      <FaArrowLeft className="mr-2" size={12} />
                      Continue Shopping
                    </button>
                  </div>
                </div>
                
                {/* Order Summary */}
                <div>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-800">Order Summary</h2>
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Taxes (5%)</span>
                          <span className="font-medium">₹{taxes.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-lg text-amber-600">₹{total.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Table Number *
                        </label>
                        <input
                          type="text"
                          id="tableNumber"
                          name="tableNumber"
                          value={orderDetails.tableNumber}
                          onChange={handleInputChange}
                          className={`w-full border ${tableNumberError ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="Enter your table number"
                        />
                        {tableNumberError && <p className="mt-1 text-sm text-red-500">{tableNumberError}</p>}
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                          Special Instructions (Optional)
                        </label>
                        <textarea
                          id="specialInstructions"
                          name="specialInstructions"
                          value={orderDetails.specialInstructions}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="Any special preferences or allergies..."
                        ></textarea>
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <label className={`border ${orderDetails.paymentMethod === 'cash' ? 'border-amber-500 bg-amber-50' : 'border-gray-300'} rounded-md p-3 text-center cursor-pointer flex flex-col items-center justify-center`}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cash"
                              checked={orderDetails.paymentMethod === 'cash'}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <FaMoneyBill className={`text-xl mb-1 ${orderDetails.paymentMethod === 'cash' ? 'text-amber-500' : 'text-gray-500'}`} />
                            <span className="text-sm">Cash</span>
                          </label>
                          
                          <label className={`border ${orderDetails.paymentMethod === 'card' ? 'border-amber-500 bg-amber-50' : 'border-gray-300'} rounded-md p-3 text-center cursor-pointer flex flex-col items-center justify-center`}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="card"
                              checked={orderDetails.paymentMethod === 'card'}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <FaCreditCard className={`text-xl mb-1 ${orderDetails.paymentMethod === 'card' ? 'text-amber-500' : 'text-gray-500'}`} />
                            <span className="text-sm">Card</span>
                          </label>
                          
                          <label className={`border ${orderDetails.paymentMethod === 'upi' ? 'border-amber-500 bg-amber-50' : 'border-gray-300'} rounded-md p-3 text-center cursor-pointer flex flex-col items-center justify-center`}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="upi"
                              checked={orderDetails.paymentMethod === 'upi'}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <svg 
                              viewBox="0 0 24 24" 
                              width="24" 
                              height="24" 
                              className={`mb-1 ${orderDetails.paymentMethod === 'upi' ? 'text-amber-500' : 'text-gray-500'}`}
                              fill="currentColor"
                            >
                              <path d="M12 0L1.04 6v12L12 24l10.96-6V6L12 0zm-1.04 14.12l-4-4 1.44-1.44 2.56 2.56 6.56-6.56 1.44 1.44-8 8z" />
                            </svg>
                            <span className="text-sm">UPI</span>
                          </label>
                        </div>
                      </div>
                      
                      <button
                        onClick={placeOrder}
                        disabled={isSubmitting}
                        className="w-full bg-amber-500 text-white py-3 rounded-md font-medium hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Processing...' : 'Place Order'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-amber-500 mb-4">
                  <svg className="mx-auto w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Looks like you haven&apos;t added any items to your cart yet.</p>
                <button 
                  onClick={goBackToMenu}
                  className="bg-amber-500 text-white px-6 py-2 rounded-md font-medium hover:bg-amber-600"
                >
                  Browse Menu
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 