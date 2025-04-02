'use client';

import React, { useState } from 'react';
import {
  FaUserTie, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaClock,
  FaSearch,
  FaFilter,
  FaEllipsisV,
  FaUserPlus,
  FaStar,
  FaIdCard,
  FaUsers,
  FaUserClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle
} from 'react-icons/fa';

// Sample staff data
interface StaffMember {
  id: string;
  name: string;
  position: string;
  department: string;
  joinDate: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  schedule: {
    daysOfWeek: string[];
    shifts: string;
  };
  salary: number;
  performance: number;
  image: string;
  attendance: 'present' | 'absent' | 'late';
}

const initialStaffMembers: StaffMember[] = [
  {
    id: 'EMP001',
    name: 'Rajesh Kumar',
    position: 'Chef',
    department: 'Kitchen',
    joinDate: '2021-06-15',
    contactInfo: {
      phone: '+91 98765 43210',
      email: 'rajesh@restaurant.com',
      address: '123 Chef Lane, Mumbai'
    },
    schedule: {
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      shifts: '9:00 AM - 5:00 PM'
    },
    salary: 45000,
    performance: 4.8,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    attendance: 'present'
  },
  {
    id: 'EMP002',
    name: 'Priya Singh',
    position: 'Chef',
    department: 'Kitchen',
    joinDate: '2021-08-20',
    contactInfo: {
      phone: '+91 98765 87654',
      email: 'priya@restaurant.com',
      address: '456 Cook Street, Mumbai'
    },
    schedule: {
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      shifts: '10:00 AM - 6:00 PM'
    },
    salary: 35000,
    performance: 4.5,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    attendance: 'present'
  },
  {
    id: 'EMP003',
    name: 'Amit Sharma',
    position: 'Waiter',
    department: 'Service',
    joinDate: '2022-01-10',
    contactInfo: {
      phone: '+91 87654 32109',
      email: 'amit@restaurant.com',
      address: '789 Service Road, Mumbai'
    },
    schedule: {
      daysOfWeek: ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      shifts: '4:00 PM - 12:00 AM'
    },
    salary: 22000,
    performance: 4.2,
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    attendance: 'present'
  },
  {
    id: 'EMP004',
    name: 'Sneha Patel',
    position: 'Manager',
    department: 'Management',
    joinDate: '2022-03-15',
    contactInfo: {
      phone: '+91 76543 21098',
      email: 'sneha@restaurant.com',
      address: '101 Welcome Ave, Mumbai'
    },
    schedule: {
      daysOfWeek: ['Tuesday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'],
      shifts: '5:00 PM - 1:00 AM'
    },
    salary: 25000,
    performance: 4.7,
    image: 'https://randomuser.me/api/portraits/women/28.jpg',
    attendance: 'present'
  },
  {
    id: 'EMP005',
    name: 'Vikram Malhotra',
    position: 'Waiter',
    department: 'Service',
    joinDate: '2022-02-08',
    contactInfo: {
      phone: '+91 65432 10987',
      email: 'vikram@restaurant.com',
      address: '222 Spirits Street, Mumbai'
    },
    schedule: {
      daysOfWeek: ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      shifts: '6:00 PM - 2:00 AM'
    },
    salary: 28000,
    performance: 4.4,
    image: 'https://randomuser.me/api/portraits/men/62.jpg',
    attendance: 'present'
  },
  {
    id: 'EMP006',
    name: 'Neha Kapoor',
    position: 'Manager',
    department: 'Management',
    joinDate: '2022-05-20',
    contactInfo: {
      phone: '+91 54321 09876',
      email: 'neha@restaurant.com',
      address: '333 Money Lane, Mumbai'
    },
    schedule: {
      daysOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
      shifts: '11:00 AM - 7:00 PM'
    },
    salary: 24000,
    performance: 4.6,
    image: 'https://randomuser.me/api/portraits/women/56.jpg',
    attendance: 'present'
  },
  {
    id: 'EMP007',
    name: 'Suresh Reddy',
    position: 'Chef',
    department: 'Kitchen',
    joinDate: '2022-04-10',
    contactInfo: {
      phone: '+91 43210 98765',
      email: 'suresh@restaurant.com',
      address: '444 Prep Street, Mumbai'
    },
    schedule: {
      daysOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
      shifts: '12:00 PM - 8:00 PM'
    },
    salary: 26000,
    performance: 4.0,
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    attendance: 'present'
  },
  {
    id: 'EMP008',
    name: 'Kavita Sharma',
    position: 'Waiter',
    department: 'Service',
    joinDate: '2022-06-15',
    contactInfo: {
      phone: '+91 32109 87654',
      email: 'kavita@restaurant.com',
      address: '555 Clean Road, Mumbai'
    },
    schedule: {
      daysOfWeek: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'],
      shifts: '8:00 AM - 4:00 PM'
    },
    salary: 18000,
    performance: 4.3,
    image: 'https://randomuser.me/api/portraits/women/62.jpg',
    attendance: 'present'
  }
];

