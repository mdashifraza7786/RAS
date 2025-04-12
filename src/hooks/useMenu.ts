import { useState, useEffect } from 'react';
import { menuApi } from '../utils/api';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  popular?: boolean;
  preparationTime?: number;
  ingredients?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook for fetching and managing menu items
 */
export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch all menu items
  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuApi.getAll();
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch menu items'));
    } finally {
      setLoading(false);
    }
  };

  // Load menu items on initial mount
  useEffect(() => {
    fetchMenu();
  }, []);

  // Function to get a menu item by ID
  const getMenuItem = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await menuApi.getById(itemId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch menu item'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new menu item (manager only)
  const createMenuItem = async (itemData: Omit<MenuItem, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newItem = await menuApi.create(itemData);
      // Add the new item to the state
      setMenuItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create menu item'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to update a menu item (manager only)
  const updateMenuItem = async (itemId: string, data: Partial<MenuItem>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedItem = await menuApi.update(itemId, data);
      // Update the item in the state
      setMenuItems(prev => 
        prev.map(item => item._id === itemId ? updatedItem : item)
      );
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update menu item'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a menu item (manager only)
  const deleteMenuItem = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      await menuApi.delete(itemId);
      // Remove the item from the state
      setMenuItems(prev => prev.filter(item => item._id !== itemId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete menu item'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Group menu items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Get available categories
  const categories = Object.keys(menuByCategory).sort();

  // Get popular items
  const popularItems = menuItems.filter(item => item.popular);

  return {
    menuItems,
    menuByCategory,
    categories,
    popularItems,
    loading,
    error,
    fetchMenu,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
  };
} 