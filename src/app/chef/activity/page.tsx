'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaBell,
  FaUtensils,
  FaFireAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHamburger,
  FaBoxes,
  FaSpinner,
  FaExclamationCircle,
  FaArrowLeft,
  FaArrowRight,
  FaSync
} from 'react-icons/fa';
import axios from 'axios';
import Link from 'next/link';

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

export default function ChefActivityPage() {
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
      const response = await axios.get(`/api/chef/activity?page=${page}&limit=${pagination.limit}`);
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
      case 'order_new':
        return <FaBell className="h-6 w-6 text-blue-500" />;
      case 'order_cooking':
        return <FaFireAlt className="h-6 w-6 text-orange-500" />;
      case 'order_ready':
        return <FaCheckCircle className="h-6 w-6 text-green-500" />;
      case 'order_completed':
        return <FaCheckCircle className="h-6 w-6 text-indigo-500" />;
      case 'order_cancelled':
        return <FaExclamationCircle className="h-6 w-6 text-red-500" />;
      case 'inventory_low':
        return <FaExclamationTriangle className="h-6 w-6 text-red-500" />;
      case 'inventory_update':
        return <FaBoxes className="h-6 w-6 text-gray-500" />;
      case 'menu_update':
        return <FaHamburger className="h-6 w-6 text-amber-500" />;
      default:
        return <FaUtensils className="h-6 w-6 text-gray-400" />;
    }
  };

  // Helper function to get background color for each activity type
  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'order_new':
        return 'bg-blue-50';
      case 'order_cooking':
        return 'bg-orange-50';
      case 'order_ready':
        return 'bg-green-50';
      case 'order_completed':
        return 'bg-indigo-50';
      case 'order_cancelled':
        return 'bg-red-50';
      case 'inventory_low':
        return 'bg-red-50';
      case 'inventory_update':
        return 'bg-gray-50';
      case 'menu_update':
        return 'bg-amber-50';
      default:
        return 'bg-gray-50';
    }
  };
  
  // Helper function to determine if we should show a detail link
  const shouldShowDetailLink = (type: string) => {
    return type.startsWith('order_') || type === 'inventory_low';
  };
  
  // Helper function to get the detail link by activity type
  const getDetailLink = (activity: Activity) => {
    if (activity.type.startsWith('order_') && activity.details?.orderId) {
      return `/chef/orders/${activity.details.orderId}`;
    } else if (activity.type === 'inventory_low') {
      return '/chef/inventory';
    } else if (activity.type === 'menu_update') {
      return '/chef/menu';
    }
    return '#';
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kitchen Activity</h1>
          <p className="text-gray-600">View all order prep, inventory, and menu updates</p>
        </div>
        
        <button 
          onClick={() => fetchActivities(pagination.page)}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <FaSync className="mr-2" />
          Refresh
        </button>
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
            <div className="space-y-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`${getActivityBgColor(activity.type)} rounded-lg shadow-sm p-4 transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-start">
                    <div className="mr-4">
                      <div className="p-3 bg-white rounded-full shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-gray-800">{activity.action}</h3>
                        <span className="text-sm text-gray-500">{activity.timeSince}</span>
                      </div>
                      
                      {activity.details && (
                        <div className="mt-2">
                          {activity.type.startsWith('order_') && (
                            <div className="flex items-center">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                activity.details.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                activity.details.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                                activity.details.status === 'ready' ? 'bg-green-100 text-green-800' :
                                activity.details.status === 'completed' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.details.status}
                              </span>
                              {activity.details.items && (
                                <span className="text-sm text-gray-600 ml-2">
                                  {activity.details.items} {activity.details.items === 1 ? 'item' : 'items'}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {activity.type === 'inventory_low' && (
                            <div className="text-sm text-red-600">
                              Current: {activity.details.quantity} | Threshold: {activity.details.threshold}
                            </div>
                          )}
                          
                          {activity.type === 'inventory_update' && !activity.details.isLow && (
                            <div className="text-sm text-gray-600">
                              Quantity: {activity.details.quantity}
                            </div>
                          )}
                          
                          {activity.type === 'menu_update' && (
                            <div className="text-sm text-gray-600">
                              Category: {activity.details.category} | {activity.details.available ? 'Available' : 'Unavailable'}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {shouldShowDetailLink(activity.type) && (
                        <div className="mt-3">
                          <Link 
                            href={getDetailLink(activity)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            View Details →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {pagination.totalPages > 1 && (
                <div className="mt-6 bg-white rounded-lg shadow px-6 py-4 flex items-center justify-between">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="flex items-center text-indigo-600 disabled:text-gray-400"
                  >
                    <FaArrowLeft className="w-4 h-4 mr-2" />
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
                    <FaArrowRight className="w-4 h-4 ml-2" />
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