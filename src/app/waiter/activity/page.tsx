'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaReceipt, 
  FaUtensils, 
  FaClock, 
  FaSpinner, 
  FaExclamationCircle,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';
import axios from 'axios';

interface Activity {
  id: string;
  type: string;
  action: string;
  timeSince: string;
  details?: any;
}

interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export default function WaiterActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 0
  });

  const fetchActivities = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/waiter/activity?page=${page}&limit=${pagination.limit}`);
      setActivities(response.data.activities);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchActivities(newPage);
    }
  };

  // Helper function to get the icon for an activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order_ready':
        return <FaBell className="text-green-500" />;
      case 'order':
        return <FaUtensils className="text-blue-500" />;
      case 'bill_request':
        return <FaBell className="text-amber-500" />;
      case 'payment':
        return <FaReceipt className="text-indigo-500" />;
      case 'table':
        return <FaUtensils className="text-purple-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Activity History</h1>
        <p className="text-gray-600">View your recent activities and updates</p>
      </div>

      {loading && activities.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <div className="flex">
            <FaExclamationCircle className="text-red-500 w-5 h-5 mr-3" />
            <div>
              <p className="text-red-800">{error}</p>
              <button 
                onClick={() => fetchActivities(pagination.page)} 
                className="mt-2 text-red-600 hover:text-red-800 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {activities.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-500 text-lg">No activity history found</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">All Activities</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {activities.map((activity) => (
                  <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500 mt-1">{activity.timeSince}</p>
                        
                        {activity.details && (
                          <div className="mt-2 text-sm">
                            {activity.type === 'order' && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {activity.details.items} items • {activity.details.status}
                              </span>
                            )}
                            
                            {activity.type === 'payment' && (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                activity.details.status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {activity.details.status}
                              </span>
                            )}
                            
                            {activity.type === 'table' && (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                activity.details.status === 'available' 
                                  ? 'bg-green-100 text-green-800' 
                                  : activity.details.status === 'occupied'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.details.status}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="flex items-center text-indigo-600 disabled:text-gray-400"
                  >
                    <FaArrowLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="flex items-center text-indigo-600 disabled:text-gray-400"
                  >
                    Next
                    <FaArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 