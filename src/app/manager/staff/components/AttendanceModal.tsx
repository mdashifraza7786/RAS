'use client';

import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaStickyNote } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember;
}

const attendanceStatusOptions = [
  { value: 'present', label: 'Present', color: 'bg-green-100 text-green-800' },
  { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-800' },
  { value: 'late', label: 'Late', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'half-day', label: 'Half Day', color: 'bg-orange-100 text-orange-800' },
  { value: 'leave', label: 'On Leave', color: 'bg-blue-100 text-blue-800' }
];

export default function AttendanceModal({ isOpen, onClose, staff }: AttendanceModalProps) {
  const [formData, setFormData] = useState({
    staffId: staff._id,
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    checkInTime: '',
    checkOutTime: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.status) newErrors.status = 'Status is required';
    
    // If present or late, check-in time should be provided
    if ((formData.status === 'present' || formData.status === 'late') && !formData.checkInTime) {
      newErrors.checkInTime = 'Check-in time is required for present/late status';
    }
    
    // Check that check-in and check-out times are not the same
    if (formData.checkInTime && formData.checkOutTime && formData.checkInTime === formData.checkOutTime) {
      newErrors.checkOutTime = 'Check-out time cannot be the same as check-in time';
    }
    
    // Check that check-out time is later than check-in time
    if (formData.checkInTime && formData.checkOutTime && formData.checkInTime > formData.checkOutTime) {
      newErrors.checkOutTime = 'Check-out time must be later than check-in time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/manager/staff/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark attendance');
      }
      
      toast.success(`Attendance marked for ${staff.name}`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-4 mb-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Mark Attendance</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-800">Staff: {staff.name}</p>
              <p className="text-sm text-gray-600">Role: {staff.role}</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mb-4">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={`pl-10 pr-4 py-2 w-full border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                  </div>
                  {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                </div>
                
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Attendance Status <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                    {attendanceStatusOptions.map((option) => (
                      <label 
                        key={option.value}
                        className={`
                          flex items-center justify-center p-2 rounded-md border-2 cursor-pointer 
                          ${formData.status === option.value 
                            ? `border-indigo-500 ${option.color}` 
                            : 'border-gray-200 hover:bg-gray-50'}
                        `}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={formData.status === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
                </div>
                
                {/* Check-in Time - Only show for present/late */}
                {(formData.status === 'present' || formData.status === 'late' || formData.status === 'half-day') && (
                  <div>
                    <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Time {(formData.status === 'present' || formData.status === 'late') && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaClock className="text-gray-400" />
                      </div>
                      <input
                        type="time"
                        id="checkInTime"
                        name="checkInTime"
                        value={formData.checkInTime}
                        onChange={handleChange}
                        className={`pl-10 pr-4 py-2 w-full border ${errors.checkInTime ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                    </div>
                    {errors.checkInTime && <p className="mt-1 text-sm text-red-500">{errors.checkInTime}</p>}
                  </div>
                )}
                
                {/* Check-out Time - Only show for present */}
                {(formData.status === 'present' || formData.status === 'half-day') && (
                  <div>
                    <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Time <span className="text-xs text-gray-500">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaClock className="text-gray-400" />
                      </div>
                      <input
                        type="time"
                        id="checkOutTime"
                        name="checkOutTime"
                        value={formData.checkOutTime}
                        onChange={handleChange}
                        className={`pl-10 pr-4 py-2 w-full border ${errors.checkOutTime ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                    </div>
                    {errors.checkOutTime && <p className="mt-1 text-sm text-red-500">{errors.checkOutTime}</p>}
                  </div>
                )}
                
                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes <span className="text-xs text-gray-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FaStickyNote className="text-gray-400" />
                    </div>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={2}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add any additional notes here..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Mark Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 