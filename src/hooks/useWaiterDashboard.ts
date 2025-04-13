import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Define types for the dashboard data
export interface QuickStat {
  title: string;
  value: string;
  description: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  action: string;
  timeSince: string;
}

export interface WaiterDashboardData {
  quickStats: {
    activeTables: QuickStat;
    allTables: QuickStat;
    openOrders: QuickStat;
    readyToServe: QuickStat;
    unpaidBills: QuickStat;
  };
  recentActivity: RecentActivity[];
}

const API_URL = '/api/waiter/dashboard';
const POLLING_INTERVAL = 60000; // 1 minute

export function useWaiterDashboard() {
  const [dashboardData, setDashboardData] = useState<WaiterDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<WaiterDashboardData>(API_URL);
      setDashboardData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching waiter dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    // Initial fetch
    fetchDashboardData();

    // Set up polling
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, POLLING_INTERVAL);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    lastUpdated,
    refreshData
  };
}