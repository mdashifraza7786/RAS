'use client';

import { useState, useEffect } from 'react';
import { orderApi } from '../utils/api';

export interface OrderItem {
  _id?: string;
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  status: 'pending' | 'cooking' | 'ready' | 'served' | 'cancelled';
}

export interface Order {
  _id: string;
  orderNumber: number;
  table: string;
  items: OrderItem[];
  status: 'pending' | 'in-progress' | 'ready' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'upi';
  customerName?: string;
  customerPhone?: string;
  waiter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export type OrderFilters = {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

/**
 * Hook for fetching and managing orders
 */
export function useOrders(initialFilters: OrderFilters = {}) {
  const [ordersData, setOrdersData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<OrderFilters>(initialFilters);

  // Function to fetch orders with filters
  const fetchOrders = async (filterParams: OrderFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      
      if (filterParams.status) {
        params.append('status', filterParams.status);
      }
      
      if (filterParams.startDate) {
        params.append('startDate', filterParams.startDate);
      }
      
      if (filterParams.endDate) {
        params.append('endDate', filterParams.endDate);
      }
      
      if (filterParams.page) {
        params.append('page', filterParams.page.toString());
      }
      
      if (filterParams.limit) {
        params.append('limit', filterParams.limit.toString());
      }
      
      const data = await orderApi.getAll(params);
      setOrdersData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
    } finally {
      setLoading(false);
    }
  };

  // Load orders on initial mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [filters]);

  // Function to update filters and refetch
  const updateFilters = (newFilters: OrderFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Function to get a single order by ID
  const getOrder = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await orderApi.getById(orderId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch order'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new order
  const createOrder = async (orderData: Omit<Order, '_id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newOrder = await orderApi.create(orderData);
      // Refresh orders after creation
      await fetchOrders();
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create order'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to update an order
  const updateOrder = async (orderId: string, data: Partial<Order>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedOrder = await orderApi.update(orderId, data);
      // Refresh orders after update
      await fetchOrders();
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update order'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to delete an order (manager only)
  const deleteOrder = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      await orderApi.delete(orderId);
      // Refresh orders after deletion
      await fetchOrders();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete order'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    orders: ordersData?.orders || [],
    pagination: ordersData?.pagination,
    loading,
    error,
    filters,
    fetchOrders,
    updateFilters,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder
  };
} 