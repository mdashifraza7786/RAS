'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useBills, { Bill, BillUpdateData } from '@/hooks/useBills';
import { FaArrowLeft, FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaCheck, FaSpinner } from 'react-icons/fa';

interface BillPageProps {
  params: {
    id: string;
  };
}

export default function BillDetailPage({ params }: BillPageProps) {
  const billId = params.id;
  const router = useRouter();
  const { getBill, updateBill } = useBills();
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);
  
  // Fetch bill data
  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        const data = await getBill(billId);
        if (data) {
          setBill(data);
          setCashReceived(data.total);
        } else {
          setError('Bill not found');
        }
      } catch (err) {
        setError('Failed to load bill');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBill();
  }, [billId, getBill]);
  
  // Handle payment processing
  const handleProcessPayment = async () => {
    if (!bill) return;
    
    try {
      setProcessing(true);
      
      // Calculate new total with tip
      const newTotal = bill.total + tipAmount;
      
      const updateData: BillUpdateData = {
        paymentMethod,
        paymentStatus: 'paid',
        tip: tipAmount,
        total: newTotal
      };
      
      await updateBill(billId, updateData);
      
      // Navigate back to bills list
      router.push('/waiter/bills');
    } catch (err) {
      setError('Failed to process payment');
      console.error(err);
      setProcessing(false);
    }
  };
  
  // Calculate change for cash payments
  const calculateChange = () => {
    if (!bill || paymentMethod !== 'cash') return 0;
    const totalWithTip = bill.total + tipAmount;
    return cashReceived > totalWithTip ? cashReceived - totalWithTip : 0;
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !bill) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error || 'Failed to load bill'}</p>
          <button 
            onClick={() => router.back()} 
            className="mt-4 px-4 py-2 bg-red-200 text-red-700 rounded hover:bg-red-300"
          >
            Go Back
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
        <h1 className="text-2xl font-bold">Process Payment</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bill details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Bill Details</h2>
          
          <div className="mb-4 border-b pb-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Bill Number:</span>
              <span>#{bill.billNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Table:</span>
              <span>{typeof bill.table === 'string' ? 'Table' : bill.table?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{new Date(bill.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <h3 className="font-medium mb-2">Order Items</h3>
          <div className="space-y-2 mb-4">
            {bill.order && bill.order.items && bill.order.items.map((item, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.menuItem?.name || 'Item'}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>₹{bill.tax.toFixed(2)}</span>
            </div>
            {bill.discount && bill.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="text-red-600">-₹{bill.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <span>Total</span>
              <span>₹{bill.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Payment processing */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Payment</h2>
          
          {bill.paymentStatus === 'paid' ? (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg">
              <div className="flex items-center justify-center">
                <FaCheck className="mr-2" />
                <span className="font-medium">Payment Completed</span>
              </div>
              <p className="text-center mt-2">
                This bill has already been paid via {bill.paymentMethod}.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                      paymentMethod === 'cash' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaMoneyBillWave className="h-6 w-6 mb-1" />
                    <span className="text-sm">Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                      paymentMethod === 'card' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaCreditCard className="h-6 w-6 mb-1" />
                    <span className="text-sm">Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                      paymentMethod === 'upi' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaMobileAlt className="h-6 w-6 mb-1" />
                    <span className="text-sm">UPI</span>
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Tip Amount</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[5, 10, 15, 20].map(percent => {
                    const tipValue = (bill.subtotal * (percent / 100));
                    return (
                      <button
                        key={percent}
                        type="button"
                        onClick={() => setTipAmount(tipValue)}
                        className={`py-2 px-3 rounded-lg border ${
                          Math.abs(tipAmount - tipValue) < 0.01
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-sm font-bold">{percent}%</div>
                        <div className="text-xs">₹{tipValue.toFixed(2)}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                    className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Custom tip amount"
                  />
                </div>
              </div>
              
              {paymentMethod === 'cash' && (
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Cash Received</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₹</span>
                    </div>
                    <input
                      type="number"
                      min={bill.total + tipAmount}
                      step="1"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Change:</span>
                      <span className="font-medium">₹{calculateChange().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between font-bold text-blue-700">
                  <span>Final Total (with tip):</span>
                  <span>₹{(bill.total + tipAmount).toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleProcessPayment}
                disabled={processing}
                className={`w-full py-3 rounded-lg text-white font-medium ${
                  processing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  'Complete Payment'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 