'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/constants';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'manager' | 'chef' | 'waiter';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  spicyLevel: number;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface RevenueStats {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface OperationStats {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  topSellingItems: Array<{
    menuItem: { _id: string; name: string };
    count: number;
    revenue: number;
  }>;
  revenue: RevenueStats;
}

export const useManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<OperationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all users
  const fetchUsers = useCallback(async (role?: 'manager' | 'chef' | 'waiter') => {
    try {
      setLoading(true);
      const url = role 
        ? `${API_URL}/users?role=${role}`
        : `${API_URL}/users`;
      
      const response = await axios.get(url);
      setUsers(response.data.users);
      return response.data.users;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching users:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new user
  const createUser = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'manager' | 'chef' | 'waiter';
  }) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/users`, userData);
      
      // Update local state
      setUsers(prevUsers => [...prevUsers, response.data.user]);
      
      return response.data.user;
    } catch (err) {
      setError(err as Error);
      console.error('Error creating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a user
  const updateUser = useCallback(async (userId: string, userData: Partial<User>) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/users/${userId}`, userData);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, ...userData } : user
        )
      );
      
      return response.data.user;
    } catch (err) {
      setError(err as Error);
      console.error('Error updating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a user
  const deleteUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/users/${userId}`);
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      
      return true;
    } catch (err) {
      setError(err as Error);
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch manager dashboard stats
  const fetchStats = useCallback(async (timeRange?: 'day' | 'week' | 'month' | 'year') => {
    try {
      setLoading(true);
      const url = timeRange
        ? `${API_URL}/stats/manager?timeRange=${timeRange}`
        : `${API_URL}/stats/manager`;
        
      const response = await axios.get(url);
      setStats(response.data);
      return response.data;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching statistics:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
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

  // Create a new category
  const createCategory = useCallback(async (categoryData: Omit<Category, '_id'>) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/menu-categories`, categoryData);
      return response.data.category;
    } catch (err) {
      setError(err as Error);
      console.error('Error creating category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a category
  const updateCategory = useCallback(async (categoryId: string, categoryData: Partial<Omit<Category, '_id'>>) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/menu-categories/${categoryId}`, categoryData);
      return response.data.category;
    } catch (err) {
      setError(err as Error);
      console.error('Error updating category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a category
  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/menu-categories/${categoryId}`);
      return true;
    } catch (err) {
      setError(err as Error);
      console.error('Error deleting category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch menu items
  const fetchMenuItems = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      const url = category
        ? `${API_URL}/menu-items?category=${encodeURIComponent(category)}`
        : `${API_URL}/menu-items`;
        
      const response = await axios.get(url);
      return response.data.menuItems;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching menu items:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a menu item
  const createMenuItem = useCallback(async (menuItemData: Omit<MenuItem, '_id'>) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/menu-items`, menuItemData);
      return response.data.menuItem;
    } catch (err) {
      setError(err as Error);
      console.error('Error creating menu item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a menu item
  const updateMenuItem = useCallback(async (menuItemId: string, menuItemData: Partial<Omit<MenuItem, '_id'>>) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/menu-items/${menuItemId}`, menuItemData);
      return response.data.menuItem;
    } catch (err) {
      setError(err as Error);
      console.error('Error updating menu item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a menu item
  const deleteMenuItem = useCallback(async (menuItemId: string) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/menu-items/${menuItemId}`);
      return true;
    } catch (err) {
      setError(err as Error);
      console.error('Error deleting menu item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle menu item availability
  const toggleMenuItemAvailability = useCallback(async (menuItemId: string, available: boolean) => {
    try {
      setLoading(true);
      const response = await axios.patch(`${API_URL}/menu-items/${menuItemId}/availability`, { available });
      return response.data.menuItem;
    } catch (err) {
      setError(err as Error);
      console.error('Error toggling menu item availability:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate reports
  const generateReport = useCallback(async (reportType: 'sales' | 'inventory' | 'staff', dateRange: { startDate: string; endDate: string }) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reports/${reportType}`, {
        params: dateRange
      });
      return response.data;
    } catch (err) {
      setError(err as Error);
      console.error('Error generating report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    users,
    stats,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchStats,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    generateReport
  };
}; 