// Department options for filtering
const departments = [
  'All Departments', 'Kitchen', 'Service', 'Management'
];

// Position options for filtering
const positions = [
  'All Positions', 'Manager', 'Chef', 'Waiter'
];

// Staff summary stats
const staffStats = [
  { 
    title: 'Total Staff', 
    value: '24', 
    icon: <FaUsers className="text-lg" />, 
    description: '8 Full-time, 16 Part-time'
  },
  { 
    title: 'Departments', 
    value: '5', 
    icon: <FaIdCard className="text-lg" />, 
    description: 'Across operations'
  },
  { 
    title: 'This Week', 
    value: '22', 
    icon: <FaUserClock className="text-lg" />, 
    description: '2 on leave'
  },
  { 
    title: 'Performance', 
    value: '4.5', 
    icon: <FaStar className="text-lg" />, 
    description: 'Average rating'
  }
];

// Format date to readable format
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

// Performance Rating component
interface RatingProps {
  score: number;
}

const PerformanceRating: React.FC<RatingProps> = ({ score }) => {
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`text-sm ${
          i < fullStars 
            ? 'text-yellow-500' 
            : (i === fullStars && hasHalfStar) 
              ? 'text-yellow-500' 
              : 'text-gray-300'
        }`}>
          <FaStar />
        </span>
      ))}
      <span className="ml-2 text-sm text-gray-600">{score.toFixed(1)}</span>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className="rounded-full p-2.5 bg-indigo-100 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaffMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedPosition, setSelectedPosition] = useState('All Positions');
  const [selectedStaffMember, setSelectedStaffMember] = useState<string | null>(null);
  const [isAttendanceMode, setIsAttendanceMode] = useState(false);
  
  // Filter staff based on search query, selected department, selected position
  const filteredStaff = staff.filter(member => {
    // Match search query
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      member.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Match department
    const matchesDepartment = 
      selectedDepartment === 'All Departments' || 
      member.department === selectedDepartment;
    
    // Match position
    const matchesPosition = 
      selectedPosition === 'All Positions' || 
      member.position === selectedPosition;
    
    return matchesSearch && matchesDepartment && matchesPosition;
  });
  
  // Update staff attendance
  const updateAttendance = (id: string, status: 'present' | 'absent' | 'late') => {
    setStaff(prevStaff => 
      prevStaff.map(member => 
        member.id === id ? { ...member, attendance: status } : member
      )
    );
  };
  
  // Get attendance status icon and color
  const getAttendanceStatusDisplay = (status: string) => {
    switch(status) {
      case 'present':
        return { 
          icon: <FaCheckCircle className="text-green-500" />, 
          text: 'Present',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'absent':
        return { 
          icon: <FaTimesCircle className="text-red-500" />, 
          text: 'Absent',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800'
        };
      case 'late':
        return { 
          icon: <FaExclamationCircle className="text-yellow-500" />, 
          text: 'Late',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
      default:
        return { 
          icon: <FaUserClock className="text-gray-500" />, 
          text: 'Not Set',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-600">Manage restaurant personnel and schedules</p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsAttendanceMode(!isAttendanceMode)}
            className={`flex items-center px-4 py-2 border rounded-lg ${
              isAttendanceMode 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <FaUserClock className="mr-2" />
            {isAttendanceMode ? 'Exit Attendance Mode' : 'Manage Attendance'}
          </button>
          
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <FaUserPlus className="mr-2" />
            Add Staff
          </button>
        </div>
      </div>
      
      {/* Attendance Instructions - Show only in attendance mode */}
      {isAttendanceMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-blue-800">
          <h3 className="font-medium mb-1 flex items-center">
            <FaUserClock className="mr-2" /> Attendance Management Mode
          </h3>
          <p className="text-sm">Click on the attendance status indicator on each staff card to update their attendance for today.</p>
        </div>
      )}
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {staffStats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title} 
            value={stat.value} 
            icon={stat.icon} 
            description={stat.description}
          />
        ))}
      </div>
      
      {/* Attendance Stats - Show only in attendance mode */}
      {isAttendanceMode && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Today&apos;s Attendance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center">
              <div className="rounded-full p-3 bg-green-100 text-green-600 mr-4">
                <FaCheckCircle size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Present</p>
                <h3 className="text-xl font-bold text-gray-800">
                  {staff.filter(member => member.attendance === 'present').length}
                </h3>
                <p className="text-xs text-gray-500">
                  {Math.round((staff.filter(member => member.attendance === 'present').length / staff.length) * 100)}% of staff
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center">
              <div className="rounded-full p-3 bg-yellow-100 text-yellow-600 mr-4">
                <FaExclamationCircle size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Late</p>
                <h3 className="text-xl font-bold text-gray-800">
                  {staff.filter(member => member.attendance === 'late').length}
                </h3>
                <p className="text-xs text-gray-500">
                  {Math.round((staff.filter(member => member.attendance === 'late').length / staff.length) * 100)}% of staff
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center">
              <div className="rounded-full p-3 bg-red-100 text-red-600 mr-4">
                <FaTimesCircle size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Absent</p>
                <h3 className="text-xl font-bold text-gray-800">
                  {staff.filter(member => member.attendance === 'absent').length}
                </h3>
                <p className="text-xs text-gray-500">
                  {Math.round((staff.filter(member => member.attendance === 'absent').length / staff.length) * 100)}% of staff
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters and Search */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
          <div className="relative md:w-64">
            <input
              type="text"
              placeholder="Search staff..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
              >
                {positions.map((position) => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStaff.map((member) => (
          <div 
            key={member.id} 
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="relative h-48 bg-indigo-50">
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-white/90">{member.position}</p>
              </div>
              
              {/* Attendance Badge */}
              <div className="absolute top-2 right-2">
                {isAttendanceMode ? (
                  <div className="bg-white rounded-full shadow p-1">
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => updateAttendance(member.id, 'present')}
                        className={`rounded-full p-2 ${member.attendance === 'present' ? 'bg-green-500 text-white' : 'bg-white text-green-500 hover:bg-green-100'}`}
                        title="Mark as Present"
                      >
                        <FaCheckCircle size={16} />
                      </button>
                      <button 
                        onClick={() => updateAttendance(member.id, 'late')}
                        className={`rounded-full p-2 ${member.attendance === 'late' ? 'bg-yellow-500 text-white' : 'bg-white text-yellow-500 hover:bg-yellow-100'}`}
                        title="Mark as Late"
                      >
                        <FaExclamationCircle size={16} />
                      </button>
                      <button 
                        onClick={() => updateAttendance(member.id, 'absent')}
                        className={`rounded-full p-2 ${member.attendance === 'absent' ? 'bg-red-500 text-white' : 'bg-white text-red-500 hover:bg-red-100'}`}
                        title="Mark as Absent"
                      >
                        <FaTimesCircle size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  member.attendance && (
                    <div className={`flex items-center space-x-1 text-xs rounded-full px-2 py-1 ${getAttendanceStatusDisplay(member.attendance).bgColor} ${getAttendanceStatusDisplay(member.attendance).textColor}`}>
                      {getAttendanceStatusDisplay(member.attendance).icon}
                      <span>{getAttendanceStatusDisplay(member.attendance).text}</span>
                    </div>
                  )
                )}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">{member.department}</span>
                </div>
                <div className="text-sm text-gray-500">
                  ID: {member.id}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start">
                  <FaPhoneAlt className="text-gray-400 mt-1 mr-2" />
                  <span className="text-sm text-gray-600">{member.contactInfo.phone}</span>
                </div>
                
                <div className="flex items-start">
                  <FaEnvelope className="text-gray-400 mt-1 mr-2" />
                  <span className="text-sm text-gray-600">{member.contactInfo.email}</span>
                </div>
                
                <div className="flex items-start">
                  <FaCalendarAlt className="text-gray-400 mt-1 mr-2" />
                  <span className="text-sm text-gray-600">Joined {formatDate(member.joinDate)}</span>
                </div>
                
                <div className="flex items-start">
                  <FaClock className="text-gray-400 mt-1 mr-2" />
                  <span className="text-sm text-gray-600">{member.schedule.shifts}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <PerformanceRating score={member.performance} />
                
                <button 
                  onClick={() => setSelectedStaffMember(member.id)}
                  className="text-gray-500 hover:text-indigo-600"
                >
                  <FaEllipsisV />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredStaff.length === 0 && (
          <div className="col-span-full py-8 text-center text-gray-500">
            No staff members found matching your filters
          </div>
        )}
      </div>
      
      {/* Bottom spacing */}
      <div className="h-10"></div>
      
      {/* View Staff Member Modal (simplified, would need to be expanded in a real app) */}
      {selectedStaffMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800">Staff Details</h3>
              <button 
                onClick={() => setSelectedStaffMember(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              {staff.filter(member => member.id === selectedStaffMember).map(member => (
                <div key={member.id} className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-gray-800">{member.name}</h2>
                      <p className="text-indigo-600 font-medium">{member.position}</p>
                      <p className="text-gray-500 mb-2">{member.department}</p>
                      
                      <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                        <span className="mr-1">Rating:</span> <PerformanceRating score={member.performance} />
                      </div>
                      
                      {/* Attendance Status */}
                      <div className="mt-3">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full ${getAttendanceStatusDisplay(member.attendance).bgColor} ${getAttendanceStatusDisplay(member.attendance).textColor}`}>
                          {getAttendanceStatusDisplay(member.attendance).icon}
                          <span className="ml-1">{getAttendanceStatusDisplay(member.attendance).text} Today</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <FaPhoneAlt className="text-indigo-500 mt-1 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="text-gray-800">{member.contactInfo.phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <FaEnvelope className="text-indigo-500 mt-1 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-gray-800">{member.contactInfo.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <FaUserTie className="text-indigo-500 mt-1 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="text-gray-800">{member.contactInfo.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Work Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <FaCalendarAlt className="text-indigo-500 mt-1 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Join Date</p>
                            <p className="text-gray-800">{formatDate(member.joinDate)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <FaClock className="text-indigo-500 mt-1 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Schedule</p>
                            <p className="text-gray-800">{member.schedule.shifts}</p>
                            <p className="text-sm text-gray-600">
                              {member.schedule.daysOfWeek.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Attendance Management */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Attendance Management</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">Update today&apos;s attendance status:</p>
                      
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => updateAttendance(member.id, 'present')}
                          className={`flex items-center px-3 py-2 rounded ${
                            member.attendance === 'present' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-white text-green-600 border border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <FaCheckCircle className="mr-2" /> Present
                        </button>
                        
                        <button 
                          onClick={() => updateAttendance(member.id, 'late')}
                          className={`flex items-center px-3 py-2 rounded ${
                            member.attendance === 'late' 
                              ? 'bg-yellow-600 text-white' 
                              : 'bg-white text-yellow-600 border border-yellow-300 hover:bg-yellow-50'
                          }`}
                        >
                          <FaExclamationCircle className="mr-2" /> Late
                        </button>
                        
                        <button 
                          onClick={() => updateAttendance(member.id, 'absent')}
                          className={`flex items-center px-3 py-2 rounded ${
                            member.attendance === 'absent' 
                              ? 'bg-red-600 text-white' 
                              : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
                          }`}
                        >
                          <FaTimesCircle className="mr-2" /> Absent
                        </button>
                      </div>
                    </div>
                    
                    {/* Sample Attendance History */}
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Recent Attendance History</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 text-left">Date</th>
                              <th className="px-4 py-2 text-left">Status</th>
                              <th className="px-4 py-2 text-left">Check In</th>
                              <th className="px-4 py-2 text-left">Check Out</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-100">
                              <td className="px-4 py-2">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                              <td className="px-4 py-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getAttendanceStatusDisplay(member.attendance).bgColor} ${getAttendanceStatusDisplay(member.attendance).textColor}`}>
                                  {getAttendanceStatusDisplay(member.attendance).icon}
                                  <span className="ml-1">{getAttendanceStatusDisplay(member.attendance).text}</span>
                                </span>
                              </td>
                              <td className="px-4 py-2">{member.attendance !== 'absent' ? '9:05 AM' : '-'}</td>
                              <td className="px-4 py-2">{member.attendance === 'present' ? '5:30 PM' : (member.attendance === 'late' ? '6:15 PM' : '-')}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="px-4 py-2">{new Date(Date.now() - 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                              <td className="px-4 py-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                                  <FaCheckCircle className="mr-1" />
                                  Present
                                </span>
                              </td>
                              <td className="px-4 py-2">8:55 AM</td>
                              <td className="px-4 py-2">5:15 PM</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2">{new Date(Date.now() - 172800000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                              <td className="px-4 py-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                                  <FaCheckCircle className="mr-1" />
                                  Present
                                </span>
                              </td>
                              <td className="px-4 py-2">9:00 AM</td>
                              <td className="px-4 py-2">5:20 PM</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
                      Edit Details
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                      View Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 