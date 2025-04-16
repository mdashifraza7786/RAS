'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaHistory,
  FaArrowLeft,
  FaEdit,
  FaSpinner
} from 'react-icons/fa';
import Link from 'next/link';
import { customerApi } from '@/utils/api';

interface Bill {
  _id: string;
  billNumber: number;
  order: {
    _id: string;
    orderNumber: number;
    status: string;
  };
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  customerName?: string;
  customerPhone?: string;
  customer?: string;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  visits: number;
  totalSpent: number;
  lastVisit: string;
  preferences?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerWithHistory {
  customer: Customer;
  recentBills: Bill[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [customerData, setCustomerData] = useState<CustomerWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching customer data with ID:', customerId);
        const data = await customerApi.getById(customerId, true);
        console.log('Customer data response:', data);
        setCustomerData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch customer details'));
        console.error('Error fetching customer details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error loading customer details. Please try again.</p>
          <p className="text-sm">{error.message}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Customers
        </button>
      </div>
    );
  }

  if (!customerData || !customerData.customer) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>Customer not found.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Customers
        </button>
      </div>
    );
  }

  const { customer, recentBills } = customerData;
  
  // Format date 
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold">Customer Details</h1>
      </div>

      {/* Customer info card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row">
          {/* Customer basic info */}
          <div className="md:w-1/2 mb-6 md:mb-0">
            <div className="flex items-start mb-2">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FaUser className="text-indigo-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{customer.name}</h2>
              </div>
            </div>

            <div className="flex items-center mt-4 mb-2">
              <FaPhone className="text-gray-500 mr-2" />
              <span>{customer.phone}</span>
            </div>
            
            {customer.email && (
              <div className="flex items-center mb-2">
                <FaEnvelope className="text-gray-500 mr-2" />
                <span>{customer.email}</span>
              </div>
            )}
            
            <div className="flex items-center mb-2">
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <span>Customer since {formatDate(customer.createdAt)}</span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="md:w-1/2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-gray-700 font-medium mb-2">Customer Stats</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Total Visits</div>
                  <div className="text-2xl font-bold">{customer.visits}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Total Spent</div>
                  <div className="text-2xl font-bold">${customer.totalSpent.toFixed(2)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Last Visit</div>
                  <div className="font-semibold">{formatDate(customer.lastVisit)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Average Order</div>
                  <div className="font-semibold">
                    ${customer.visits > 0 
                      ? (customer.totalSpent / customer.visits).toFixed(2) 
                      : '0.00'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes and preferences */}
            {(customer.notes || customer.preferences) && (
              <div className="mt-4">
                {customer.preferences && (
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Preferences</h4>
                    <p className="text-gray-600">{customer.preferences}</p>
                  </div>
                )}
                
                {customer.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                    <p className="text-gray-600">{customer.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Edit button */}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => {/* TODO: Implement edit functionality */}}
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <FaEdit className="mr-1" />
            Edit Customer
          </button>
        </div>
      </div>

      {/* Order history */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FaHistory className="text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold">Order History</h2>
        </div>

        {recentBills && recentBills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bill.order?.orderNumber || bill.billNumber || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(bill.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${bill.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {bill.paymentMethod || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bill.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : bill.paymentStatus === 'refunded'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bill.paymentStatus || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/waiter/bills/${bill._id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <p>No order history found for this customer.</p>
          </div>
        )}
      </div>
    </div>
  );
} 