'use client';

import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

// Define the interfaces for the tables data
export interface TableOrder {
  id: string;
  status: string;
  createdAt: string;
  timeElapsed: string;
}

export interface Table {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  location: string;
  isAssigned: boolean;
  lastStatusChanged: string;
  timeElapsed: string | null;
  orders: TableOrder[];
}

export interface TableFilters {
  status: string | null;
  location: string | null;
  showAll: boolean;
}

export interface TableMetadata {
  total: number;
  assigned: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
}

interface TablesResponse {
  tables: Table[];
  filters: {
    locations: string[];
  };
  meta: TableMetadata;
}

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<TableFilters>({
    status: null,
    location: null,
    showAll: false,
  });
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<TableMetadata>({
    total: 0,
    assigned: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    cleaning: 0,
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to fetch tables data
  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.location) params.append('location', filters.location);
      if (filters.showAll) params.append('showAll', 'true');
      
      const url = `/api/waiter/tables${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Fetching tables from URL:", url);
      
      // Add retry logic for API call
      let attempts = 0;
      let response = null;
      const maxAttempts = 2;
      
      while (attempts < maxAttempts) {
        try {
          response = await axios.get<TablesResponse>(url);
          break; // Successful, break out of retry loop
        } catch (err) {
          attempts++;
          console.error(`Attempt ${attempts} failed:`, err);
          if (attempts >= maxAttempts) throw err; // Rethrow if all attempts failed
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
      
      if (!response || !response.data) {
        throw new Error("No data received from tables API");
      }
      
      console.log("Tables data received:", response.data);
      
      // Ensure tables is always an array, even if API returns null/undefined
      const tablesArray = Array.isArray(response.data.tables) ? response.data.tables : [];
      
      // Log individual tables for debugging
      if (tablesArray.length === 0) {
        console.warn("API returned empty tables array");
      } else {
        console.log(`Received ${tablesArray.length} tables:`);
        tablesArray.forEach(table => {
          console.log(`Table #${table.number}: status=${table.status}, id=${table.id}`);
        });
      }
      
      setTables(tablesArray);
      
      // Ensure locations is always an array
      const locationsArray = Array.isArray(response.data.filters?.locations) ? response.data.filters.locations : [];
      setAvailableLocations(locationsArray);
      
      // Ensure metadata is always populated
      setMetadata(response.data.meta || {
        total: tablesArray.length,
        assigned: 0,
        available: 0,
        occupied: 0,
        reserved: 0,
        cleaning: 0,
      });
      
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch tables'));
      toast.error('Failed to load tables');
      // Ensure we have an empty array rather than undefined
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Function to update filters
  const updateFilters = useCallback((newFilters: Partial<TableFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Function to assign a table to the current waiter
  const assignTable = useCallback(async (tableId: string) => {
    try {
      const { data } = await axios.put('/api/waiter/tables', {
        tableId,
        action: 'assign'
      });
      
      // Update the table in the local state
      setTables(prev => 
        prev.map(table => 
          table.id === tableId 
            ? { ...table, isAssigned: true } 
            : table
        )
      );
      
      toast.success(data.message);
      
      // Refresh tables to get updated data
      fetchTables();
      
      return true;
    } catch (err) {
      console.error('Error assigning table:', err);
      const axiosError = err as AxiosError<{ error: string }>;
      toast.error(axiosError.response?.data?.error || 'Failed to assign table');
      return false;
    }
  }, [fetchTables]);

  // Function to unassign a table
  const unassignTable = useCallback(async (tableId: string) => {
    try {
      const { data } = await axios.put('/api/waiter/tables', {
        tableId,
        action: 'unassign'
      });
      
      // Update the table in the local state
      setTables(prev => 
        prev.map(table => 
          table.id === tableId 
            ? { ...table, isAssigned: false } 
            : table
        )
      );
      
      toast.success(data.message);
      
      // Refresh tables to get updated data
      fetchTables();
      
      return true;
    } catch (err) {
      console.error('Error unassigning table:', err);
      const axiosError = err as AxiosError<{ error: string }>;
      toast.error(axiosError.response?.data?.error || 'Failed to unassign table');
      return false;
    }
  }, [fetchTables]);

  // Function to update table status
  const updateTableStatus = useCallback(async (tableId: string, status: 'available' | 'occupied' | 'reserved' | 'cleaning') => {
    try {
      const { data } = await axios.put('/api/waiter/tables', {
        tableId,
        status,
        action: 'updateStatus'
      });
      
      // Update the table in the local state
      setTables(prev => 
        prev.map(table => 
          table.id === tableId 
            ? { ...table, status } 
            : table
        )
      );
      
      toast.success(data.message);
      
      // Refresh tables to get updated data
      fetchTables();
      
      return true;
    } catch (err) {
      console.error('Error updating table status:', err);
      const axiosError = err as AxiosError<{ error: string }>;
      toast.error(axiosError.response?.data?.error || 'Failed to update table status');
      return false;
    }
  }, [fetchTables]);

  // Refresh function for manual refetching
  const refreshTables = useCallback(() => {
    fetchTables();
  }, [fetchTables]);

  // Fetch tables when filters change
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    tables,
    loading,
    error,
    filters,
    updateFilters,
    availableLocations,
    metadata,
    lastUpdated,
    assignTable,
    unassignTable,
    updateTableStatus,
    refreshTables
  };
} 