'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/constants';

interface DashboardStats {
  revenue: {
    current: number;
    growth: number;
  };
  orders: {
    total: number;
    growth: number;
  };
  customers: {
    new: number;
    growth: number;
  };
  averageOrderValue: {
    current: number;
    previous: number;
  };
}

export function useManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/manager/dashboard/stats`);
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard stats'));
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats,
    formatCurrency,
    formatPercentage
  };
} 