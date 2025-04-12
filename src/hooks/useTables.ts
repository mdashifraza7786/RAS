import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/constants';

export interface Table {
  _id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch all tables
  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tables`);
      setTables(response.data.tables);
      return response.data.tables;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching tables:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get a single table
  const getTable = useCallback(async (tableId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tables/${tableId}`);
      return response.data.table;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching table:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update table status
  const updateTableStatus = useCallback(async (tableId: string, status: 'available' | 'occupied' | 'reserved' | 'cleaning') => {
    try {
      setLoading(true);
      const response = await axios.patch(`${API_URL}/tables/${tableId}/status`, { status });
      
      // Update local state
      setTables(prevTables => 
        prevTables.map(table => 
          table._id === tableId ? { ...table, status } : table
        )
      );
      
      return response.data.table;
    } catch (err) {
      setError(err as Error);
      console.error('Error updating table status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Create a new table
  const createTable = useCallback(async (tableData: Omit<Table, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/tables`, tableData);
      
      // Update local state
      setTables(prevTables => [...prevTables, response.data.table]);
      
      return response.data.table;
    } catch (err) {
      setError(err as Error);
      console.error('Error creating table:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update table details
  const updateTable = useCallback(async (tableId: string, tableData: Partial<Omit<Table, '_id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/tables/${tableId}`, tableData);
      
      // Update local state
      setTables(prevTables => 
        prevTables.map(table => 
          table._id === tableId ? { ...table, ...tableData } : table
        )
      );
      
      return response.data.table;
    } catch (err) {
      setError(err as Error);
      console.error('Error updating table:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Delete a table
  const deleteTable = useCallback(async (tableId: string) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/tables/${tableId}`);
      
      // Update local state
      setTables(prevTables => prevTables.filter(table => table._id !== tableId));
      
      return true;
    } catch (err) {
      setError(err as Error);
      console.error('Error deleting table:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load tables on mount
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);
  
  return {
    tables,
    loading,
    error,
    fetchTables,
    getTable,
    updateTableStatus,
    createTable,
    updateTable,
    deleteTable
  };
}; 