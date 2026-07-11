import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaSave, FaTimes } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../services/api';
import toast from 'react-hot-toast';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    hireDate: '',
    salary: '',
    departmentId: '',
    gender: 'Male',
    status: 'Active'
  });
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Employee`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          return;
        }
        throw new Error('Failed to fetch employees');
      }
      
      const result = await response.json();
      console.log('Employees data:', result);
      
      if (result && result.data) {
        setEmployees(result.data);
      } else if (Array.isArray(result)) {
        setEmployees(result);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments for dropdown
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Department`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      
      const result = await response.json();
      console.log('Departments data:', result);
      
      if (result && result.data) {
        setDepartments(result.data);
      } else if (Array.isArray(result)) {
        setDepartments(result);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  // Search employees
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchEmployees();
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Employee/search?query=${encodeURIComponent(searchTerm)}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) throw new Error('Search failed');
      const result = await response.json();
      
      if (result && result.data) {
        setEmployees(result.data);
      } else if (Array.isArray(result)) {
        setEmployees(result);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Add new employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('First Name, Last Name, and Email are required');
      return;
    }

    try {
      setActionLoading(true);
      
      const employeeData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        email: formData.email.trim(),
        phone: formData.phone?.trim() || '',
        address: formData.address?.trim() || '',
        hireDate: formData.hireDate,
        salary: parseFloat(formData.salary) || 0,
        departmentId: parseInt(formData.departmentId) || 0,
        status: formData.status || 'Active'
      };

      console.log('Adding employee:', employeeData);

      const response = await fetch(`${API_BASE_URL}/Employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add employee');
      }

      toast.success('Employee added successfully');
      setShowAddModal(false);
      resetForm();
      await fetchEmployees();
    } catch (error) {
      console.error('Add employee error:', error);
      toast.error(error.message || 'Failed to add employee');
    } finally {
      setActionLoading(false);
    }
  };

  // Update employee
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('First Name, Last Name, and Email are required');
      return;
    }

    // 🔥 FIX: Use employeeID (matches backend)
    const employeeId = selectedEmployee?.employeeID || selectedEmployee?.EmployeeID || selectedEmployee?.id;
    
    console.log('Selected Employee:', selectedEmployee);
    console.log('Employee ID to update:', employeeId);
    
    if (!employeeId) {
      toast.error('Employee ID not found');
      return;
    }

    try {
      setActionLoading(true);
      
      const employeeData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        email: formData.email.trim(),
        phone: formData.phone?.trim() || '',
        address: formData.address?.trim() || '',
        hireDate: formData.hireDate,
        salary: parseFloat(formData.salary) || 0,
        departmentId: parseInt(formData.departmentId) || 0,
        status: formData.status || 'Active'
      };

      console.log('Updating employee:', employeeId, employeeData);

      const response = await fetch(`${API_BASE_URL}/Employee/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update employee');
      }

      toast.success('Employee updated successfully');
      setShowEditModal(false);
      setSelectedEmployee(null);
      resetForm();
      await fetchEmployees();
    } catch (error) {
      console.error('Update employee error:', error);
      toast.error(error.message || 'Failed to update employee');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete employee
  const handleDeleteEmployee = async () => {
    // 🔥 FIX: Use employeeID (matches backend)
    const employeeId = selectedEmployee?.employeeID || selectedEmployee?.EmployeeID || selectedEmployee?.id;
    
    console.log('Selected Employee:', selectedEmployee);
    console.log('Employee ID to delete:', employeeId);
    
    if (!employeeId) {
      toast.error('Employee ID not found');
      return;
    }

    try {
      setActionLoading(true);
      console.log('Deleting employee:', employeeId);

      const response = await fetch(`${API_BASE_URL}/Employee/${employeeId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete employee');
      }

      toast.success('Employee deleted successfully');
      setShowDeleteModal(false);
      setSelectedEmployee(null);
      await fetchEmployees();
    } catch (error) {
      console.error('Delete employee error:', error);
      toast.error(error.message || 'Failed to delete employee');
    } finally {
      setActionLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      hireDate: '',
      salary: '',
      departmentId: '',
      gender: 'Male',
      status: 'Active'
    });
  };

  // Open edit modal with employee data
  const openEditModal = (employee) => {
    console.log('Opening edit modal for:', employee);
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      address: employee.address || '',
      hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
      salary: employee.salary || '',
      departmentId: employee.departmentId || employee.departmentID || '',
      gender: employee.gender || 'Male',
      status: employee.status || 'Active'
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (employee) => {
    console.log('Opening delete modal for:', employee);
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  // Open view modal
  const openViewModal = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  // Table columns
  const columns = [
    { key: 'employeeID', header: 'ID', width: '70px' },
    { 
      key: 'fullName', 
      header: 'Name',
      render: (_, row) => `${row.firstName || ''} ${row.lastName || ''}`
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { 
      key: 'salary', 
      header: 'Salary',
      render: (value) => `$${value?.toLocaleString() || 0}`
    },
    { key: 'departmentName', header: 'Department' },
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
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); openViewModal(row); }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Employee"
          >
            <FaEye className="text-sm" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(row); }}
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit Employee"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteModal(row); }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Employee"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <p className="text-slate-500 mt-1">Manage your workforce</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
          <FaPlus className="mr-2" /> Add Employee
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="secondary" onClick={handleSearch}>Search</Button>
          <Button variant="outline" onClick={() => { setSearchTerm(''); fetchEmployees(); }}>Reset</Button>
        </div>
      </Card>

      {/* Employees Table */}
      <Card>
        <Table
          columns={columns}
          data={employees}
          loading={loading}
        />
      </Card>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add New Employee"
        size="lg"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Enter first name"
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Enter last name"
            />
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter email address"
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Enter phone number"
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Enter address"
            />
            <Input
              label="Hire Date"
              type="date"
              required
              value={formData.hireDate}
              onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
            />
            <Input
              label="Salary"
              type="number"
              required
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
              placeholder="Enter salary"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
             
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.departmentID || dept.id} value={dept.departmentID || dept.id}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" loading={actionLoading}>Add Employee</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedEmployee(null); resetForm(); }}
        title="Edit Employee"
        size="lg"
      >
        <form onSubmit={handleUpdateEmployee} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            />
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
            <Input
              label="Hire Date"
              type="date"
              required
              value={formData.hireDate}
              onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
            />
            <Input
              label="Salary"
              type="number"
              required
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
               
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.departmentID || dept.id} value={dept.departmentID || dept.id}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => { setShowEditModal(false); setSelectedEmployee(null); resetForm(); }}>Cancel</Button>
            <Button type="submit" loading={actionLoading}>Update Employee</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedEmployee(null); }}
        title="Delete Employee"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTrash className="text-red-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Are you sure?</h3>
          <p className="text-slate-500 mb-2">
            This will permanently delete
            <span className="font-medium text-slate-700 block mt-1">
              {selectedEmployee?.firstName} {selectedEmployee?.lastName}
            </span>
          </p>
          <p className="text-sm text-red-500 mb-6">
            ⚠️ This will also delete all attendance, payroll, and user records for this employee.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => { setShowDeleteModal(false); setSelectedEmployee(null); }}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteEmployee} loading={actionLoading}>
              Delete Employee
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Employee Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setSelectedEmployee(null); }}
        title="Employee Details"
        size="lg"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Employee ID</p>
                <p className="font-medium text-slate-800">{selectedEmployee.employeeID || selectedEmployee.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  selectedEmployee.status === 'Active' ? 'bg-green-100 text-green-700' :
                  selectedEmployee.status === 'Inactive' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {selectedEmployee.status || 'Active'}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Full Name</p>
                <p className="font-medium text-slate-800">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Gender</p>
                <p className="font-medium text-slate-800">{selectedEmployee.gender}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-800">{selectedEmployee.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-medium text-slate-800">{selectedEmployee.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Address</p>
                <p className="font-medium text-slate-800">{selectedEmployee.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Department</p>
                <p className="font-medium text-slate-800">{selectedEmployee.departmentName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Hire Date</p>
                <p className="font-medium text-slate-800">{new Date(selectedEmployee.hireDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Salary</p>
                <p className="font-medium text-slate-800">${selectedEmployee.salary?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => { setShowViewModal(false); setSelectedEmployee(null); }}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}