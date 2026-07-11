import { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'en',
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    autoRefresh: false,
    compactView: false,
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
        applyTheme(parsed.theme || 'light');
        applyLanguage(parsed.language || 'en');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // 🔥 Apply theme to entire application
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#e2e8f0';
      
      // Apply dark mode to all elements
      document.querySelectorAll('.bg-white').forEach(el => {
        if (!el.closest('.keep-white')) {
          el.classList.add('dark:bg-slate-900');
        }
      });
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#1e293b';
    }
  };

  // 🔥 Apply language (for future i18n)
  const applyLanguage = (language) => {
    // Set language attribute on HTML
    document.documentElement.lang = language;
    // You can implement i18n here later
    console.log(`Language set to: ${language}`);
  };

  // 🔥 Save all settings
  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    applyTheme(newSettings.theme);
    applyLanguage(newSettings.language);
    return true;
  };

  // 🔥 Update single setting
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    
    if (key === 'theme') {
      applyTheme(value);
    }
    if (key === 'language') {
      applyLanguage(value);
    }
    return true;
  };

  // 🔥 Reset settings
  const resetSettings = () => {
    const defaultSettings = {
      theme: 'light',
      language: 'en',
      notifications: true,
      emailAlerts: true,
      smsAlerts: false,
      autoRefresh: false,
      compactView: false,
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
    };
    setSettings(defaultSettings);
    localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
    applyTheme('light');
    applyLanguage('en');
    return defaultSettings;
  };

  // 🔥 Get formatted date based on settings
  const formatDate = (date) => {
    const d = new Date(date);
    const format = settings.dateFormat;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    switch(format) {
      case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
      default: return `${month}/${day}/${year}`;
    }
  };

  // 🔥 Get current time based on timezone
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      timeZone: settings.timezone === 'UTC' ? 'UTC' : 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const value = {
    settings,
    saveSettings,
    updateSetting,
    resetSettings,
    loadSettings,
    formatDate,
    getCurrentTime,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export default SettingsContext;