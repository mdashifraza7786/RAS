'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';
import { API_URL } from '@/config/constants';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [isValidatingTable, setIsValidatingTable] = useState(false);

  const handleQuantityChange = (menuItemId: string, newQuantity: number) => {
    updateQuantity(menuItemId, newQuantity);
  };

  const handleRemoveItem = (menuItemId: string) => {
    removeItem(menuItemId);
    toast.success('Item removed from cart');
  };

  const validateTableNumber = async (number: string) => {
    try {
      setIsValidatingTable(true);
      const response = await axios.get(`${API_URL}/tables/${number}/availability`);
      return response.data.isAvailable;
    } catch (error) {
      console.error('Error validating table:', error);
      return false;
    } finally {
      setIsValidatingTable(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!tableNumber.trim()) {
      toast.error('Please enter your table number');
      return;
    }

    try {
      setIsSubmitting(true);

      // Validate table number first
      const isTableValid = await validateTableNumber(tableNumber);
      if (!isTableValid) {
        toast.error('Invalid table number. Please check and try again.');
        return;
      }

      // Get guest info from localStorage
      const guestInfo = localStorage.getItem('guestInfo');
      if (!guestInfo) {
        router.push('/guest');
        return;
      }

      const { name, phone } = JSON.parse(guestInfo);

      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: ''
        })),
        customerName: name,
        customerPhone: phone,
        specialInstructions,
        tableNumber: parseInt(tableNumber)
      };

      // Place the order
      const response = await axios.post(`${API_URL}/orders/guest`, orderData);
      const { order } = response.data;

      // Clear the cart
      clearCart();

      // Store order info for tracking
      localStorage.setItem('currentOrder', JSON.stringify({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status
      }));

      // Redirect to order tracking page
      router.push(`/guest/orders/track?orderNumber=${order.orderNumber}`);
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
          <Link
            href="/guest/menu"
            className="inline-flex items-center text-amber-500 hover:text-amber-600"
          >
            <FaArrowLeft className="mr-2" />
            Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Your Cart</h2>
              <Link
                href="/guest/menu"
                className="text-amber-500 hover:text-amber-600 flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Continue Shopping
              </Link>
            </div>

            {/* Cart Items */}
            <div className="divide-y divide-gray-200">
              {items.map(item => (
                <div key={item.menuItemId} className="py-4 flex items-center">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-amber-500 font-medium">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.menuItemId, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <FaMinus className="text-gray-500" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.menuItemId, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <FaPlus className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.menuItemId)}
                      className="p-1 rounded-full hover:bg-gray-100 ml-2"
                    >
                      <FaTrash className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Number */}
            <div className="mt-6">
              <label htmlFor="table-number" className="block text-sm font-medium text-gray-700 mb-2">
                Table Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="table-number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your table number"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Please enter the number displayed on your table
              </p>
            </div>

            {/* Special Instructions */}
            <div className="mt-6">
              <label htmlFor="special-instructions" className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                id="special-instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Any special requests or notes?"
              />
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || isValidatingTable}
                className="w-full mt-4 bg-amber-500 text-white py-3 rounded-md hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Placing Order...
                  </>
                ) : isValidatingTable ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Validating Table...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 