// ============================================================
// NAVBAR COMPONENT
// The top navigation bar with search, theme toggle, and user info
// ============================================================

import { useState } from 'react';
import { FaSearch, FaBell, FaUserCircle, FaBars, FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  
  // ============================================================
  // HOOKS - Get data and functions from context
  // ============================================================
  const { user } = useAuth();              // Get current user info
  const { settings, updateSetting } = useSettings(); // Get settings
  const [searchTerm, setSearchTerm] = useState(''); // Search input
  const navigate = useNavigate();          // For page navigation

  // ============================================================
  // TOGGLE THEME - Switch between light and dark mode
  // ============================================================
  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSetting('theme', newTheme);
  };

  // ============================================================
  // RENDER NAVBAR
  // ============================================================
  return (
    <nav className={`
      bg-white dark:bg-slate-900 
      border-b border-slate-200 dark:border-slate-700 
      h-16 px-4 md:px-6 
      flex items-center justify-between 
      sticky top-0 z-40 
      transition-colors duration-300
    `}>
      
      {/* ============================================================
          LEFT SECTION - Menu button + Search bar
          ============================================================ */}
      <div className="flex items-center gap-4 flex-1">
        
        {/* Menu Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <FaBars className="text-slate-600 dark:text-slate-300 text-lg" />
        </button>
        
        {/* Search Form */}
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            if (searchTerm.trim()) {
              navigate(`/employees?search=${searchTerm}`);
            }
          }} 
          className="relative flex-1 max-w-md hidden md:block"
        >
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`
              w-full pl-9 pr-4 py-2 
              border border-slate-200 dark:border-slate-700 
              dark:bg-slate-800 dark:text-white 
              rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              transition-all 
              bg-slate-50 dark:bg-slate-800 
              text-sm
            `}
          />
        </form>
      </div>

      {/* ============================================================
          RIGHT SECTION - Theme toggle, Notifications, User info
          ============================================================ */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {settings.theme === 'light' ? (
            <FaMoon className="text-slate-600 text-lg" />
          ) : (
            <FaSun className="text-amber-400 text-lg" />
          )}
        </button>

        {/* Notification Button */}
        <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <FaBell className="text-slate-600 dark:text-slate-300 text-lg" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        
        {/* User Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
            <FaUserCircle className="text-blue-600 dark:text-blue-400 text-xl" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">
              {user?.unique_name || 'User'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {user?.role || 'Employee'}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}