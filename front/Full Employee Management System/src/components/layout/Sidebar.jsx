import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaBuilding, 
  FaCalendarCheck, 
  FaMoneyBillWave, 
  FaChartBar,
  FaUser,
  FaInfoCircle,
  FaPhone,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout, user } = useAuth();
  const { settings } = useSettings();

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/employees', icon: FaUsers, label: 'Employees' },
    { path: '/departments', icon: FaBuilding, label: 'Departments' },
    { path: '/attendance', icon: FaCalendarCheck, label: 'Attendance' },
    { path: '/payroll', icon: FaMoneyBillWave, label: 'Payroll' },
    { path: '/reports', icon: FaChartBar, label: 'Reports' },
  ];

  const bottomItems = [
    { path: '/profile', icon: FaUser, label: 'Profile' },
    // ❌ REMOVED: Settings
    { path: '/about', icon: FaInfoCircle, label: 'About' },
    { path: '/contact', icon: FaPhone, label: 'Contact' },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
        {isOpen ? (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-blue-900/30">
              <span className="text-white font-bold text-sm">EMS</span>
            </div>
            <span className="font-semibold text-slate-800 dark:text-white tracking-tight">EmployeeMS</span>
          </div>
        ) : (
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-blue-900/30 mx-auto">
            <span className="text-white font-bold text-sm">EMS</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isOpen ? (
            <FaChevronLeft className="text-slate-400 dark:text-slate-500 text-xs" />
          ) : (
            <FaChevronRight className="text-slate-400 dark:text-slate-500 text-xs" />
          )}
        </button>
      </div>

      {/* User Info */}
      <div className={`px-4 py-3 border-b border-slate-200 dark:border-slate-700 ${!isOpen && 'hidden'}`}>
        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{user?.unique_name || 'User'}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.role || 'Employee'}</p>
      </div>

      {/* Menu */}
      <div className="flex flex-col justify-between h-[calc(100%-8rem)]">
        <div className="px-3 py-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
                }`
              }
            >
              <item.icon className={`text-lg flex-shrink-0 ${isOpen ? 'text-current' : 'text-xl'}`} />
              {isOpen && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </div>

        <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
                }`
              }
            >
              <item.icon className={`text-lg flex-shrink-0 ${isOpen ? 'text-current' : 'text-xl'}`} />
              {isOpen && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200"
          >
            <FaSignOutAlt className={`text-lg flex-shrink-0 ${isOpen ? 'text-current' : 'text-xl'}`} />
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
}