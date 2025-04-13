'use client';

import { useState, useEffect } from 'react';
import { statsApi } from '../utils/api';

// Define types for manager stats
export interface ManagerStats {
  todayOrders: number;
  todayRevenue: number;
  totalOrders: number;
  tableStats: {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    cleaning: number;
  };
  popularItems: any[];
  recentCustomers: any[];
  pendingOrders: any[];
}

// Define types for waiter stats
export interface WaiterStats {
  todayOrders: number;
  todayRevenue: number;
  tables: any[];
  activeOrders: any[];
}

// Define types for chef stats
export interface ChefStats {
  orderCounts: {
    pending: number;
    inProgress: number;
    ready: number;
  };
  pendingOrders: any[];
  inProgressOrders: any[];
  lowInventory: any[];
}

// Union type for all role stats
export type RoleStats = ManagerStats | WaiterStats | ChefStats;

/**
 * Hook to fetch dashboard statistics based on user role
 */
export function useStats() {
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await statsApi.get();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Function to refresh stats
  const refreshStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statsApi.get();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refreshStats };
} 