'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowLeft, FaReceipt, FaTimes, FaCheck, FaPrint, FaWhatsapp, FaEnvelope, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import useBills from '@/hooks/useBills';
import axios from 'axios';

// Types
interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  status: string;
  notes?: string;
}

interface Order {
  _id: string;
  orderNumber: number;
  items: OrderItem[];
  table: {
    _id: string;
    number: number;
    name: string;
  };
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: string;
  createdAt: string;
  customerCount?: number;
}

// Component
export default function CreateBillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { createBill } = useBills();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billGenerated, setBillGenerated] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<any>(null);
  
  // Fetch order details
  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/waiter/orders/${orderId}`);
        setOrder(response.data);
        
        // If order has customer details, pre-fill them
        if (response.data.customerName) {
          setCustomerName(response.data.customerName);
        }
        
        if (response.data.customerPhone) {
          setCustomerPhone(response.data.customerPhone);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
        toast.error('Could not load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  // Calculate final amount
  const calculateFinalAmount = () => {
    if (!order) return 0;
    
    const subtotal = order.subtotal;
    const tax = order.tax;
    const totalWithoutTipAndDiscount = subtotal + tax;
    const finalAmount = totalWithoutTipAndDiscount + tipAmount - discountAmount;
    return finalAmount;
  };
  
  // Calculate change (for cash payments)
  const [cashReceived, setCashReceived] = useState<number>(0);
  const calculateChange = () => {
    if (paymentMethod !== 'cash') return 0;
    const finalAmount = calculateFinalAmount();
    return cashReceived > finalAmount ? cashReceived - finalAmount : 0;
  };
  
  // Handle payment processing
  const processPayment = async (markAsPaid: boolean) => {
    if (!order) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare bill data
      const billData = {
        order: order._id,
        subtotal: order.subtotal,
        tax: order.tax,
        tip: tipAmount,
        discount: discountAmount,
        paymentMethod,
        paymentStatus: markAsPaid ? 'paid' : 'pending' as 'paid' | 'pending',
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined
      };
      
      // Create bill
      const bill = await createBill(billData);
      
      // Show success message
      toast.success(`Bill ${markAsPaid ? 'created and marked as paid' : 'created'} successfully`);
      
      // Store the generated bill to show receipt
      setGeneratedBill(bill);
      setBillGenerated(true);
      setShowReceipt(true);
      
    } catch (err) {
      console.error('Error creating bill:', err);
      toast.error('Failed to create bill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset state and go back after printing receipt
  const finishPayment = () => {
    router.push('/waiter/bills');
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-3xl text-blue-500 mb-4" />
        <p>Loading order details...</p>
      </div>
    );
  }
  
  // Error state
  if (error || !order) {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link href="/waiter/bills" className="mr-4 text-gray-600 hover:text-gray-800">
          <FaArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Process Payment</h1>
      </div>
      
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-medium mb-2">Error</h2>
          <p>{error || 'Failed to load order details'}</p>
          <Link 
            href="/waiter/orders"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
            <button 
            onClick={() => router.back()}
            className="mr-3 bg-gray-200 p-2 rounded-full"
            >
            <FaArrowLeft />
            </button>
          <h1 className="text-2xl font-bold">Finalize Bill</h1>
          </div>
          
        <div className="flex items-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
          </span>
        </div>
            </div>
            
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Order #:</span>
              <span>{order.orderNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Table:</span>
              <span>#{order.table?.number || 'N/A'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Date:</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>
          
          <h2 className="text-lg font-medium mb-3 border-b pb-2">Items</h2>
          <div className="max-h-80 overflow-y-auto mb-6">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="py-2 px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 px-3">{item.name}</td>
                    <td className="py-2 px-3 text-center">{item.quantity}</td>
                    <td className="py-2 px-3 text-right">₹{item.price.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <form onSubmit={() => processPayment(true)}>
            <h2 className="text-lg font-medium mb-3 border-b pb-2">Payment Details</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'upi')}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
                </div>
                
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tip Amount
                </label>
                      <input
                        type="number"
                  name="tip"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                </div>
                
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Amount
                </label>
                    <input
                      type="number"
                  name="discount"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
                
            <div className="flex justify-end">
                      <button
                type="button"
                onClick={() => router.back()}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                      >
                Cancel
                      </button>
              
                      <button
                type="submit"
                disabled={isSubmitting || billGenerated}
                className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                    Processing...
                  </span>
                ) : (
                  <>
                    <FaCheck className="mr-2" /> Mark as Paid & Print
                  </>
                )}
              </button>
                  </div>
          </form>
                </div>
                
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium mb-4 pb-2 border-b">Bill Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>₹{order.tax.toFixed(2)}</span>
                  </div>
                  {tipAmount > 0 && (
              <div className="flex justify-between">
                <span>Tip:</span>
                <span>₹{tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-gray-200 font-semibold">
              <span>Total:</span>
              <span>₹{calculateFinalAmount().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <FaReceipt className="text-blue-500 mr-2" />
              <h3 className="font-medium text-blue-800">Payment Instructions</h3>
            </div>
            <p className="text-sm text-blue-600">
              Marking as paid will update the order status and generate a printable receipt.
              This cannot be undone, so please verify all details before proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 