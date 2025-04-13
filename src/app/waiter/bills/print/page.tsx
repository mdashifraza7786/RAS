'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { FaPrint, FaArrowLeft, FaUtensils } from 'react-icons/fa';

// Define the Order interface for proper typing
interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  status: string;
  notes?: string;
}

interface OrderTable {
  _id: string;
  number: number;
  name?: string;
}

interface Order {
  _id: string;
  orderNumber: number;
  table?: OrderTable;
  items: OrderItem[];
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PrintReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantInfo] = useState({
    name: 'GOURMET DELIGHT',
    address: '123 Foodie Street, Culinary Avenue',
    city: 'Flavorville, FV 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@gourmetdelight.com',
    website: 'www.gourmetdelight.com',
    gst: 'GSTIN: 22AAAAA0000A1Z5'
  });
  
  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/waiter/orders/${orderId}`);
        setOrder(response.data);
        
        // If order is paid, ensure the table is updated to available
        if (response.data.paymentStatus === 'paid' && response.data.table?._id) {
          try {
            await axios.patch(`/api/waiter/orders/${orderId}/status`, {
              paymentStatus: 'paid',
              paymentMethod: response.data.paymentMethod || 'cash'
            });
            console.log('Table status updated to available');
          } catch (tableErr) {
            console.error('Error updating table status:', tableErr);
          }
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);
  
  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-medium mb-2">Error</h2>
          <p>{error || 'Order not found'}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-600 text-white rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const calculateSubtotal = (): number => {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const generateInvoiceNumber = (): string => {
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    return `INV-${dateStr}-${order.orderNumber}`;
  };
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Print controls - not shown when printing */}
      <div className="print:hidden mb-6 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-600 text-white rounded-md flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
        >
          <FaPrint className="mr-2" /> Print Receipt
        </button>
      </div>
      
      {/* Receipt content */}
      <div className="bg-white p-8 shadow-lg rounded-lg print:shadow-none print:p-0 font-mono text-sm print:text-xs">
        {/* Header */}
        <div className="text-center mb-4 border-b border-dashed pb-4">
          <div className="flex justify-center mb-2">
            <FaUtensils className="text-3xl text-gray-800" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider uppercase">
            {restaurantInfo.name}
          </h1>
          <p className="mt-1">{restaurantInfo.address}</p>
          <p>{restaurantInfo.city}</p>
          <p>Tel: {restaurantInfo.phone}</p>
          <p className="mt-1 text-xs">{restaurantInfo.gst}</p>
        </div>
        
        {/* Receipt Title */}
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg tracking-widest border-2 border-black inline-block px-4 py-0.5">
            BILL / INVOICE
          </h2>
        </div>
        
        {/* Order Info */}
        <div className="grid grid-cols-2 gap-1 mb-4">
          <div>
            <p><span className="font-bold">BILL #:</span> {generateInvoiceNumber()}</p>
            <p><span className="font-bold">ORDER #:</span> {order.orderNumber}</p>
            <p><span className="font-bold">TABLE:</span> {order.table?.number || 'T/A'}</p>
          </div>
          <div className="text-right">
            <p><span className="font-bold">DATE:</span> {formatDate(order.createdAt)}</p>
            <p>
              <span className="font-bold">STATUS:</span> 
              <span className={order.paymentStatus === 'paid' ? 'font-bold' : ''}>
                {order.paymentStatus === 'paid' ? ' PAID' : ' PENDING'}
              </span>
            </p>
            {order.paymentMethod && (
              <p><span className="font-bold">PAYMENT:</span> {order.paymentMethod.toUpperCase()}</p>
            )}
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t-2 border-b-2 border-black py-0.5 mb-2">
          <p className="text-center font-bold tracking-wider">ORDER DETAILS</p>
        </div>
        
        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse leading-tight">
            <thead>
              <tr className="border-b border-dashed">
                <th className="py-1 text-left font-bold">#</th>
                <th className="py-1 text-left font-bold">ITEM</th>
                <th className="py-1 text-center font-bold">QTY</th>
                <th className="py-1 text-right font-bold">RATE</th>
                <th className="py-1 text-right font-bold">AMT</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b border-dotted">
                  <td className="py-1">{index + 1}</td>
                  <td className="py-1 truncate" style={{ maxWidth: '200px' }}>{item.name}</td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-right">{item.price.toFixed(2)}</td>
                  <td className="py-1 text-right">{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Dotted separator */}
        <div className="border-b border-dotted mb-2"></div>
        
        {/* Totals */}
        <div className="mb-4 ml-auto" style={{ maxWidth: '200px' }}>
          <div className="flex justify-between">
            <span className="font-bold">SUBTOTAL:</span>
            <span>{calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">CGST (5%):</span>
            <span>{(order.tax / 2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">SGST (5%):</span>
            <span>{(order.tax / 2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 border-t border-b border-dotted font-bold mt-1">
            <span>GRAND TOTAL:</span>
            <span>{order.total.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Amount in Words */}
        <div className="mb-4 border-b border-dotted pb-2">
          <p className="font-bold">AMOUNT IN WORDS:</p>
          <p>{numberToWords(order.total)} Rupees Only</p>
        </div>
        
        {/* Footer */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div>
            <p className="font-bold mb-1">TERMS & CONDITIONS:</p>
            <ul className="space-y-0.5">
              <li>* All prices include GST</li>
              <li>* No refunds on consumed items</li>
              <li>* This is a computer generated bill</li>
            </ul>
          </div>
          <div className="text-right">
            <p className="font-bold mb-1">AUTHORIZED SIGNATORY</p>
            <div className="h-6"></div>
            <p className="text-xs">For {restaurantInfo.name}</p>
          </div>
        </div>
        
        {/* Dotted separator */}
        <div className="border-b border-dotted mb-2"></div>
        
        <div className="text-center text-xs">
          <p className="font-bold">THANK YOU FOR YOUR VISIT!</p>
          <p className="mt-1">Please Come Again</p>
          <p className="mt-1">{restaurantInfo.website}</p>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert number to words
function numberToWords(num: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  function convertLessThanOneThousand(n: number): string {
    if (n < 20) {
      return units[n];
    }
    const digit = n % 10;
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (digit ? ' ' + units[digit] : '');
    }
    const hundreds = Math.floor(n / 100);
    return units[hundreds] + ' Hundred' + (n % 100 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
  }
  
  // We'll handle up to 1 Lakh (100,000) for simplicity
  let totalRupees = Math.floor(num);
  const paise = Math.round((num - totalRupees) * 100);
  
  let result = '';
  
  if (totalRupees >= 100000) {
    result += convertLessThanOneThousand(Math.floor(totalRupees / 100000)) + ' Lakh ';
    totalRupees %= 100000;
  }
  
  if (totalRupees >= 1000) {
    result += convertLessThanOneThousand(Math.floor(totalRupees / 1000)) + ' Thousand ';
    totalRupees %= 1000;
  }
  
  if (totalRupees > 0) {
    result += convertLessThanOneThousand(totalRupees);
  }
  
  result = result.trim();
  
  if (paise > 0) {
    result += ' and ' + convertLessThanOneThousand(paise) + ' Paise';
  }
  
  return result;
} 