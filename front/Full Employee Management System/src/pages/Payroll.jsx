import { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaSearch, 
  FaPrint, 
  FaPlus, 
  FaSave, 
  FaTimes,
  FaDollarSign,
  FaCalculator
} from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../services/api';
import toast from 'react-hot-toast';

export default function Payroll() {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    basicSalary: '',
    bonus: '0',
    deductions: '0',
    paymentMonth: new Date().toISOString().slice(0, 7),
    paymentStatus: 'Pending'
  });
  const [calculatedNet, setCalculatedNet] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchPayroll();
    fetchEmployees();
  }, [selectedMonth]);

  const fetchEmployees = async () => {
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
        setEmployees(result.data);
      } else if (Array.isArray(result)) {
        setEmployees(result);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employees');
    }
  };

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
        setPayroll(result.data);
      } else if (Array.isArray(result)) {
        setPayroll(result);
      } else {
        setPayroll([]);
      }
    } catch (error) {
      console.error('Fetch payroll error:', error);
      toast.error('Failed to load payroll');
      setPayroll([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateNetSalary = (basic, bonus, deductions) => {
    const basicNum = parseFloat(basic) || 0;
    const bonusNum = parseFloat(bonus) || 0;
    const deductionsNum = parseFloat(deductions) || 0;
    return basicNum + bonusNum - deductionsNum;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      const net = calculateNetSalary(
        name === 'basicSalary' ? value : newData.basicSalary,
        name === 'bonus' ? value : newData.bonus,
        name === 'deductions' ? value : newData.deductions
      );
      setCalculatedNet(net);
      return newData;
    });
  };

  const handleEmployeeSelect = (e) => {
    const employeeId = e.target.value;
    const selectedEmp = employees.find(emp => 
      emp.employeeID == employeeId || emp.employeeId == employeeId
    );
    
    setFormData(prev => ({
      ...prev,
      employeeId: employeeId,
      basicSalary: selectedEmp?.salary || ''
    }));
    
    const net = calculateNetSalary(
      selectedEmp?.salary || 0,
      formData.bonus,
      formData.deductions
    );
    setCalculatedNet(net);
  };

  // 🔥 FIXED: Create Payroll
  const handleCreatePayroll = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId) {
      toast.error('Please select an employee');
      return;
    }

    if (!formData.basicSalary || parseFloat(formData.basicSalary) <= 0) {
      toast.error('Please enter a valid salary');
      return;
    }

    setIsSubmitting(true);
    try {
      // 🔥 FIX: Format date properly
      const paymentDate = new Date(formData.paymentMonth + '-01');
      
      const payrollData = {
        employeeId: parseInt(formData.employeeId),
        basicSalary: parseFloat(formData.basicSalary),
        bonus: parseFloat(formData.bonus) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        paymentMonth: paymentDate.toISOString(),
        paymentStatus: formData.paymentStatus
      };

      console.log('Creating payroll:', payrollData);

      const response = await fetch(`${API_BASE_URL}/Payroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payrollData),
      });

      const result = await response.json();
      console.log('Create response:', result);

      if (!response.ok) {
        // Show validation errors
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(result.message || 'Failed to create payroll');
      }

      toast.success('Payroll created successfully!');
      setShowCreateModal(false);
      resetForm();
      await fetchPayroll();
    } catch (error) {
      console.error('Create payroll error:', error);
      toast.error('Failed to create payroll: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      basicSalary: '',
      bonus: '0',
      deductions: '0',
      paymentMonth: new Date().toISOString().slice(0, 7),
      paymentStatus: 'Pending'
    });
    setCalculatedNet(0);
  };

  const getPaymentStatusBadge = (status) => {
    const styles = {
      'Paid': 'bg-green-100 text-green-700',
      'Pending': 'bg-amber-100 text-amber-700',
      'Cancelled': 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
        {status || 'Pending'}
      </span>
    );
  };

  const columns = [
    { key: 'payrollID', header: 'ID', width: '70px' },
    {
      key: 'employeeName',
      header: 'Employee',
      render: (_, row) => {
        const name = `${row.firstName || ''} ${row.lastName || ''}`.trim();
        return name || row.employeeName || 'Unknown';
      }
    },
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
      render: (value) => (
        <span className="font-bold text-blue-600">${value?.toLocaleString() || 0}</span>
      )
    },
    { 
      key: 'paymentMonth', 
      header: 'Month',
      render: (value) => value ? new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '-'
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      render: (value) => getPaymentStatusBadge(value),
    },
  ];

  const totalBasic = payroll.reduce((sum, p) => sum + (p.basicSalary || 0), 0);
  const totalBonus = payroll.reduce((sum, p) => sum + (p.bonus || 0), 0);
  const totalDeductions = payroll.reduce((sum, p) => sum + (p.deductions || 0), 0);
  const totalNet = payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payroll</h1>
          <p className="text-slate-500 mt-1">Manage employee salaries</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowCreateModal(true)}>
            <FaPlus className="mr-2" /> Create Payroll
          </Button>
          <Button variant="outline">
            <FaPrint className="mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* Month Filter */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Button variant="secondary" onClick={fetchPayroll}>
              <FaSearch className="mr-2" /> Load Payroll
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Basic</p>
          <p className="text-xl font-bold text-slate-800">${totalBasic.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Bonus</p>
          <p className="text-xl font-bold text-green-600">${totalBonus.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Deductions</p>
          <p className="text-xl font-bold text-red-600">${totalDeductions.toLocaleString()}</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-600">Total Net Payroll</p>
          <p className="text-xl font-bold text-blue-700">${totalNet.toLocaleString()}</p>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <Table
          columns={columns}
          data={payroll}
          loading={loading}
        />
        {!loading && payroll.length === 0 && (
          <div className="text-center py-8">
            <FaMoneyBillWave className="text-4xl text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No payroll records found for this month</p>
            <p className="text-sm text-slate-400 mt-1">Click "Create Payroll" to add a record</p>
          </div>
        )}
      </Card>

      {/* Create Payroll Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Payroll Record"
        size="lg"
      >
        <form onSubmit={handleCreatePayroll} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.employeeId}
                onChange={handleEmployeeSelect}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.employeeID || emp.employeeId} value={emp.employeeID || emp.employeeId}>
                    {emp.firstName} {emp.lastName} - ${emp.salary?.toLocaleString() || 0}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Month */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Payment Month <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                name="paymentMonth"
                required
                value={formData.paymentMonth}
                onChange={handleFormChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Basic Salary */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Basic Salary <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaDollarSign className="text-slate-400" />
                </div>
                <input
                  type="number"
                  name="basicSalary"
                  required
                  step="0.01"
                  value={formData.basicSalary}
                  onChange={handleFormChange}
                  placeholder="Enter basic salary"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Bonus */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bonus</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaDollarSign className="text-slate-400" />
                </div>
                <input
                  type="number"
                  name="bonus"
                  step="0.01"
                  value={formData.bonus}
                  onChange={handleFormChange}
                  placeholder="Enter bonus amount"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Deductions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Deductions</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaDollarSign className="text-slate-400" />
                </div>
                <input
                  type="number"
                  name="deductions"
                  step="0.01"
                  value={formData.deductions}
                  onChange={handleFormChange}
                  placeholder="Enter deductions amount"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Status</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleFormChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">⏳ Pending</option>
                <option value="Paid">✅ Paid</option>
                <option value="Cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>

          {/* Calculated Net Salary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCalculator className="text-blue-600" />
                <span className="font-medium text-slate-700">Net Salary:</span>
                <span className="text-xs text-slate-500">(Basic + Bonus - Deductions)</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                ${calculatedNet.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              type="button"
            >
              <FaTimes className="mr-2" /> Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              <FaSave className="mr-2" /> Create Payroll
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}