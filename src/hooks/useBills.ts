'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/constants';

// Define the Order and OrderItem types
interface OrderItem {
  _id: string;
  menuItem: { _id: string; name: string; price: number };
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  _id: string;
  orderNumber: number;
  items: OrderItem[];
  table: string | { _id: string; name: string };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  _id: string;
  billNumber: number;
  order: Order;
  table?: { _id: string; name: string } | string;
  subtotal: number;
  tax: number;
  tip: number;
  discount: number;
  total: number;
  paymentMethod?: 'cash' | 'card' | 'upi';
  paymentStatus: 'pending' | 'paid';
  customerName?: string;
  customerPhone?: string;
  waiter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillFilters {
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  tableId?: string;
  waiterId?: string;
}

export interface BillUpdateData {
  paymentMethod?: 'cash' | 'card' | 'upi';
  paymentStatus?: 'pending' | 'paid';
  tip?: number;
  discount?: number;
  total?: number;
  customerName?: string;
  customerPhone?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface BillCreateData {
  order: string;
  table?: string;
  subtotal: number;
  tax: number;
  tip?: number;
  discount?: number;
  paymentMethod?: 'cash' | 'card' | 'upi';
  paymentStatus?: 'pending' | 'paid';
  customerName?: string;
  customerPhone?: string;
  waiter?: string;
}

const useBills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [pagination, setPagination] = useState<PaginationData | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<BillFilters>({});

  // Fetch bills with optional filters
  const fetchBills = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      
      // Build query params from filters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      // Add filters to params if they exist
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.tableId) params.append('tableId', filters.tableId);
      if (filters.waiterId) params.append('waiterId', filters.waiterId);
      
      const response = await axios.get(`/api/waiter/bills?${params.toString()}`);
      
      setBills(response.data.bills);
      setPagination(response.data.pagination);
      return response.data.bills;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Function to get all bills without pagination (for simpler use cases)
  const getAllBills = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/waiter/bills?all=true`);
      return response.data.bills;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to get a single bill by ID
  const getBill = useCallback(async (billId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/waiter/bills/${billId}`);
      return response.data.bill;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to create a new bill
  const createBill = useCallback(async (billData: BillCreateData) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/waiter/bills`, billData);
      // Refresh bills after creating a new one
      await fetchBills();
      return response.data.bill;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBills]);

  // Function to update a bill
  const updateBill = useCallback(async (billId: string, updateData: BillUpdateData) => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/waiter/bills/${billId}`, updateData);
      
      // Update local state
      setBills(prevBills =>
        prevBills.map(bill =>
          bill._id === billId ? { ...bill, ...updateData } : bill
        )
      );
      
      return response.data.bill;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to delete a bill
  const deleteBill = useCallback(async (billId: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/waiter/bills/${billId}`);
      
      // Update local state
      setBills(prevBills => prevBills.filter(bill => bill._id !== billId));
      
      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to update filters
  const updateFilters = useCallback((newFilters: BillFilters) => {
    setFilters(newFilters);
  }, []);

  // Load bills on mount or when filters change
  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return {
    bills,
    pagination,
    loading,
    error,
    filters,
    fetchBills,
    getAllBills,
    getBill,
    createBill,
    updateBill,
    deleteBill,
    updateFilters
  };
};

export default useBills; 