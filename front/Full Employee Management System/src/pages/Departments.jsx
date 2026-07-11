// ============================================================
// DEPARTMENTS PAGE
// Manage company departments (Add, Edit, Activate, Deactivate, Delete)
// ============================================================

import { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaSync, 
  FaToggleOn, FaToggleOff, FaEye, FaEyeSlash
} from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../services/api';
import toast from 'react-hot-toast';

export default function Departments() {
  
  // ============================================================
  // STATE VARIABLES
  // ============================================================
  const [departments, setDepartments] = useState([]);           // List of departments
  const [loading, setLoading] = useState(true);                 // Loading spinner
  const [showAddModal, setShowAddModal] = useState(false);      // Show Add form
  const [showEditModal, setShowEditModal] = useState(false);    // Show Edit form
  const [showToggleModal, setShowToggleModal] = useState(false);// Show Toggle confirm
  const [showDeleteModal, setShowDeleteModal] = useState(false);// Show Delete confirm
  const [selectedDepartment, setSelectedDepartment] = useState(null); // Selected dept
  const [formData, setFormData] = useState({                    // Form data
    departmentName: '',
    description: '',
  });
  const [actionLoading, setActionLoading] = useState(false);    // Action loading
  const { token } = useAuth();                                  // JWT token

  // ============================================================
  // LOAD DEPARTMENTS ON PAGE LOAD
  // ============================================================
  useEffect(() => {
    fetchDepartments();
  }, []);

  // ============================================================
  // FETCH DEPARTMENTS FROM API
  // ============================================================
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      console.log('Fetching all departments...');
      
      const response = await fetch(`${API_BASE_URL}/Department`, {
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
        throw new Error('Failed to fetch departments');
      }

      const result = await response.json();
      console.log('Departments data:', result);

      // Extract data from API response
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
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ADD NEW DEPARTMENT
  // ============================================================
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    
    // Validate: Department name is required
    if (!formData.departmentName.trim()) {
      toast.error('Department name is required');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/Department`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          departmentName: formData.departmentName.trim(),
          description: formData.description.trim() || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add department');
      }

      toast.success('Department added successfully');
      setShowAddModal(false);
      setFormData({ departmentName: '', description: '' });
      await fetchDepartments(); // Refresh list
      
    } catch (error) {
      console.error('Add department error:', error);
      toast.error(error.message || 'Failed to add department');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UPDATE DEPARTMENT
  // ============================================================
  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    
    if (!formData.departmentName.trim()) {
      toast.error('Department name is required');
      return;
    }

    const departmentId = selectedDepartment?.departmentID;
    
    if (!departmentId) {
      toast.error('Department ID not found');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/Department/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          departmentName: formData.departmentName.trim(),
          description: formData.description.trim() || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update department');
      }

      toast.success('Department updated successfully');
      setShowEditModal(false);
      setSelectedDepartment(null);
      setFormData({ departmentName: '', description: '' });
      await fetchDepartments();
      
    } catch (error) {
      console.error('Update department error:', error);
      toast.error(error.message || 'Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ACTIVATE DEPARTMENT
  // ============================================================
  const handleActivate = async () => {
    const departmentId = selectedDepartment?.departmentID;
    
    console.log('Activating department ID:', departmentId);
    
    if (!departmentId) {
      toast.error('Department ID not found');
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(`${API_BASE_URL}/Department/activate/${departmentId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to activate department');
      }

      toast.success('Department activated successfully');
      setShowToggleModal(false);
      setSelectedDepartment(null);
      await fetchDepartments();
      
    } catch (error) {
      console.error('Activate error:', error);
      toast.error(error.message || 'Failed to activate department');
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // DEACTIVATE DEPARTMENT
  // ============================================================
  const handleDeactivate = async () => {
    const departmentId = selectedDepartment?.departmentID;
    
    console.log('Deactivating department ID:', departmentId);
    
    if (!departmentId) {
      toast.error('Department ID not found');
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(`${API_BASE_URL}/Department/deactivate/${departmentId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      // Get response as text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        if (response.ok) {
          toast.success('Department deactivated successfully');
          setShowToggleModal(false);
          setSelectedDepartment(null);
          await fetchDepartments();
          return;
        }
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(result.message || 'Failed to deactivate department');
      }

      toast.success('Department deactivated successfully');
      setShowToggleModal(false);
      setSelectedDepartment(null);
      await fetchDepartments();
      
    } catch (error) {
      console.error('Deactivate error:', error);
      toast.error(error.message || 'Failed to deactivate department');
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // DELETE DEPARTMENT (Permanent - Only for inactive)
  // ============================================================
  const handleDelete = async () => {
    const departmentId = selectedDepartment?.departmentID;
    
    if (!departmentId) {
      toast.error('Department ID not found');
      return;
    }

    try {
      setActionLoading(true);
      console.log('Deleting department:', departmentId);

      const response = await fetch(`${API_BASE_URL}/Department/${departmentId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete department');
      }

      toast.success('Department permanently deleted');
      setShowDeleteModal(false);
      setSelectedDepartment(null);
      await fetchDepartments();
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete department');
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // OPEN MODALS
  // ============================================================
  const openEditModal = (department) => {
    setSelectedDepartment(department);
    setFormData({
      departmentName: department.departmentName || '',
      description: department.description || '',
    });
    setShowEditModal(true);
  };

  const openToggleModal = (department) => {
    console.log('Opening toggle modal for:', department);
    setSelectedDepartment(department);
    setShowToggleModal(true);
  };

  const openDeleteModal = (department) => {
    setSelectedDepartment(department);
    setShowDeleteModal(true);
  };

  // ============================================================
  // TABLE COLUMNS
  // ============================================================
  const columns = [
    { 
      key: 'departmentID', 
      header: 'ID', 
      width: '70px' 
    },
    { 
      key: 'departmentName', 
      header: 'Department Name',
      render: (value) => (
        <span className="font-medium text-slate-800">{value}</span>
      )
    },
    { 
      key: 'description', 
      header: 'Description',
      render: (value) => (
        <span className="text-slate-600">{value || '-'}</span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {value ? '🟢 Active' : '🔴 Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {/* Edit Button */}
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(row); }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Department"
          >
            <FaEdit className="text-sm" />
          </button>
          
          {/* Toggle Button (Activate/Deactivate) */}
          <button
            onClick={(e) => { e.stopPropagation(); openToggleModal(row); }}
            className={`p-1.5 rounded-lg transition-colors ${
              row.isActive 
                ? 'text-amber-600 hover:bg-amber-50' 
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={row.isActive ? 'Deactivate' : 'Activate'}
          >
            {row.isActive ? (
              <FaToggleOn className="text-lg" />
            ) : (
              <FaToggleOff className="text-lg" />
            )}
          </button>
          
          {/* Delete Button (Only for inactive departments) */}
          {!row.isActive && (
            <button
              onClick={(e) => { e.stopPropagation(); openDeleteModal(row); }}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Permanently Delete"
            >
              <FaTrash className="text-sm" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // ============================================================
  // COUNT ACTIVE/INACTIVE
  // ============================================================
  const activeCount = departments.filter(d => d.isActive).length;
  const inactiveCount = departments.filter(d => !d.isActive).length;

  // ============================================================
  // RENDER DEPARTMENTS PAGE
  // ============================================================
  return (
    <div>
      
      {/* ============================================================
          PAGE HEADER
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
          <p className="text-slate-500 mt-1">
            Manage your company departments
            <span className="ml-2 text-sm">
              <span className="text-green-600">🟢 {activeCount} Active</span>
              <span className="mx-1">·</span>
              <span className="text-red-600">🔴 {inactiveCount} Inactive</span>
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          {/* Reload Button */}
          <Button 
            variant="secondary" 
            onClick={fetchDepartments} 
            disabled={loading}
          >
            <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Reload
          </Button>
          
          {/* Add Department Button */}
          <Button onClick={() => setShowAddModal(true)}>
            <FaPlus className="mr-2" /> Add Department
          </Button>
        </div>
      </div>

      {/* ============================================================
          DEPARTMENTS TABLE
          ============================================================ */}
      <Card>
        <Table columns={columns} data={departments} loading={loading} />
        
        {/* Empty State */}
        {!loading && departments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">No departments found.</p>
            <p className="text-sm text-slate-400 mt-1">
              Click "Add Department" to create one.
            </p>
          </div>
        )}
      </Card>

      {/* ============================================================
          ADD DEPARTMENT MODAL
          ============================================================ */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="Add New Department"
      >
        <form onSubmit={handleAddDepartment} className="space-y-4">
          <Input
            label="Department Name"
            required
            value={formData.departmentName}
            onChange={(e) => setFormData({...formData, departmentName: e.target.value})}
            placeholder="Enter department name"
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Enter description (optional)"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================
          EDIT DEPARTMENT MODAL
          ============================================================ */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Edit Department"
      >
        <form onSubmit={handleUpdateDepartment} className="space-y-4">
          <Input
            label="Department Name"
            required
            value={formData.departmentName}
            onChange={(e) => setFormData({...formData, departmentName: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Update Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================
          TOGGLE MODAL (Activate/Deactivate)
          ============================================================ */}
      <Modal 
        isOpen={showToggleModal} 
        onClose={() => setShowToggleModal(false)} 
        title={selectedDepartment?.isActive ? "Deactivate Department" : "Activate Department"} 
        size="sm"
      >
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            selectedDepartment?.isActive ? 'bg-amber-100' : 'bg-green-100'
          }`}>
            {selectedDepartment?.isActive ? (
              <FaEyeSlash className="text-amber-600 text-2xl" />
            ) : (
              <FaEye className="text-green-600 text-2xl" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {selectedDepartment?.isActive ? 'Deactivate' : 'Activate'} Department?
          </h3>
          <p className="text-slate-500 mb-2">
            {selectedDepartment?.isActive ? 'Deactivate' : 'Activate'}
            <span className="font-medium text-slate-700 block mt-1">
              {selectedDepartment?.departmentName}
            </span>
          </p>
          <p className={`text-sm mb-6 ${
            selectedDepartment?.isActive ? 'text-amber-600' : 'text-green-600'
          }`}>
            {selectedDepartment?.isActive 
              ? '⚠️ Department will be hidden from active lists' 
              : '✅ Department will become visible again'}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setShowToggleModal(false)}>
              Cancel
            </Button>
            <Button 
              variant={selectedDepartment?.isActive ? 'warning' : 'success'} 
              onClick={selectedDepartment?.isActive ? handleDeactivate : handleActivate}
              loading={actionLoading}
            >
              {selectedDepartment?.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================
          DELETE MODAL
          ============================================================ */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        title="Permanently Delete Department" 
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTrash className="text-red-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Are you sure?</h3>
          <p className="text-slate-500 mb-2">
            Permanently delete
            <span className="font-medium text-slate-700 block mt-1">
              {selectedDepartment?.departmentName}
            </span>
          </p>
          <p className="text-sm text-red-500 mb-6">
            ⚠️ This action cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}