'use client';

import { useState, useEffect } from 'react';
import { tableApi } from '../utils/api';

export interface Table {
  _id: string;
  number: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  location?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook for fetching and managing tables
 */
export function useTablesData() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch all tables
  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tableApi.getAll();
      setTables(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tables'));
    } finally {
      setLoading(false);
    }
  };

  // Load tables on initial mount
  useEffect(() => {
    fetchTables();
  }, []);

  // Function to update a table's status
  const updateTableStatus = async (tableId: string, status: Table['status']) => {
    try {
      setLoading(true);
      setError(null);
      await tableApi.update(tableId, { status });
      // Refresh the tables after update
      await fetchTables();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update table status'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new table (manager only)
  const createTable = async (tableData: Omit<Table, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newTable = await tableApi.create(tableData);
      setTables(prev => [...prev, newTable]);
      return newTable;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create table'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a table (manager only)
  const deleteTable = async (tableId: string) => {
    try {
      setLoading(true);
      setError(null);
      await tableApi.delete(tableId);
      setTables(prev => prev.filter(table => table._id !== tableId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete table'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    tables,
    loading,
    error,
    fetchTables,
    updateTableStatus,
    createTable,
    deleteTable
  };
} 