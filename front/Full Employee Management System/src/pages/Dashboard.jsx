import { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaBuilding, 
  FaUserCheck, 
  FaUserTimes, 
  FaMoneyBillWave, 
  FaUserPlus,
  FaChartLine,
  FaCalendarCheck,
  FaDollarSign,
  FaArrowRight
} from 'react-icons/fa';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      const response = await fetch(`${API_BASE_URL}/Dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Dashboard response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      console.log('Dashboard data:', result);
      
      // Your API returns: { success: true, data: { ... } }
      setStats(result.data);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Stats Cards Configuration
  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees || 0,
      icon: FaUsers,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      path: '/employees'
    },
    {
      title: 'Departments',
      value: stats?.totalDepartments || 0,
      icon: FaBuilding,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      path: '/departments'
    },
    {
      title: 'Present Today',
      value: stats?.todayPresent || 0,
      icon: FaUserCheck,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      path: '/attendance'
    },
    {
      title: 'Absent Today',
      value: stats?.todayAbsent || 0,
      icon: FaUserTimes,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      path: '/attendance'
    },
    {
      title: 'Monthly Payroll',
      value: `$${stats?.monthlyPayroll?.toLocaleString() || 0}`,
      icon: FaMoneyBillWave,
      color: 'amber',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      path: '/payroll'
    },
  ];

  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  const quickActions = [
    { 
      label: 'Add Employee', 
      path: '/employees', 
      color: 'blue',
      icon: FaUserPlus,
      description: 'Add new employee to system'
    },
    { 
      label: 'Mark Attendance', 
      path: '/attendance', 
      color: 'green',
      icon: FaCalendarCheck,
      description: 'Mark daily attendance'
    },
    { 
      label: 'Add Department', 
      path: '/departments', 
      color: 'purple',
      icon: FaBuilding,
      description: 'Create new department'
    },
    { 
      label: 'Generate Report', 
      path: '/reports', 
      color: 'amber',
      icon: FaChartLine,
      description: 'View reports & analytics'
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Welcome back! Here's what's happening with your organization.
        </p>
        <div className="text-sm text-slate-400 mt-1">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => navigate(stat.path)}
            className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
          >
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[stat.color]}`}>
                  <stat.icon className="text-xl" />
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className={`p-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 text-left group ${
                  action.color === 'blue' ? 'bg-blue-50 hover:bg-blue-100 text-blue-600' :
                  action.color === 'green' ? 'bg-green-50 hover:bg-green-100 text-green-600' :
                  action.color === 'purple' ? 'bg-purple-50 hover:bg-purple-100 text-purple-600' :
                  'bg-amber-50 hover:bg-amber-100 text-amber-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <action.icon className="text-2xl mb-2" />
                    <p className="font-semibold">{action.label}</p>
                    <p className="text-xs opacity-75 mt-1">{action.description}</p>
                  </div>
                  <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Attendance Summary */}
        <Card title="Today's Attendance">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaUserCheck className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Present</p>
                  <p className="text-xl font-bold text-green-600">{stats?.todayPresent || 0}</p>
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats?.totalEmployees > 0 
                  ? `${Math.round((stats.todayPresent / stats.totalEmployees) * 100)}%` 
                  : '0%'}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FaUserTimes className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Absent</p>
                  <p className="text-xl font-bold text-red-600">{stats?.todayAbsent || 0}</p>
                </div>
              </div>
              <div className="text-sm text-red-600">
                {stats?.totalEmployees > 0 
                  ? `${Math.round((stats.todayAbsent / stats.totalEmployees) * 100)}%` 
                  : '0%'}
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card title="Quick Overview">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <FaUsers className="text-blue-600 text-2xl mx-auto mb-2" />
              <p className="text-sm text-slate-500">Total Employees</p>
              <p className="text-xl font-bold text-slate-800">{stats?.totalEmployees || 0}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <FaBuilding className="text-purple-600 text-2xl mx-auto mb-2" />
              <p className="text-sm text-slate-500">Departments</p>
              <p className="text-xl font-bold text-slate-800">{stats?.totalDepartments || 0}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl text-center col-span-2">
              <FaDollarSign className="text-amber-600 text-2xl mx-auto mb-2" />
              <p className="text-sm text-slate-500">Monthly Payroll</p>
              <p className="text-xl font-bold text-amber-600">
                ${stats?.monthlyPayroll?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}