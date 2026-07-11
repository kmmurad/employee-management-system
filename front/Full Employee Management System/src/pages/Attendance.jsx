// ============================================================
// ATTENDANCE PAGE
// Mark daily attendance for all employees
// ============================================================

import { useState, useEffect } from 'react';
import { 
  FaCheck, FaTimes, FaClock, FaCalendarAlt, 
  FaSave, FaUndo, FaUsers 
} from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../services/api';
import toast from 'react-hot-toast';

export default function Attendance() {
  
  // ============================================================
  // STATE VARIABLES
  // ============================================================
  const [attendanceData, setAttendanceData] = useState([]);     // List of employees with attendance
  const [loading, setLoading] = useState(true);                 // Loading spinner
  const [saving, setSaving] = useState(false);                 // Saving spinner
  const [selectedDate, setSelectedDate] = useState(            // Selected date
    new Date().toISOString().split('T')[0]
  );
  const [modifiedEmployees, setModifiedEmployees] = useState(new Set()); // Track changes
  const { token } = useAuth();                                 // JWT token for API calls

  // ============================================================
  // LOAD ATTENDANCE WHEN DATE CHANGES
  // ============================================================
  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  // ============================================================
  // FETCH ATTENDANCE FROM API
  // ============================================================
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/Attendance/date?date=${selectedDate}`;
      console.log('Fetching attendance from:', url);
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch attendance');
      }
      
      const result = await response.json();
      console.log('Attendance data:', result);
      
      // Extract data from API response
      if (result && result.data) {
        setAttendanceData(result.data);
      } else if (Array.isArray(result)) {
        setAttendanceData(result);
      } else {
        setAttendanceData([]);
      }
      
      // Clear modified tracking
      setModifiedEmployees(new Set());
      
    } catch (error) {
      console.error('Fetch attendance error:', error);
      toast.error('Failed to load attendance');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HANDLE STATUS CHANGE (Present, Absent, Leave)
  // ============================================================
  const handleStatusChange = (employeeId, newStatus) => {
    // Update the employee's status
    setAttendanceData(prev => prev.map(emp => {
      if (emp.employeeID === employeeId) {
        const updated = { ...emp, status: newStatus };
        // Mark as modified (pending save)
        setModifiedEmployees(prevSet => {
          const newSet = new Set(prevSet);
          newSet.add(employeeId);
          return newSet;
        });
        return updated;
      }
      return emp;
    }));
  };

  // ============================================================
  // SAVE ALL ATTENDANCE CHANGES
  // ============================================================
  const handleSaveAll = async () => {
    // Check if there are changes to save
    if (modifiedEmployees.size === 0) {
      toast.info('No changes to save');
      return;
    }

    setSaving(true);
    try {
      // Prepare data for saving
      const dataToSave = attendanceData
        .filter(emp => modifiedEmployees.has(emp.employeeID))
        .map(emp => ({
          employeeId: emp.employeeID,
          attendanceDate: selectedDate,
          status: emp.status || 'Absent',
          remarks: `Marked as ${emp.status} on ${selectedDate}`
        }));

      console.log('Saving attendance:', dataToSave);

      // Send to API
      const response = await fetch(`${API_BASE_URL}/Attendance/save-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to save attendance');
      }

      const result = await response.json();
      console.log('Save response:', result);

      toast.success(`Attendance saved successfully for ${selectedDate}`);
      
      // Clear modified tracking and refresh
      setModifiedEmployees(new Set());
      await fetchAttendance();
      
    } catch (error) {
      console.error('Save attendance error:', error);
      toast.error('Failed to save attendance: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RESET ALL TO ABSENT
  // ============================================================
  const handleResetAll = () => {
    if (!window.confirm('Are you sure you want to reset all attendance to Absent for this day?')) {
      return;
    }

    setAttendanceData(prev => prev.map(emp => {
      const updated = { ...emp, status: 'Absent' };
      setModifiedEmployees(prevSet => {
        const newSet = new Set(prevSet);
        newSet.add(emp.employeeID);
        return newSet;
      });
      return updated;
    }));
    
    toast.info('All employees set to Absent. Click Save to confirm.');
  };

  // ============================================================
  // GET STATUS BADGE (Color-coded status)
  // ============================================================
  const getStatusBadge = (status) => {
    const styles = {
      'Present': 'bg-green-100 text-green-700',
      'Absent': 'bg-red-100 text-red-700',
      'Leave': 'bg-amber-100 text-amber-700',
      'Late': 'bg-orange-100 text-orange-700',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
        {status || 'Absent'}
      </span>
    );
  };

  // ============================================================
  // TABLE COLUMNS
  // ============================================================
  const columns = [
    { 
      key: 'employeeID', 
      header: 'ID', 
      width: '70px' 
    },
    {
      key: 'employeeName',
      header: 'Employee',
      render: (_, row) => {
        const name = `${row.firstName || ''} ${row.lastName || ''}`.trim();
        return name || row.employeeName || 'Unknown';
      }
    },
    { 
      key: 'departmentName', 
      header: 'Department',
      render: (_, row) => row.departmentName || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => {
        const isModified = modifiedEmployees.has(row.employeeID);
        return (
          <div className="flex items-center gap-1.5">
            {/* Present Button */}
            <button
              onClick={() => handleStatusChange(row.employeeID, 'Present')}
              className={`p-1.5 rounded-lg transition-colors ${
                row.status === 'Present' ? 'bg-green-500 text-white' : 'text-green-600 hover:bg-green-50'
              }`}
              title="Mark Present"
            >
              <FaCheck className="text-sm" />
            </button>
            
            {/* Absent Button */}
            <button
              onClick={() => handleStatusChange(row.employeeID, 'Absent')}
              className={`p-1.5 rounded-lg transition-colors ${
                row.status === 'Absent' ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50'
              }`}
              title="Mark Absent"
            >
              <FaTimes className="text-sm" />
            </button>
            
            {/* Leave Button */}
            <button
              onClick={() => handleStatusChange(row.employeeID, 'Leave')}
              className={`p-1.5 rounded-lg transition-colors ${
                row.status === 'Leave' ? 'bg-amber-500 text-white' : 'text-amber-600 hover:bg-amber-50'
              }`}
              title="Mark Leave"
            >
              <FaClock className="text-sm" />
            </button>
            
            {/* Modified Indicator */}
            {isModified && (
              <span className="text-xs text-blue-500 ml-1 font-bold">*</span>
            )}
          </div>
        );
      },
    },
  ];

  // ============================================================
  // CALCULATE STATISTICS
  // ============================================================
  const totalEmployees = attendanceData.length;
  const presentCount = attendanceData.filter(d => d.status === 'Present').length;
  const absentCount = attendanceData.filter(d => d.status === 'Absent').length;
  const leaveCount = attendanceData.filter(d => d.status === 'Leave').length;

  // ============================================================
  // RENDER ATTENDANCE PAGE
  // ============================================================
  return (
    <div>
      
      {/* ============================================================
          PAGE HEADER
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
          <p className="text-slate-500 mt-1">Mark daily attendance for employees</p>
        </div>
        <div className="flex gap-2">
          {/* Reset All Button */}
          <Button 
            variant="outline" 
            onClick={handleResetAll}
            disabled={loading}
          >
            <FaUndo className="mr-2" /> Reset All
          </Button>
          
          {/* Save All Button */}
          <Button 
            onClick={handleSaveAll}
            loading={saving}
            disabled={loading || modifiedEmployees.size === 0}
          >
            <FaSave className="mr-2" /> Save All {modifiedEmployees.size > 0 && `(${modifiedEmployees.size})`}
          </Button>
        </div>
      </div>

      {/* ============================================================
          DATE SELECTION
          ============================================================ */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Button variant="secondary" onClick={fetchAttendance}>
              <FaCalendarAlt className="mr-2" /> Load
            </Button>
          </div>
          <div>
            <Button variant="outline" onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              fetchAttendance();
            }}>
              Today
            </Button>
          </div>
        </div>
      </Card>

      {/* ============================================================
          STATISTICS CARDS
          ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center border-blue-200 bg-blue-50">
          <p className="text-sm text-blue-600">Total Employees</p>
          <p className="text-2xl font-bold text-blue-700">{totalEmployees}</p>
        </Card>
        <Card className="p-4 text-center border-green-200 bg-green-50">
          <p className="text-sm text-green-600">Present</p>
          <p className="text-2xl font-bold text-green-700">{presentCount}</p>
        </Card>
        <Card className="p-4 text-center border-red-200 bg-red-50">
          <p className="text-sm text-red-600">Absent</p>
          <p className="text-2xl font-bold text-red-700">{absentCount}</p>
        </Card>
        <Card className="p-4 text-center border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-600">Leave</p>
          <p className="text-2xl font-bold text-amber-700">{leaveCount}</p>
        </Card>
      </div>

      {/* ============================================================
          ATTENDANCE TABLE
          ============================================================ */}
      <Card>
        {/* Table Header Info */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-slate-500">
            {modifiedEmployees.size > 0 ? (
              <span className="text-blue-600 font-medium">
                {modifiedEmployees.size} employee(s) modified. Click Save to confirm.
              </span>
            ) : (
              <span>No changes pending</span>
            )}
          </p>
          <p className="text-sm text-slate-400">
            Date: <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
            <span className="ml-2 text-blue-500">({totalEmployees} employees)</span>
          </p>
        </div>
        
        {/* Table */}
        <Table
          columns={columns}
          data={attendanceData}
          loading={loading}
        />
        
        {/* Empty State */}
        {!loading && attendanceData.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-slate-500">No active employees found</p>
            <p className="text-sm text-slate-400 mt-1">Add employees first to mark attendance</p>
          </div>
        )}
      </Card>

      {/* ============================================================
          LEGEND
          ============================================================ */}
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="text-sm text-slate-600">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="text-sm text-slate-600">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
          <span className="text-sm text-slate-600">Leave</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          <span className="text-sm text-slate-600">Modified (pending save)</span>
        </div>
      </div>
    </div>
  );
}