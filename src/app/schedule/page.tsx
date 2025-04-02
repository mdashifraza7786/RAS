'use client';

import React, { useState } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaUserFriends,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaSave,
  FaTimes,
  FaUsers,
  FaUtensilSpoon
} from 'react-icons/fa';

// Sample data structure for schedule
interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  shifts: Shift[];
}

// Sample staff data for dropdown selection
const staffOptions = [
  { id: 'EMP001', name: 'Rajesh Kumar', position: 'Chef', department: 'Kitchen' },
  { id: 'EMP002', name: 'Priya Singh', position: 'Chef', department: 'Kitchen' },
  { id: 'EMP003', name: 'Amit Sharma', position: 'Waiter', department: 'Service' },
  { id: 'EMP004', name: 'Sneha Patel', position: 'Manager', department: 'Management' },
  { id: 'EMP005', name: 'Vikram Malhotra', position: 'Waiter', department: 'Service' },
  { id: 'EMP006', name: 'Neha Kapoor', position: 'Manager', department: 'Management' },
  { id: 'EMP007', name: 'Suresh Reddy', position: 'Chef', department: 'Kitchen' },
  { id: 'EMP008', name: 'Kavita Sharma', position: 'Waiter', department: 'Service' },
];

// Time slots for shift selection
const timeSlots = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
  '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'
];

// Department filter options
const departments = [
  'All Departments', 'Kitchen', 'Service', 'Management'
];

// Helper function to generate a week of dates starting from a given date
const generateWeekDates = (startDate: Date): DaySchedule[] => {
  const dates: DaySchedule[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    dates.push({
      date: date.toISOString().split('T')[0],
      dayName: dayNames[date.getDay()],
      shifts: []
    });
  }
  
  return dates;
};

// Sample initial schedule data
const generateInitialSchedule = () => {
  const today = new Date();
  today.setDate(today.getDate() - today.getDay()); // Start from the current week's Sunday
  
  const weekSchedule = generateWeekDates(today);
  
  // Add some sample shifts
  weekSchedule[1].shifts.push({ // Monday
    id: 's1',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    employeeId: 'EMP001',
    employeeName: 'Rajesh Kumar',
    position: 'Chef',
    department: 'Kitchen'
  });
  
  weekSchedule[1].shifts.push({
    id: 's2',
    startTime: '10:00 AM',
    endTime: '6:00 PM',
    employeeId: 'EMP002',
    employeeName: 'Priya Singh',
    position: 'Chef',
    department: 'Kitchen'
  });
  
  weekSchedule[2].shifts.push({ // Tuesday
    id: 's3',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    employeeId: 'EMP001',
    employeeName: 'Rajesh Kumar',
    position: 'Chef',
    department: 'Kitchen'
  });
  
  weekSchedule[3].shifts.push({ // Wednesday
    id: 's4',
    startTime: '4:00 PM',
    endTime: '12:00 AM',
    employeeId: 'EMP003',
    employeeName: 'Amit Sharma',
    position: 'Waiter',
    department: 'Service'
  });
  
  weekSchedule[4].shifts.push({ // Thursday
    id: 's5',
    startTime: '5:00 PM',
    endTime: '1:00 AM',
    employeeId: 'EMP004',
    employeeName: 'Sneha Patel',
    position: 'Manager',
    department: 'Management'
  });
  
  weekSchedule[5].shifts.push({ // Friday
    id: 's6',
    startTime: '6:00 PM',
    endTime: '2:00 AM',
    employeeId: 'EMP005',
    employeeName: 'Vikram Malhotra',
    position: 'Waiter',
    department: 'Service'
  });
  
  // Add more shifts
  for (let i = 0; i < 7; i++) {
    if (i >= 2 && i <= 6) { // Tuesday through Saturday
      weekSchedule[i].shifts.push({
        id: `s${i+6}`,
        startTime: '10:00 AM',
        endTime: '6:00 PM',
        employeeId: 'EMP007',
        employeeName: 'Suresh Reddy',
        position: 'Chef',
        department: 'Kitchen'
      });
    }
    
    if (i !== 1 && i !== 4) { // All days except Monday and Thursday
      weekSchedule[i].shifts.push({
        id: `s${i+13}`,
        startTime: '4:00 PM',
        endTime: '12:00 AM',
        employeeId: 'EMP006',
        employeeName: 'Neha Kapoor',
        position: 'Manager',
        department: 'Management'
      });
    }
  }
  
  return weekSchedule;
};

