import { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaCalendarCheck, 
  FaMoneyBillWave, 
  FaFileDownload, 
  FaPrint, 
  FaSearch,
  FaSync,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaMedal,
  FaTrophy,
  FaChartLine,
  FaBuilding
} from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../services/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reportType, setReportType] = useState('employees');
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [payrollData, setPayrollData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const { token } = useAuth();

  // Auto-fetch when report type changes
  useEffect(() => {
    if (reportType === 'employees') {
      fetchEmployees();
    } else if (reportType === 'attendance') {
      fetchAttendanceSummary();
    } else if (reportType === 'payroll') {
      fetchPayroll();
    }
  }, [reportType]);

  // Re-fetch attendance when date range changes
  useEffect(() => {
    if (reportType === 'attendance') {
      fetchAttendanceSummary();
    }
  }, [startDate, endDate]);

  // Re-fetch payroll when month changes
  useEffect(() => {
    if (reportType === 'payroll') {
      fetchPayroll();
    }
  }, [selectedMonth]);

  // ============ EMPLOYEE REPORT ============
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Employee`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch employees');
      const result = await response.json();
      
      if (result && result.data) {
        setEmployeeData(result.data);
      } else if (Array.isArray(result)) {
        setEmployeeData(result);
      } else {
        setEmployeeData([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employee report');
      setEmployeeData([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ ATTENDANCE SUMMARY ============
  const fetchAttendanceSummary = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/Attendance/summary?startDate=${startDate}&endDate=${endDate}`;
      console.log('Fetching attendance summary from:', url);
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch attendance summary');
      }
      
      const result = await response.json();
      console.log('Attendance summary:', result);
      
      if (result && result.data) {
        setAttendanceSummary(result.data);
        setAttendanceData(result.data.employeeSummaries || []);
      } else {
        setAttendanceSummary(null);
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      toast.error('Failed to load attendance report');
      setAttendanceSummary(null);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ PAYROLL REPORT ============
  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Payroll/month?month=${selectedMonth}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch payroll');
      }
      
      const result = await response.json();
      
      if (result && result.data) {
        setPayrollData(result.data);
      } else if (Array.isArray(result)) {
        setPayrollData(result);
      } else {
        setPayrollData([]);
      }
    } catch (error) {
      console.error('Error fetching payroll:', error);
      toast.error('Failed to load payroll report');
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ REFRESH ============
  const handleRefresh = () => {
    if (reportType === 'employees') fetchEmployees();
    else if (reportType === 'attendance') fetchAttendanceSummary();
    else if (reportType === 'payroll') fetchPayroll();
  };

  // ============ HANDLE CARD CLICK ============
  const handleCardClick = (type) => {
    setReportType(type);
  };

  // ============ COLUMNS ============
  const employeeColumns = [
    { key: 'employeeID', header: 'ID', width: '70px' },
    { 
      key: 'fullName', 
      header: 'Name',
      render: (_, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unknown'
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { 
      key: 'salary', 
      header: 'Salary',
      render: (value) => `$${value?.toLocaleString() || 0}`
    },
    { key: 'departmentName', header: 'Department' },
    { key: 'gender', header: 'Gender' },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          value === 'Active' ? 'bg-green-100 text-green-700' :
          value === 'Inactive' ? 'bg-red-100 text-red-700' :
          'bg-amber-100 text-amber-700'
        }`}>
          {value || 'Active'}
        </span>
      ),
    },
    { 
      key: 'hireDate', 
      header: 'Hire Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
  ];

  // ============ ATTENDANCE SUMMARY COLUMNS ============
  const attendanceSummaryColumns = [
    { key: 'employeeID', header: 'ID', width: '60px' },
    { key: 'employeeName', header: 'Employee' },
    { key: 'departmentName', header: 'Department' },
    { 
      key: 'totalDays', 
      header: 'Total Days',
      render: (value) => value || 0
    },
    { 
      key: 'presentDays', 
      header: 'Present',
      render: (value) => <span className="text-green-600 font-medium">{value || 0}</span>
    },
    { 
      key: 'absentDays', 
      header: 'Absent',
      render: (value) => <span className="text-red-600 font-medium">{value || 0}</span>
    },
    { 
      key: 'leaveDays', 
      header: 'Leave',
      render: (value) => <span className="text-amber-600 font-medium">{value || 0}</span>
    },
    { 
      key: 'lateDays', 
      header: 'Late',
      render: (value) => <span className="text-orange-600 font-medium">{value || 0}</span>
    },
    {
      key: 'attendancePercentage',
      header: 'Attendance %',
      render: (value) => {
        const percentage = value || 0;
        const color = percentage >= 90 ? 'text-green-600' : 
                      percentage >= 75 ? 'text-amber-600' : 'text-red-600';
        return (
          <span className={`font-bold ${color}`}>
            {percentage.toFixed(1)}%
          </span>
        );
      }
    },
  ];

  const payrollColumns = [
    { key: 'payrollID', header: 'ID', width: '70px' },
    { key: 'employeeName', header: 'Employee' },
    { key: 'departmentName', header: 'Department' },
    { 
      key: 'basicSalary', 
      header: 'Basic Salary',
      render: (value) => `$${value?.toLocaleString() || 0}`
    },
    { 
      key: 'bonus', 
      header: 'Bonus',
      render: (value) => `$${value?.toLocaleString() || 0}`
    },
    { 
      key: 'deductions', 
      header: 'Deductions',
      render: (value) => `$${value?.toLocaleString() || 0}`
    },
    { 
      key: 'netSalary', 
      header: 'Net Salary',
      render: (value) => `$${value?.toLocaleString() || 0}`
    },
    { 
      key: 'paymentMonth', 
      header: 'Month',
      render: (value) => value ? new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '-'
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      render: (value) => {
        const styles = {
          'Paid': 'bg-green-100 text-green-700',
          'Pending': 'bg-amber-100 text-amber-700',
          'Cancelled': 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[value] || 'bg-slate-100 text-slate-700'}`}>
            {value || 'Pending'}
          </span>
        );
      }
    },
  ];

  // ============ RENDER FUNCTIONS ============
  const renderEmployeeReport = () => (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">
            Total Employees: <span className="font-bold text-slate-800">{employeeData.length}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Active: {employeeData.filter(e => e.status === 'Active').length} · 
            Inactive: {employeeData.filter(e => e.status === 'Inactive').length}
          </p>
        </div>
      </div>
      <Table columns={employeeColumns} data={employeeData} loading={loading} />
    </div>
  );

  // ============ ATTENDANCE SUMMARY RENDER ============
  const renderAttendanceReport = () => {
    const summary = attendanceSummary;
    
    return (
      <div>
        {/* Date Range */}
        <div className="flex flex-wrap gap-4 mb-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Button variant="secondary" onClick={fetchAttendanceSummary}>
              <FaSearch className="mr-2" /> Load
            </Button>
          </div>
          <div>
            <Button variant="outline" onClick={() => {
              setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
            }}>
              Last 7 Days
            </Button>
          </div>
          <div>
            <Button variant="outline" onClick={() => {
              setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
            }}>
              Last 30 Days
            </Button>
          </div>
        </div>

        {/* Summary Statistics Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="p-4 text-center border-blue-200 bg-blue-50">
              <p className="text-sm text-blue-600">Total Employees</p>
              <p className="text-2xl font-bold text-blue-700">{summary.totalEmployees}</p>
            </Card>
            <Card className="p-4 text-center border-green-200 bg-green-50">
              <p className="text-sm text-green-600">Total Present</p>
              <p className="text-2xl font-bold text-green-700">{summary.totalPresent}</p>
            </Card>
            <Card className="p-4 text-center border-red-200 bg-red-50">
              <p className="text-sm text-red-600">Total Absent</p>
              <p className="text-2xl font-bold text-red-700">{summary.totalAbsent}</p>
            </Card>
            <Card className="p-4 text-center border-amber-200 bg-amber-50">
              <p className="text-sm text-amber-600">Total Leave</p>
              <p className="text-2xl font-bold text-amber-700">{summary.totalLeave}</p>
            </Card>
            <Card className="p-4 text-center border-orange-200 bg-orange-50">
              <p className="text-sm text-orange-600">Total Late</p>
              <p className="text-2xl font-bold text-orange-700">{summary.totalLate}</p>
            </Card>
          </div>
        )}

        {/* Most Absent / Most Present */}
        {attendanceData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card title="🏆 Most Present Employees" className="border-green-200">
              <div className="space-y-2">
                {[...attendanceData]
                  .sort((a, b) => b.presentDays - a.presentDays)
                  .slice(0, 5)
                  .map((emp, index) => (
                    <div key={emp.employeeID} className="flex items-center justify-between p-2 hover:bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-green-600">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-slate-800">{emp.employeeName}</p>
                          <p className="text-xs text-slate-500">{emp.departmentName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{emp.presentDays} days</p>
                        <p className="text-xs text-slate-500">{emp.attendancePercentage}%</p>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            <Card title="⚠️ Most Absent Employees" className="border-red-200">
              <div className="space-y-2">
                {[...attendanceData]
                  .sort((a, b) => b.absentDays - a.absentDays)
                  .slice(0, 5)
                  .filter(emp => emp.absentDays > 0)
                  .map((emp, index) => (
                    <div key={emp.employeeID} className="flex items-center justify-between p-2 hover:bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-red-600">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-slate-800">{emp.employeeName}</p>
                          <p className="text-xs text-slate-500">{emp.departmentName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{emp.absentDays} days</p>
                        <p className="text-xs text-slate-500">{emp.attendancePercentage}%</p>
                      </div>
                    </div>
                  ))}
                {attendanceData.filter(emp => emp.absentDays > 0).length === 0 && (
                  <p className="text-center text-green-600 py-4">✅ All employees have perfect attendance!</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Full Attendance Table */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-slate-500">
            Total Records: <span className="font-bold text-slate-800">{attendanceData.length}</span>
          </p>
          <div className="flex gap-3 text-xs">
            <span className="text-green-600">● Present: {attendanceData.reduce((sum, a) => sum + (a.presentDays || 0), 0)}</span>
            <span className="text-red-600">● Absent: {attendanceData.reduce((sum, a) => sum + (a.absentDays || 0), 0)}</span>
            <span className="text-amber-600">● Leave: {attendanceData.reduce((sum, a) => sum + (a.leaveDays || 0), 0)}</span>
          </div>
        </div>
        <Table
          columns={attendanceSummaryColumns}
          data={attendanceData}
          loading={loading}
        />
        {!loading && attendanceData.length === 0 && (
          <div className="text-center py-8">
            <FaCalendarCheck className="text-4xl text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No attendance records found for this period</p>
          </div>
        )}
      </div>
    );
  };

  const renderPayrollReport = () => (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <Button variant="secondary" onClick={fetchPayroll}>
            <FaSearch className="mr-2" /> Load
          </Button>
        </div>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-slate-500">
          Total Records: <span className="font-bold text-slate-800">{payrollData.length}</span>
        </p>
        <div className="flex gap-3 text-xs">
          <span className="text-green-600">● Paid: {payrollData.filter(p => p.paymentStatus === 'Paid').length}</span>
          <span className="text-amber-600">● Pending: {payrollData.filter(p => p.paymentStatus === 'Pending').length}</span>
        </div>
      </div>
      <Table columns={payrollColumns} data={payrollData} loading={loading} />
      {!loading && payrollData.length === 0 && (
        <div className="text-center py-8">
          <FaMoneyBillWave className="text-4xl text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">No payroll records found for this month</p>
        </div>
      )}
    </div>
  );

  const renderReportContent = () => {
    if (loading && 
        employeeData.length === 0 && 
        attendanceData.length === 0 && 
        payrollData.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader size="lg" />
        </div>
      );
    }

    switch (reportType) {
      case 'employees':
        return renderEmployeeReport();
      case 'attendance':
        return renderAttendanceReport();
      case 'payroll':
        return renderPayrollReport();
      default:
        return (
          <div className="text-center py-12">
            <p className="text-slate-500">Select a report type</p>
          </div>
        );
    }
  };

  const reports = [
    {
      id: 'employees',
      title: 'Employee Report',
      icon: FaUsers,
      color: 'blue',
      description: 'Complete list of all employees with their details',
      count: employeeData.length
    },
    {
      id: 'attendance',
      title: 'Attendance Report',
      icon: FaCalendarCheck,
      color: 'green',
      description: 'Employee attendance summary with rankings',
      count: attendanceData.length
    },
    {
      id: 'payroll',
      title: 'Payroll Report',
      icon: FaMoneyBillWave,
      color: 'amber',
      description: 'Salary details and payment summary',
      count: payrollData.length
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 mt-1">Generate and export reports</p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {reports.map((report) => (
          <div
            key={report.id}
            onClick={() => handleCardClick(report.id)}
            className={`cursor-pointer transition-all hover:scale-105 ${
              reportType === report.id ? 'ring-2 ring-blue-500 shadow-lg rounded-2xl' : ''
            }`}
          >
            <Card>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  report.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  report.color === 'green' ? 'bg-green-100 text-green-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  <report.icon className="text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{report.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{report.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {report.count} {report.count === 1 ? 'record' : 'records'}
                  </p>
                  {reportType === report.id && (
                    <span className="text-xs text-blue-600 font-medium mt-1 inline-block">✓ Active</span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Report Content */}
      <Card title={`${reports.find(r => r.id === reportType)?.title || 'Reports'} Preview`}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button>
              <FaFileDownload className="mr-2" /> Export PDF
            </Button>
            <Button variant="outline">
              <FaPrint className="mr-2" /> Print
            </Button>
            <Button variant="outline" onClick={handleRefresh}>
              <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            {renderReportContent()}
          </div>
        </div>
      </Card>
    </div>
  );
}