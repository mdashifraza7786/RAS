'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/constants';

export interface OrderItem {
  _id: string;
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  status: 'pending' | 'cooking' | 'ready' | 'served' | 'cancelled';
}

export interface Order {
  _id: string;
  orderNumber: number;
  table: {
    _id: string;
    number: string;
    name: string;
  };
  items: OrderItem[];
  status: 'pending' | 'in-progress' | 'ready' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'upi';
  customerName?: string;
  customerPhone?: string;
  waiter?: {
    _id: string;
    name: string;
  };
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

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useManagerOrders(initialFilters: OrderFilters = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<OrdersResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<OrderFilters>(initialFilters);

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
      
      if (filterParams.search) {
        params.append('search', filterParams.search);
      }
      
      if (filterParams.page) {
        params.append('page', filterParams.page.toString());
      }
      
      if (filterParams.limit) {
        params.append('limit', filterParams.limit.toString());
      }
      
      const response = await axios.get(`${API_URL}/manager/orders?${params.toString()}`);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const updateFilters = (newFilters: OrderFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.patch(`${API_URL}/manager/orders`, {
        orderId,
        status
      });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? response.data : order
        )
      );
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update order status'));
      console.error('Error updating order status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    pagination,
    loading,
    error,
    filters,
    fetchOrders,
    updateFilters,
    updateOrderStatus
  };
} 