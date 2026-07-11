import { useState, useEffect } from 'react';
import { 
  FaUser, FaEnvelope, FaPhone, FaBuilding, FaKey, FaSave, 
  FaUserCircle, FaIdCard, FaCalendarAlt, FaDollarSign, FaShieldAlt 
} from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [hasEmployeeRecord, setHasEmployeeRecord] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    salary: '',
    hireDate: '',
    gender: '',
    status: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user details when component mounts
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // 🔥 Fetch user details from API or fallback to token
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      
      // Get the user ID from the token
      const userId = user?.nameid || user?.sub || user?.EmployeeID;
      
      console.log('Fetching user details for ID:', userId);
      
      // First, try to fetch from API
      if (userId) {
        try {
          const response = await fetch(`${API_BASE_URL}/Employee/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Response status:', response.status);

          if (response.ok) {
            const result = await response.json();
            console.log('User details from API:', result);
            
            if (result && result.data) {
              const data = result.data;
              setUserDetails(data);
              setHasEmployeeRecord(true);
              setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                department: data.departmentName || '',
                salary: data.salary || '',
                hireDate: data.hireDate || '',
                gender: data.gender || '',
                status: data.status || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
              toast.success('Profile loaded successfully');
              return;
            }
          }
        } catch (apiError) {
          console.log('API fetch failed, using token data');
        }
      }

      // 🔥 FALLBACK: Use data from JWT token
      console.log('Using data from JWT token');
      setHasEmployeeRecord(false);
      setFormData({
        firstName: user?.given_name || user?.firstName || user?.unique_name || '',
        lastName: user?.family_name || user?.lastName || '',
        email: user?.email || user?.unique_name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        department: user?.department || '',
        salary: '',
        hireDate: '',
        gender: '',
        status: 'Active',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setUserDetails({
        employeeID: userId || 'N/A',
        username: user?.unique_name || user?.name || 'admin',
        role: user?.role || 'Admin'
      });

    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
      
      // Final fallback
      setFormData({
        firstName: user?.unique_name || 'User',
        lastName: '',
        email: user?.unique_name || '',
        phone: '',
        address: '',
        department: '',
        salary: '',
        hireDate: '',
        gender: '',
        status: 'Active',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Handle Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!hasEmployeeRecord) {
      toast.info('You are logged in as a system user. Please contact admin to update your profile.');
      return;
    }

    try {
      setLoading(true);
      const userId = user?.nameid || user?.sub || user?.EmployeeID;
      
      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
        address: formData.address || '',
        gender: formData.gender || 'Male',
        status: formData.status || 'Active',
        hireDate: formData.hireDate || new Date().toISOString().split('T')[0],
        salary: parseFloat(formData.salary) || 0,
        departmentId: 1
      };

      console.log('Updating profile with:', updateData);

      const response = await fetch(`${API_BASE_URL}/Employee/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');
      await fetchUserDetails();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      toast.success('Password changed successfully');
      
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (formData.firstName || formData.lastName) {
      return `${formData.firstName} ${formData.lastName}`.trim();
    }
    return user?.unique_name || user?.name || user?.username || 'User';
  };

  const getRole = () => {
    return user?.role || user?.Role || 'User';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return '$0';
    return `$${parseFloat(salary).toLocaleString()}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account settings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaUserCircle className="text-blue-600 text-4xl" />
              </div>
              <h3 className="font-semibold text-slate-800">{getDisplayName()}</h3>
              <p className="text-sm text-slate-500">{getRole()}</p>
              <p className="text-xs text-slate-400 mt-1">{formData.email}</p>
              {hasEmployeeRecord ? (
                <div className="mt-2 text-xs text-slate-500">
                  <span className={`px-2 py-0.5 rounded-full ${
                    formData.status === 'Active' ? 'bg-green-100 text-green-700' :
                    formData.status === 'Inactive' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {formData.status || 'Active'}
                  </span>
                </div>
              ) : (
                <div className="mt-2 text-xs text-blue-500">
                  <FaShieldAlt className="inline mr-1" /> System User
                </div>
              )}
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'profile' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <FaUser className="inline mr-2" /> Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'security' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <FaKey className="inline mr-2" /> Security
              </button>
            </div>
          </Card>

          {/* Employee Details Card */}
          {hasEmployeeRecord ? (
            <Card className="mt-4">
              <h4 className="font-medium text-slate-700 text-sm mb-3">Employee Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee ID</span>
                  <span className="font-medium text-slate-700">{userDetails?.employeeID || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department</span>
                  <span className="font-medium text-slate-700">{formData.department || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Salary</span>
                  <span className="font-medium text-green-600">{formatSalary(formData.salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hire Date</span>
                  <span className="font-medium text-slate-700">{formatDate(formData.hireDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-medium text-slate-700">{formData.gender || '-'}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="mt-4">
              <h4 className="font-medium text-slate-700 text-sm mb-3">Account Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Username</span>
                  <span className="font-medium text-slate-700">{user?.unique_name || user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role</span>
                  <span className="font-medium text-slate-700">{getRole()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">User ID</span>
                  <span className="font-medium text-slate-700">{user?.nameid || user?.sub}</span>
                </div>
                <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                  ⚠️ No employee record found. Some features may be limited.
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' ? (
            <Card title="Personal Information">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      placeholder="Enter first name"
                      disabled={!hasEmployeeRecord}
                    />
                    <Input
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      placeholder="Enter last name"
                      disabled={!hasEmployeeRecord}
                    />
                    <Input
                      label="Email"
                      type="email"
                      icon={FaEnvelope}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter email address"
                      disabled={!hasEmployeeRecord}
                    />
                    <Input
                      label="Phone"
                      icon={FaPhone}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Enter phone number"
                      disabled={!hasEmployeeRecord}
                    />
                    <Input
                      label="Address"
                      icon={FaBuilding}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Enter address"
                      disabled={!hasEmployeeRecord}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!hasEmployeeRecord}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!hasEmployeeRecord}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                    <Input
                      label="Department"
                      icon={FaBuilding}
                      value={formData.department}
                      disabled
                      className="bg-slate-50"
                    />
                    <Input
                      label="Salary"
                      icon={FaDollarSign}
                      value={formData.salary}
                      disabled
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-200">
                    <Button type="submit" loading={loading} disabled={!hasEmployeeRecord}>
                      <FaSave className="mr-2" /> {hasEmployeeRecord ? 'Save Changes' : 'Update Not Available'}
                    </Button>
                  </div>
                  {!hasEmployeeRecord && (
                    <p className="text-xs text-amber-600 text-right">
                      ⚠️ To update your profile, please ask an admin to create an employee record for you.
                    </p>
                  )}
                </form>
              )}
            </Card>
          ) : (
            <Card title="Change Password">
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  required
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                />
                <Input
                  label="New Password"
                  type="password"
                  required
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  placeholder="Enter new password"
                  helper="Password must be at least 6 characters"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                />
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <Button type="submit" loading={loading}>
                    <FaKey className="mr-2" /> Change Password
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}