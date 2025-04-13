'use client';

import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaFilter,
  FaEye, 
  FaEdit, 
  FaTrash,
  FaPlus,
  FaTimes,
  FaCalendarAlt,
  FaUserAlt,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaUserCog,
  FaCalendarCheck,
  FaListAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import AddStaffModal from './components/AddStaffModal';
import EditStaffModal from './components/EditStaffModal';
import AttendanceModal from './components/AttendanceModal';
import AttendanceListModal from './components/AttendanceListModal';

interface StaffMember {
  _id: string;
  name: string;
    email: string;
  role: string;
  phone?: string;
  address?: string;
  joiningDate?: string;
  photo?: string;
  salary?: number;
  metrics: {
    totalOrders: number;
    completedOrders: number;
    averageOrderTime: number;
    customerRating: number;
  };
}

// Role options for filtering
const roleOptions = ['All Roles', 'manager', 'waiter', 'chef'];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isAttendanceListModalOpen, setIsAttendanceListModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Fetch staff data on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    filterStaff();
  }, [searchQuery, selectedRole, allStaff]);

  // Fetch staff from API
  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/manager/staff', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        setError('You are not authorized to view staff information. Please login as a manager.');
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }
      
      const data = await response.json();
      setAllStaff(data.staff);
      setPagination(data.pagination);
      
      // Initial filtering will happen in the useEffect
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching staff data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter staff based on current filter criteria
  const filterStaff = () => {
    let filtered = [...allStaff];
    
    // Apply role filter
    if (selectedRole !== 'All Roles') {
      filtered = filtered.filter(member => member.role === selectedRole.toLowerCase());
    }
    
    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member => {
        const nameMatch = member.name.toLowerCase().includes(query);
        const emailMatch = member.email.toLowerCase().includes(query);
        return nameMatch || emailMatch;
      });
    }
    
    setStaff(filtered);
  };

  // Toggle expanded staff details
  const toggleStaffDetails = (staffId: string) => {
    if (expandedStaffId === staffId) {
      setExpandedStaffId(null);
    } else {
      setExpandedStaffId(staffId);
    }
  };

  // Delete staff member
  const deleteStaffMember = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      const response = await fetch(`/api/manager/staff?id=${staffId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete staff member');
      }
      
      // Remove the deleted staff from state
      setAllStaff(prev => prev.filter(member => member._id !== staffId));
      setExpandedStaffId(null);
      toast.success('Staff member deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete staff member');
    }
  };

  // Open the edit modal with selected staff
  const openEditModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setIsEditModalOpen(true);
  };

  // Open the attendance modal with selected staff
  const openAttendanceModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setIsAttendanceModalOpen(true);
  };
  
  // Open the attendance list modal with selected staff
  const openAttendanceListModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setIsAttendanceListModalOpen(true);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-indigo-100 text-indigo-800';
      case 'waiter':
        return 'bg-blue-100 text-blue-800';
      case 'chef':
        return 'bg-yellow-100 text-yellow-800';
      case 'cashier':
        return 'bg-green-100 text-green-800';
      case 'cleaner':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-600">Manage restaurant staff and attendance</p>
        </div>
          <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
        >
          <FaPlus />
          <span>Add Staff</span>
          </button>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      
      {/* Loading and Error States */}
      {isLoading && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading staff data...</p>
      </div>
      )}
      
      {error && !isLoading && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchStaff}
            className="mt-2 text-red-700 underline"
          >
            Try again
          </button>
              </div>
      )}
      
      {/* Staff List */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.length > 0 ? (
                  staff.map((member) => (
                    <React.Fragment key={member._id}>
                      <tr className={`hover:bg-gray-50 ${expandedStaffId === member._id ? 'bg-indigo-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`flex items-center px-2.5 py-1 text-xs rounded-full ${getRoleBadgeColor(member.role)}`}>
                            <span className="capitalize">{member.role}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.phone || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {member.role === 'waiter' || member.role === 'chef' ? (
                            <span className="flex items-center">
                              {member.metrics.totalOrders} orders / {member.metrics.customerRating.toFixed(1)} rating
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                      <button 
                              onClick={() => toggleStaffDetails(member._id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              aria-label="View staff details"
                            >
                              <FaEye />
                      </button>
                      <button 
                              onClick={() => openEditModal(member)}
                              className="text-blue-600 hover:text-blue-900"
                              aria-label="Edit staff"
                            >
                              <FaEdit />
                      </button>
                      <button 
                              onClick={() => deleteStaffMember(member._id)}
                              className="text-red-600 hover:text-red-900"
                              aria-label="Delete staff"
                            >
                              <FaTrash />
                      </button>
                    </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Staff Details */}
                      {expandedStaffId === member._id && (
                        <tr className="bg-indigo-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                                <h4 className="text-sm font-medium text-gray-800 mb-2">Personal Information</h4>
                                <div className="flex items-center space-x-2 mb-2">
                                  <FaUserAlt className="text-gray-500" />
                                  <p className="text-sm text-gray-600">{member.name}</p>
                          </div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <FaEnvelope className="text-gray-500" />
                                  <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <FaPhone className="text-gray-500" />
                                  <p className="text-sm text-gray-600">{member.phone || 'Not provided'}</p>
                          </div>
                                <div className="flex items-center space-x-2">
                                  <FaIdCard className="text-gray-500" />
                                  <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                      </div>
                    </div>
                    
                    <div>
                                <h4 className="text-sm font-medium text-gray-800 mb-2">Employment Details</h4>
                                <div className="flex items-center space-x-2 mb-2">
                                  <FaCalendarAlt className="text-gray-500" />
                                  <p className="text-sm text-gray-600">Joined: {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : 'Not specified'}</p>
                                </div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <FaUserCog className="text-gray-500" />
                                  <p className="text-sm text-gray-600">Salary: ₹{member.salary?.toLocaleString() || 'Not specified'}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FaListAlt className="text-gray-500" />
                                  <p className="text-sm text-gray-600">Address: {member.address || 'Not provided'}</p>
                          </div>
                        </div>
                        
                              {(member.role === 'waiter' || member.role === 'chef') && (
                          <div>
                                  <h4 className="text-sm font-medium text-gray-800 mb-2">Performance Metrics</h4>
                                  <p className="text-sm text-gray-600">Total Orders: {member.metrics.totalOrders}</p>
                                  <p className="text-sm text-gray-600">Completed Orders: {member.metrics.completedOrders}</p>
                            <p className="text-sm text-gray-600">
                                    Average Order Time: {Math.round(member.metrics.averageOrderTime / (1000 * 60))} minutes
                            </p>
                                  <p className="text-sm text-gray-600">Customer Rating: {member.metrics.customerRating.toFixed(1)}/5</p>
                          </div>
                              )}
                  </div>
                  
                            {/* Staff Actions */}
                            <div className="flex justify-start space-x-3 mt-4 pt-4 border-t border-indigo-100">
                        <button 
                                onClick={() => openAttendanceModal(member)}
                                className="px-3 py-1 text-xs rounded-md bg-green-100 text-green-800 hover:bg-green-200 flex items-center space-x-1"
                              >
                                <FaCalendarCheck />
                                <span>Mark Attendance</span>
                        </button>
                        
                        <button 
                                onClick={() => openAttendanceListModal(member)}
                                className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center space-x-1"
                              >
                                <FaCalendarAlt />
                                <span>View Attendance History</span>
                        </button>
                        
                        <button 
                                onClick={() => openEditModal(member)}
                                className="px-3 py-1 text-xs rounded-md bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex items-center space-x-1"
                              >
                                <FaEdit />
                                <span>Edit Details</span>
                        </button>
                      </div>
                              </td>
                            </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No staff members found. Try adjusting your search or filters.
                              </td>
                            </tr>
                )}
                          </tbody>
                        </table>
                      </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{staff.length}</span> of <span className="font-medium">{allStaff.length}</span> staff members
                    </div>
            <div className="flex space-x-2">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => fetchStaff()}
              >
                Refresh Data
                    </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <AddStaffModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onStaffAdded={() => fetchStaff()}
        />
      )}
      
      {isEditModalOpen && selectedStaff && (
        <EditStaffModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onStaffUpdated={() => fetchStaff()}
          staff={selectedStaff}
        />
      )}
      
      {isAttendanceModalOpen && selectedStaff && (
        <AttendanceModal 
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          staff={selectedStaff}
        />
      )}
      
      {isAttendanceListModalOpen && selectedStaff && (
        <AttendanceListModal 
          isOpen={isAttendanceListModalOpen}
          onClose={() => setIsAttendanceListModalOpen(false)}
          staff={selectedStaff}
        />
      )}
    </div>
  );
} 