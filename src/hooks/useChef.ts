'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/constants';

export interface OrderItem {
  _id: string;
  menuItem: {
    _id: string;
    name: string;
    preparationTime: number; 
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
  };
  quantity: number;
  notes?: string;
  status?: 'pending' | 'preparing' | 'ready';
}

export interface Order {
  _id: string;
  orderNumber: number;
  table: string | { _id: string; name: string };
  items: OrderItem[];
  status: 'pending' | 'in-progress' | 'ready' | 'completed' | 'cancelled';
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChefStats {
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  averagePreparationTime: number;
}

export const useChef = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<ChefStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch all active orders (pending + in-progress)
  const fetchActiveOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders/active`);
      setOrders(response.data.orders);
      return response.data.orders;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching active orders:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch chef dashboard stats
  const fetchChefStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/stats/chef`);
      setStats(response.data);
      return response.data;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching chef stats:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: 'in-progress' | 'ready') => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status } : order
        )
      );
      
      return response.data.order;
    } catch (err) {
      setError(err as Error);
      console.error('Error updating order status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update individual item status in an order
  const updateOrderItemStatus = useCallback(async (
    orderId: string, 
    itemId: string, 
    status: 'preparing' | 'ready'
  ) => {
    try {
      setLoading(true);
      const response = await axios.patch(`${API_URL}/orders/${orderId}/items/${itemId}/status`, { status });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order._id === orderId) {
            const updatedItems = order.items.map(item => 
              item._id === itemId ? { ...item, status } : item
            );
            return { ...order, items: updatedItems };
          }
          return order;
        })
      );
      
      return response.data.order;
    } catch (err) {
      setError(err as Error);
      console.error('Error updating order item status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch recent orders history
  const fetchOrderHistory = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders/history/chef?limit=${limit}`);
      return response.data.orders;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching order history:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get detailed order information
  const getOrderDetails = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders/${orderId}`);
      return response.data.order;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching order details:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load active orders on mount
  useEffect(() => {
    fetchActiveOrders();
    fetchChefStats();
    
    // Setup polling for active orders every 30 seconds
    const interval = setInterval(() => {
      fetchActiveOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchActiveOrders, fetchChefStats]);
  
  return {
    orders,
    stats,
    loading,
    error,
    fetchActiveOrders,
    fetchChefStats,
    updateOrderStatus,
    updateOrderItemStatus,
    fetchOrderHistory,
    getOrderDetails
  };
}; 
