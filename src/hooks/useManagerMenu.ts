import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/constants';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuFilters {
  category?: string;
  search?: string;
}

export function useManagerMenu(initialFilters: MenuFilters = {}) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<MenuFilters>(initialFilters);

  const fetchMenuItems = async (filterParams: MenuFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      
      if (filterParams.category) {
        params.append('category', filterParams.category);
      }
      
      if (filterParams.search) {
        params.append('search', filterParams.search);
      }
      
      const response = await axios.get(`${API_URL}/manager/menu?${params.toString()}`);
      setMenuItems(response.data.menuItems);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch menu items'));
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [filters]);

  const updateFilters = (newFilters: MenuFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const createMenuItem = async (data: Omit<MenuItem, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/manager/menu`, data);
      
      // Update local state
      setMenuItems(prev => [...prev, response.data]);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create menu item'));
      console.error('Error creating menu item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItem = async (id: string, data: Partial<MenuItem>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(`${API_URL}/manager/menu`, {
        id,
        ...data
      });
      
      // Update local state
      setMenuItems(prev => 
        prev.map(item => 
          item._id === id ? response.data : item
        )
      );
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update menu item'));
      console.error('Error updating menu item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`${API_URL}/manager/menu?id=${id}`);
      
      // Update local state
      setMenuItems(prev => prev.filter(item => item._id !== id));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete menu item'));
      console.error('Error deleting menu item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    menuItems,
    loading,
    error,
    filters,
    fetchMenuItems,
    updateFilters,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
  };
} 