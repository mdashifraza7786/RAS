import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/constants';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  preparationTime: number;
  ingredients: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spicyLevel: number; // 0-3
}

export interface OrderItem {
  menuItem: string | MenuItem;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: number;
  table: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'in-progress' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  customerName?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  _id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
}

// Guest Hook for viewing menu, placing orders, and tracking order status
export const useGuest = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tableId, setTableId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load table ID from local storage on mount
  useEffect(() => {
    const savedTableId = localStorage.getItem('guest_table_id');
    if (savedTableId) {
      setTableId(savedTableId);
    }
  }, []);

  // Save table ID to local storage when it changes
  useEffect(() => {
    if (tableId) {
      localStorage.setItem('guest_table_id', tableId);
    } else {
      localStorage.removeItem('guest_table_id');
    }
  }, [tableId]);

  // Fetch all menu items
  const getMenuItems = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      const url = category 
        ? `${API_URL}/menu-items?category=${encodeURIComponent(category)}`
        : `${API_URL}/menu-items`;
      
      const response = await axios.get(url);
      setMenuItems(response.data.menuItems);
      return response.data.menuItems;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching menu items:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get menu categories
  const getCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/menu-categories`);
      return response.data.categories;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching categories:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get menu item by ID
  const getMenuItem = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/menu-items/${itemId}`);
      return response.data.menuItem;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching menu item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Select table for the guest
  const selectTable = useCallback((id: string) => {
    setTableId(id);
  }, []);

  // Clear the selected table
  const clearTable = useCallback(() => {
    setTableId(null);
  }, []);

  // Create a new order
  const placeOrder = useCallback(async (orderData: {
    items: { menuItemId: string; quantity: number; notes?: string }[];
    customerName?: string;
    specialInstructions?: string;
  }) => {
    if (!tableId) {
      throw new Error('No table selected');
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/orders/guest`, {
        ...orderData,
        tableId
      });
      
      setCurrentOrder(response.data.order);
      return response.data.order;
    } catch (err) {
      setError(err as Error);
      console.error('Error placing order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  // Get current order status
  const getOrderStatus = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders/${orderId}/status`);
      
      if (currentOrder && currentOrder._id === orderId) {
        setCurrentOrder(prev => prev ? {...prev, status: response.data.status} : null);
      }
      
      return response.data.status;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching order status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  // Get all orders for a table
  const getTableOrders = useCallback(async () => {
    if (!tableId) {
      throw new Error('No table selected');
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders/table/${tableId}`);
      return response.data.orders;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching table orders:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  // Request assistance
  const requestAssistance = useCallback(async (requestType: 'waiter' | 'refill' | 'checkout', message?: string) => {
    if (!tableId) {
      throw new Error('No table selected');
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/assistance-requests`, {
        tableId,
        requestType,
        message
      });
      
      return response.data.success;
    } catch (err) {
      setError(err as Error);
      console.error('Error requesting assistance:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  // Get feedback form
  const submitFeedback = useCallback(async (data: {
    rating: number;
    comment?: string;
    orderId?: string;
  }) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/feedback`, data);
      return response.data.success;
    } catch (err) {
      setError(err as Error);
      console.error('Error submitting feedback:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    menuItems,
    tableId,
    currentOrder,
    loading,
    error,
    getMenuItems,
    getCategories,
    getMenuItem,
    selectTable,
    clearTable,
    placeOrder,
    getOrderStatus,
    getTableOrders,
    requestAssistance,
    submitFeedback
  };
}; 