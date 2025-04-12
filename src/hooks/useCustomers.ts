import { useState, useEffect } from 'react';
import { customerApi } from '../utils/api';
import { Bill } from './useBills';

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  visits: number;
  totalSpent: number;
  lastVisit: string;
  preferences?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerWithHistory {
  customer: Customer;
  recentBills: Bill[];
}

export interface CustomersResponse {
  customers: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export type CustomerFilters = {
  name?: string;
  phone?: string;
  minVisits?: number;
  page?: number;
  limit?: number;
};

/**
 * Hook for fetching and managing customers
 */
export function useCustomers(initialFilters: CustomerFilters = {}) {
  const [customersData, setCustomersData] = useState<CustomersResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>(initialFilters);

  // Function to fetch customers with filters
  const fetchCustomers = async (filterParams: CustomerFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      
      if (filterParams.name) {
        params.append('name', filterParams.name);
      }
      
      if (filterParams.phone) {
        params.append('phone', filterParams.phone);
      }
      
      if (filterParams.minVisits) {
        params.append('minVisits', filterParams.minVisits.toString());
      }
      
      if (filterParams.page) {
        params.append('page', filterParams.page.toString());
      }
      
      if (filterParams.limit) {
        params.append('limit', filterParams.limit.toString());
      }
      
      const data = await customerApi.getAll(params);
      setCustomersData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customers'));
    } finally {
      setLoading(false);
    }
  };

  // Load customers on initial mount and when filters change
  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  // Function to update filters and refetch
  const updateFilters = (newFilters: CustomerFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Function to get a single customer by ID (with optional history)
  const getCustomer = async (customerId: string, includeHistory: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      return await customerApi.getById(customerId, includeHistory);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customer'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new customer
  const createCustomer = async (customerData: Omit<Customer, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newCustomer = await customerApi.create(customerData);
      // Refresh customers after creation
      await fetchCustomers();
      return newCustomer;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create customer'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to update a customer
  const updateCustomer = async (customerId: string, data: Partial<Customer>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCustomer = await customerApi.update(customerId, data);
      // Refresh customers after update
      await fetchCustomers();
      return updatedCustomer;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update customer'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a customer (manager only)
  const deleteCustomer = async (customerId: string) => {
    try {
      setLoading(true);
      setError(null);
      await customerApi.delete(customerId);
      // Refresh customers after deletion
      await fetchCustomers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete customer'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    customers: customersData?.customers || [],
    pagination: customersData?.pagination,
    loading,
    error,
    filters,
    fetchCustomers,
    updateFilters,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
} 