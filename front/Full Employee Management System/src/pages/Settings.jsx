import { useState, useEffect } from 'react';
import { 
  FaPalette, 
  FaGlobe, 
  FaBell, 
  FaMoon, 
  FaSun, 
  FaSave,
  FaSync,
  FaCheck,
  FaDesktop,
  FaTablet,
  FaLanguage,
  FaClock,
  FaCalendarAlt,
  FaEnvelope,
  FaSms,
  FaUserCog,
  FaSignOutAlt,
  FaRecycle
} from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, logout } = useAuth();
  const { settings, updateSetting, resetSettings, saveSettings, formatDate, getCurrentTime } = useSettings();
  const [loading, setLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key) => {
    setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 🔥 FIXED: Save settings with correct toast methods
  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      saveSettings(localSettings);
      toast.success('✅ Settings saved successfully!');
      
      if (localSettings.autoRefresh) {
        toast('🔄 Auto-refresh enabled for dashboard', {
          icon: '🔄',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('❌ Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIXED: Reset settings
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      const defaults = resetSettings();
      setLocalSettings(defaults);
      toast.success('Settings reset to default');
    }
  };

  const getLanguageName = (code) => {
    const languages = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'ar': 'Arabic',
      'zh': 'Chinese'
    };
    return languages[code] || code;
  };

  const getTimezoneOffset = (tz) => {
    const timezones = {
      'UTC': 'UTC±0',
      'EST': 'UTC-5',
      'CST': 'UTC-6',
      'MST': 'UTC-7',
      'PST': 'UTC-8',
      'GMT': 'UTC±0',
      'CET': 'UTC+1',
      'IST': 'UTC+5:30',
      'JST': 'UTC+9',
      'AEST': 'UTC+10'
    };
    return timezones[tz] || tz;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Customize your application preferences</p>
      </div>

      {/* Live Preview */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">📱 Live Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Theme:</span>
            <span className="ml-1 font-medium text-slate-800 dark:text-white">
              {localSettings.theme === 'light' ? '☀️ Light' : '🌙 Dark'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Language:</span>
            <span className="ml-1 font-medium text-slate-800 dark:text-white">
              {getLanguageName(localSettings.language)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Timezone:</span>
            <span className="ml-1 font-medium text-slate-800 dark:text-white">
              {localSettings.timezone}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Date Format:</span>
            <span className="ml-1 font-medium text-slate-800 dark:text-white">
              {localSettings.dateFormat}
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Current Time: <span className="font-mono text-slate-700 dark:text-slate-300">{getCurrentTime()}</span>
          {' · '}
          Date: <span className="font-mono text-slate-700 dark:text-slate-300">{formatDate(new Date())}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card title={<div className="flex items-center gap-2"><FaPalette className="text-blue-600" /> Appearance</div>}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Theme</label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleChange('theme', 'light')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    localSettings.theme === 'light' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <FaSun className="text-amber-500" /> 
                  <span className="dark:text-white">Light</span>
                  {localSettings.theme === 'light' && <FaCheck className="text-blue-500 text-xs" />}
                </button>
                <button
                  onClick={() => handleChange('theme', 'dark')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    localSettings.theme === 'dark' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <FaMoon className="text-slate-600 dark:text-slate-300" /> 
                  <span className="dark:text-white">Dark</span>
                  {localSettings.theme === 'dark' && <FaCheck className="text-blue-500 text-xs" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">View Mode</label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleChange('compactView', false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    !localSettings.compactView 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <FaDesktop className="dark:text-white" /> 
                  <span className="dark:text-white">Standard</span>
                </button>
                <button
                  onClick={() => handleChange('compactView', true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    localSettings.compactView 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <FaTablet className="dark:text-white" /> 
                  <span className="dark:text-white">Compact</span>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Language & Region */}
        <Card title={<div className="flex items-center gap-2"><FaGlobe className="text-green-600" /> Language & Region</div>}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <FaLanguage className="inline mr-2" /> Language
              </label>
              <select
                value={localSettings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full max-w-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Spanish</option>
                <option value="fr">🇫🇷 French</option>
                <option value="de">🇩🇪 German</option>
                <option value="ar">🇸🇦 Arabic</option>
                <option value="zh">🇨🇳 Chinese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <FaClock className="inline mr-2" /> Timezone
              </label>
              <select
                value={localSettings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full max-w-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC">🌐 UTC ({getTimezoneOffset('UTC')})</option>
                <option value="EST">🇺🇸 EST ({getTimezoneOffset('EST')})</option>
                <option value="CST">🇺🇸 CST ({getTimezoneOffset('CST')})</option>
                <option value="MST">🇺🇸 MST ({getTimezoneOffset('MST')})</option>
                <option value="PST">🇺🇸 PST ({getTimezoneOffset('PST')})</option>
                <option value="GMT">🇬🇧 GMT ({getTimezoneOffset('GMT')})</option>
                <option value="CET">🇪🇺 CET ({getTimezoneOffset('CET')})</option>
                <option value="IST">🇮🇳 IST ({getTimezoneOffset('IST')})</option>
                <option value="JST">🇯🇵 JST ({getTimezoneOffset('JST')})</option>
                <option value="AEST">🇦🇺 AEST ({getTimezoneOffset('AEST')})</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <FaCalendarAlt className="inline mr-2" /> Date Format
              </label>
              <select
                value={localSettings.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                className="w-full max-w-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card title={<div className="flex items-center gap-2"><FaBell className="text-amber-600" /> Notifications</div>}>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
              <input
                type="checkbox"
                checked={localSettings.notifications}
                onChange={() => handleCheckboxChange('notifications')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">🔔 Enable notifications</span>
                <p className="text-xs text-slate-400 dark:text-slate-500">Receive notifications about important events</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
              <input
                type="checkbox"
                checked={localSettings.emailAlerts}
                onChange={() => handleCheckboxChange('emailAlerts')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                disabled={!localSettings.notifications}
              />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <FaEnvelope className="inline mr-2" /> Email alerts
                </span>
                <p className="text-xs text-slate-400 dark:text-slate-500">Receive notifications via email</p>
                {!localSettings.notifications && <span className="text-xs text-red-400">(Enable notifications first)</span>}
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
              <input
                type="checkbox"
                checked={localSettings.smsAlerts}
                onChange={() => handleCheckboxChange('smsAlerts')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                disabled={!localSettings.notifications}
              />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <FaSms className="inline mr-2" /> SMS alerts
                </span>
                <p className="text-xs text-slate-400 dark:text-slate-500">Receive notifications via SMS</p>
                {!localSettings.notifications && <span className="text-xs text-red-400">(Enable notifications first)</span>}
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
              <input
                type="checkbox"
                checked={localSettings.autoRefresh}
                onChange={() => handleCheckboxChange('autoRefresh')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <FaSync className="inline mr-2" /> Auto-refresh dashboard
                </span>
                <p className="text-xs text-slate-400 dark:text-slate-500">Automatically refresh data every 30 seconds</p>
              </div>
            </label>
          </div>
        </Card>

        {/* Account Information */}
        <Card title={<div className="flex items-center gap-2"><FaUserCog className="text-purple-600" /> Account Information</div>}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Username</span>
              <span className="font-medium text-slate-800 dark:text-white">{user?.unique_name || user?.username || 'admin'}</span>
            </div>
            <div className="flex justify-between p-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Role</span>
              <span className="font-medium text-slate-800 dark:text-white">{user?.role || 'Admin'}</span>
            </div>
            <div className="flex justify-between p-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Email</span>
              <span className="font-medium text-slate-800 dark:text-white">{user?.email || 'Not set'}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="text-slate-500 dark:text-slate-400">User ID</span>
              <span className="font-medium text-slate-800 dark:text-white">{user?.nameid || user?.sub || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-between">
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset}>
              <FaRecycle className="mr-2" /> Reset Defaults
            </Button>
            <Button variant="danger" onClick={logout}>
              <FaSignOutAlt className="mr-2" /> Logout
            </Button>
          </div>
          <Button onClick={handleSave} loading={loading}>
            <FaSave className="mr-2" /> Save Settings
          </Button>
        </div>

        {/* Status Bar */}
        <div className="text-xs text-slate-400 dark:text-slate-500 text-center p-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <p>⚙️ Settings applied globally · 
            Theme: {localSettings.theme === 'light' ? '☀️ Light' : '🌙 Dark'} · 
            Language: {getLanguageName(localSettings.language)} · 
            Timezone: {localSettings.timezone}
          </p>
          <p className="mt-1">✅ Changes affect ALL pages and components in real-time</p>
        </div>
      </div>
    </div>
  );
}