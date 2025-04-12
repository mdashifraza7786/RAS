'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaFilter, FaEdit, FaTrash, FaClock, FaClipboardCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AttendanceRecord {
  _id: string;
  staff: StaffMember | string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'leave';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember;
}

const dateRangeOptions = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 3 months' },
  { value: 'all', label: 'All time' }
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half-day', label: 'Half Day' },
  { value: 'leave', label: 'On Leave' }
];

export default function AttendanceListModal({ isOpen, onClose, staff }: AttendanceListModalProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 30,
    total: 0,
    pages: 0
  });
  
  useEffect(() => {
    if (isOpen) {
      fetchAttendance();
    }
  }, [isOpen, dateRange, statusFilter]);

  if (!isOpen) return null;

  const fetchAttendance = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let endpoint = `/api/manager/staff/attendance?staffId=${staff._id}&limit=${pagination.limit}`;
      
      // Add date range filter
      if (dateRange !== 'all') {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - parseInt(dateRange));
        endpoint += `&startDate=${startDate.toISOString().split('T')[0]}`;
      }
      
      // Add status filter
      if (statusFilter !== 'all') {
        endpoint += `&status=${statusFilter}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You are not authorized to view attendance records');
        }
        throw new Error('Failed to fetch attendance records');
      }
      
      const data = await response.json();
      setAttendanceRecords(data.attendance);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching attendance records');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;
    
    try {
      const response = await fetch(`/api/manager/staff/attendance?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete attendance record');
      }
      
      toast.success('Attendance record deleted successfully');
      // Remove from state
      setAttendanceRecords(prev => prev.filter(record => record._id !== id));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete attendance record');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'half-day':
        return 'bg-orange-100 text-orange-800';
      case 'leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-4 mb-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Attendance History</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-4 bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <p className="text-sm font-medium text-gray-800">Staff: {staff.name}</p>
                <p className="text-sm text-gray-600">Role: {staff.role}</p>
              </div>
              
              <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                <div className="relative">
                  <select 
                    className="pl-8 pr-4 py-1 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    {dateRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <FaCalendarAlt className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                </div>
                
                <div className="relative">
                  <select 
                    className="pl-8 pr-4 py-1 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <FaFilter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                </div>
              </div>
            </div>
            
            {/* Loading and Error States */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading attendance records...</p>
              </div>
            )}
            
            {error && !isLoading && (
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={fetchAttendance}
                  className="mt-2 text-sm text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            )}
            
            {/* Attendance Records Table */}
            {!isLoading && !error && (
              <div className="overflow-x-auto">
                {attendanceRecords.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceRecords.map(record => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                              <FaClipboardCheck className="mr-1" />
                              <span className="capitalize">{record.status}</span>
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            {record.checkInTime ? (
                              <span className="flex items-center">
                                <FaClock className="mr-1 text-gray-400" />
                                {formatTime(record.checkInTime)}
                              </span>
                            ) : 'N/A'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            {record.checkOutTime ? (
                              <span className="flex items-center">
                                <FaClock className="mr-1 text-gray-400" />
                                {formatTime(record.checkOutTime)}
                              </span>
                            ) : 'N/A'}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 max-w-[200px] truncate">
                            {record.notes || 'No notes'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleDeleteRecord(record._id)}
                                className="text-red-600 hover:text-red-900"
                                aria-label="Delete record"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600">No attendance records found for the selected period.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Pagination */}
            {!isLoading && !error && attendanceRecords.length > 0 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {attendanceRecords.length} of {pagination.total} records
                </p>
                <button
                  onClick={fetchAttendance}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 