// Department icon mapping
const getDepartmentIcon = (department: string) => {
  switch(department) {
    case 'Kitchen':
      return <FaUtensilSpoon className="mr-2 text-orange-500" />;
    case 'Service':
      return <FaUserFriends className="mr-2 text-blue-500" />;
    case 'Management':
      return <FaUsers className="mr-2 text-purple-500" />;
    default:
      return <FaUsers className="mr-2 text-gray-500" />;
  }
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function SchedulePage() {
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>(generateInitialSchedule());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay()); // Start from Sunday
    return today;
  });
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [newShift, setNewShift] = useState({
    dayIndex: 0,
    employeeId: '',
    startTime: '9:00 AM',
    endTime: '5:00 PM'
  });
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(prevWeek);
    setWeekSchedule(generateWeekDates(prevWeek));
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
    setWeekSchedule(generateWeekDates(nextWeek));
  };
  
  // Go to current week
  const goToCurrentWeek = () => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay()); // Start from Sunday
    setCurrentWeekStart(today);
    setWeekSchedule(generateInitialSchedule());
  };
  
  // Filter shifts by department
  const getFilteredShifts = (shifts: Shift[]) => {
    if (selectedDepartment === 'All Departments') {
      return shifts;
    }
    return shifts.filter(shift => shift.department === selectedDepartment);
  };
  
  // Start adding a new shift
  const handleAddShift = (dayIndex: number) => {
    setNewShift({
      dayIndex,
      employeeId: '',
      startTime: '9:00 AM',
      endTime: '5:00 PM'
    });
    setIsAddingShift(true);
  };
  
  // Save a new shift
  const handleSaveShift = () => {
    if (!newShift.employeeId) {
      alert('Please select an employee');
      return;
    }
    
    const employee = staffOptions.find(staff => staff.id === newShift.employeeId);
    if (!employee) return;
    
    const updatedSchedule = [...weekSchedule];
    updatedSchedule[newShift.dayIndex].shifts.push({
      id: `s${Date.now()}`,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      employeeId: employee.id,
      employeeName: employee.name,
      position: employee.position,
      department: employee.department
    });
    
    setWeekSchedule(updatedSchedule);
    setIsAddingShift(false);
  };
  
  // Cancel adding a new shift
  const handleCancelAddShift = () => {
    setIsAddingShift(false);
  };
  
  // Remove a shift
  const handleRemoveShift = (dayIndex: number, shiftId: string) => {
    const updatedSchedule = [...weekSchedule];
    updatedSchedule[dayIndex].shifts = updatedSchedule[dayIndex].shifts.filter(
      shift => shift.id !== shiftId
    );
    setWeekSchedule(updatedSchedule);
  };
  
  // Format the date range for display
  const formatDateRange = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    
    const startFormatted = currentWeekStart.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    const endFormatted = endDate.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Schedule Management</h1>
          <p className="text-gray-600">Weekly staff scheduling and shift planning</p>
        </div>
        
        <div>
          <button 
            onClick={goToCurrentWeek}
            className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 mr-3"
          >
            Current Week
          </button>
          <button onClick={() => {}} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Publish Schedule
          </button>
        </div>
      </div>
      
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={goToPreviousWeek}
          className="flex items-center px-3 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
        >
          <FaChevronLeft className="mr-1" /> Previous Week
        </button>
        
        <h2 className="text-lg font-semibold text-gray-800">
          <FaCalendarAlt className="inline-block mr-2 text-indigo-600" />
          {formatDateRange()}
        </h2>
        
        <button 
          onClick={goToNextWeek}
          className="flex items-center px-3 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
        >
          Next Week <FaChevronRight className="ml-1" />
        </button>
      </div>
      
      {/* Department Filters */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {departments.map((department) => (
            <button
              key={department}
              onClick={() => setSelectedDepartment(department)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedDepartment === department
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {department === 'All Departments' ? (
                <FaUsers className="inline-block mr-1" />
              ) : (
                getDepartmentIcon(department)
              )}
              {department}
            </button>
          ))}
        </div>
      </div>
      
      {/* Weekly Schedule Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {weekSchedule.map((day, dayIndex) => (
            <div key={day.date} className="min-w-0">
              {/* Day Header */}
              <div className={`p-3 text-center ${day.dayName === 'Sunday' || day.dayName === 'Saturday' ? 'bg-pink-50' : 'bg-gray-50'}`}>
                <p className="font-medium text-gray-800">{day.dayName}</p>
                <p className="text-sm text-gray-500">{formatDate(day.date)}</p>
              </div>
              
              {/* Day Shifts Container */}
              <div className="p-2 min-h-[500px]">
                {/* Shifts */}
                {getFilteredShifts(day.shifts).map((shift) => (
                  <div 
                    key={shift.id} 
                    className={`mb-2 p-2 rounded text-xs border-l-4 ${
                      shift.department === 'Kitchen' ? 'border-l-orange-500 bg-orange-50' :
                      shift.department === 'Service' ? 'border-l-blue-500 bg-blue-50' :
                      shift.department === 'Management' ? 'border-l-purple-500 bg-purple-50' :
                      'border-l-gray-500 bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{shift.employeeName}</div>
                    <div className="text-gray-500">{shift.position}</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center text-gray-600">
                        <FaClock className="mr-1" size={10} />
                        {shift.startTime} - {shift.endTime}
                      </div>
                      <button 
                        onClick={() => handleRemoveShift(dayIndex, shift.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Add Shift Button */}
                <button 
                  onClick={() => handleAddShift(dayIndex)}
                  className="w-full py-1 mt-2 text-xs text-indigo-600 border border-dashed border-indigo-300 rounded hover:bg-indigo-50 flex items-center justify-center"
                >
                  <FaPlus className="mr-1" /> Add Shift
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Schedule Notes */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">Schedule Notes</h3>
        <textarea 
          placeholder="Add notes for this week's schedule..."
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={2}
        />
      </div>
      
      {/* Add Shift Modal */}
      {isAddingShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800">
                Add Shift - {weekSchedule[newShift.dayIndex].dayName}
              </h3>
              <button 
                onClick={handleCancelAddShift}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Employee
                </label>
                <select 
                  value={newShift.employeeId} 
                  onChange={(e) => setNewShift({...newShift, employeeId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Employee --</option>
                  {staffOptions.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} - {staff.position}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Time Range Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <select 
                    value={newShift.startTime} 
                    onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {timeSlots.map(time => (
                      <option key={`start-${time}`} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <select 
                    value={newShift.endTime} 
                    onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {timeSlots.map(time => (
                      <option key={`end-${time}`} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  onClick={handleCancelAddShift}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveShift}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
                >
                  <FaSave className="mr-2" /> Save Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 