// src/pages/Settings.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  LanguageIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  PaletteIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { SunIcon as SunSolid, MoonIcon as MoonSolid } from '@heroicons/react/24/solid';
import Sidebar from '../components/Sidebar/Sidebar';
import Topbar from '../components/Topbar/Topbar';

// ============================================
// THEME CONFIGURATION
// ============================================

const THEMES = {
  light: {
    name: 'Light',
    icon: SunIcon,
    bg: 'bg-white',
    text: 'text-gray-900',
    card: 'bg-white',
    border: 'border-gray-200',
    sidebar: 'bg-white',
    header: 'bg-white',
    hover: 'hover:bg-gray-50',
  },
  dark: {
    name: 'Dark',
    icon: MoonIcon,
    bg: 'bg-gray-900',
    text: 'text-white',
    card: 'bg-gray-800',
    border: 'border-gray-700',
    sidebar: 'bg-gray-900',
    header: 'bg-gray-900',
    hover: 'hover:bg-gray-700',
  },
  system: {
    name: 'System',
    icon: ComputerDesktopIcon,
    bg: 'bg-white dark:bg-gray-900',
    text: 'text-gray-900 dark:text-white',
    card: 'bg-white dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    sidebar: 'bg-white dark:bg-gray-900',
    header: 'bg-white dark:bg-gray-900',
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
  },
};

// ============================================
// TOGGLE SWITCH
// ============================================

const ToggleSwitch = ({ enabled, onChange, label, description, disabled = false }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </p>
        {description && <p className={`text-xs ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
          {description}
        </p>}
      </div>
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

// ============================================
// SETTINGS CARD
// ============================================

const SettingsCard = ({ icon: Icon, title, children, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
};

// ============================================
// THEME SELECTOR
// ============================================

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const themes = [
    { id: 'light', name: 'Light', icon: SunSolid },
    { id: 'dark', name: 'Dark', icon: MoonSolid },
    { id: 'system', name: 'System', icon: ComputerDesktopIcon },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((theme) => {
        const Icon = theme.icon;
        const isSelected = currentTheme === theme.id;
        return (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              isSelected 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className={`text-xs font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {theme.name}
              </span>
              {isSelected && (
                <CheckCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ============================================
// COLOR SCHEME SELECTOR
// ============================================

const ColorSchemeSelector = ({ currentColor, onColorChange }) => {
  const colors = [
    { id: 'blue', color: '#3B82F6', name: 'Blue' },
    { id: 'indigo', color: '#6366F1', name: 'Indigo' },
    { id: 'purple', color: '#8B5CF6', name: 'Purple' },
    { id: 'pink', color: '#EC4899', name: 'Pink' },
    { id: 'red', color: '#EF4444', name: 'Red' },
    { id: 'orange', color: '#F59E0B', name: 'Orange' },
    { id: 'green', color: '#10B981', name: 'Green' },
    { id: 'teal', color: '#14B8A6', name: 'Teal' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {colors.map((color) => (
        <button
          key={color.id}
          onClick={() => onColorChange(color.id)}
          className={`p-2 rounded-lg border-2 transition-all ${
            currentColor === color.id 
              ? 'border-blue-500 dark:border-blue-400 shadow-md' 
              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <div 
              className="w-8 h-8 rounded-full shadow-sm"
              style={{ backgroundColor: color.color }}
            />
            <span className="text-[10px] text-gray-600 dark:text-gray-400">
              {color.name}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

// ============================================
// PROFILE SECTION
// ============================================

const ProfileSection = ({ user, onEdit }) => {
  return (
    <SettingsCard icon={UserCircleIcon} title="Profile">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.username}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mt-1">
            {user?.role}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Username</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
            {user?.role}
          </span>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <PencilIcon className="w-4 h-4" />
        Edit Profile
      </button>
    </SettingsCard>
  );
};

// ============================================
// NOTIFICATIONS SECTION
// ============================================

const NotificationsSection = ({ settings, updateSetting }) => {
  return (
    <SettingsCard icon={BellIcon} title="Notifications">
      <div className="space-y-2">
        <ToggleSwitch
          label="Email Notifications"
          description="Receive updates via email"
          enabled={settings.emailNotifications}
          onChange={(value) => updateSetting('emailNotifications', value)}
        />
        <ToggleSwitch
          label="Push Notifications"
          description="Receive push notifications in browser"
          enabled={settings.pushNotifications}
          onChange={(value) => updateSetting('pushNotifications', value)}
        />
        <ToggleSwitch
          label="Sound Alerts"
          description="Play sounds for important notifications"
          enabled={settings.soundAlerts}
          onChange={(value) => updateSetting('soundAlerts', value)}
        />
        <ToggleSwitch
          label="Task Reminders"
          description="Get reminders for upcoming tasks"
          enabled={settings.taskReminders}
          onChange={(value) => updateSetting('taskReminders', value)}
        />
        <ToggleSwitch
          label="Weekly Reports"
          description="Receive weekly project summary reports"
          enabled={settings.weeklyReports}
          onChange={(value) => updateSetting('weeklyReports', value)}
        />
      </div>
    </SettingsCard>
  );
};

// ============================================
// SECURITY SECTION
// ============================================

const SecuritySection = ({ onChangePassword, onTwoFactor, onSessions }) => {
  return (
    <SettingsCard icon={ShieldCheckIcon} title="Security">
      <div className="space-y-3">
        <button
          onClick={onChangePassword}
          className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                Change Password
              </p>
              <p className="text-xs text-gray-400">Update your password</p>
            </div>
            <KeyIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
          </div>
        </button>
        <button
          onClick={onTwoFactor}
          className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                Two-Factor Authentication
              </p>
              <p className="text-xs text-gray-400">Add an extra layer of security</p>
            </div>
            <ShieldCheckIcon className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
          </div>
        </button>
        <button
          onClick={onSessions}
          className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                Active Sessions
              </p>
              <p className="text-xs text-gray-400">Manage your logged-in devices</p>
            </div>
            <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
          </div>
        </button>
      </div>
    </SettingsCard>
  );
};

// ============================================
// PREFERENCES SECTION
// ============================================

const PreferencesSection = ({ settings, updateSetting }) => {
  return (
    <SettingsCard icon={Cog6ToothIcon} title="Preferences">
      <div className="space-y-4">
        {/* Theme Selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Theme
          </label>
          <ThemeSelector 
            currentTheme={settings.theme || 'system'} 
            onThemeChange={(theme) => updateSetting('theme', theme)}
          />
        </div>

        {/* Color Scheme */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Color Scheme
          </label>
          <ColorSchemeSelector 
            currentColor={settings.colorScheme || 'blue'} 
            onColorChange={(color) => updateSetting('colorScheme', color)}
          />
        </div>

        {/* Language */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</p>
            <p className="text-xs text-gray-400">Select your preferred language</p>
          </div>
          <select
            value={settings.language || 'en'}
            onChange={(e) => updateSetting('language', e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="pt">Português</option>
          </select>
        </div>

        {/* Time Zone */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Zone</p>
            <p className="text-xs text-gray-400">Set your time zone</p>
          </div>
          <select
            value={settings.timezone || 'UTC-4'}
            onChange={(e) => updateSetting('timezone', e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC-12">UTC - 12 (IDLW)</option>
            <option value="UTC-11">UTC - 11 (SST)</option>
            <option value="UTC-10">UTC - 10 (HST)</option>
            <option value="UTC-9">UTC - 9 (AKST)</option>
            <option value="UTC-8">UTC - 8 (PST)</option>
            <option value="UTC-7">UTC - 7 (MST)</option>
            <option value="UTC-6">UTC - 6 (CST)</option>
            <option value="UTC-5">UTC - 5 (EST)</option>
            <option value="UTC-4">UTC - 4 (AST)</option>
            <option value="UTC-3">UTC - 3 (BRT)</option>
            <option value="UTC+0">UTC + 0 (GMT)</option>
            <option value="UTC+1">UTC + 1 (CET)</option>
            <option value="UTC+2">UTC + 2 (EET)</option>
            <option value="UTC+3">UTC + 3 (MSK)</option>
            <option value="UTC+5">UTC + 5 (PKT)</option>
            <option value="UTC+8">UTC + 8 (SGT)</option>
            <option value="UTC+10">UTC + 10 (AEST)</option>
            <option value="UTC+12">UTC + 12 (NZST)</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Font Size</p>
            <p className="text-xs text-gray-400">Adjust text size</p>
          </div>
          <select
            value={settings.fontSize || 'medium'}
            onChange={(e) => updateSetting('fontSize', e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra Large</option>
          </select>
        </div>
      </div>
    </SettingsCard>
  );
};

// ============================================
// CHANGE PASSWORD MODAL
// ============================================

const ChangePasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN SETTINGS COMPONENT
// ============================================

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    soundAlerts: true,
    taskReminders: true,
    weeklyReports: false,
    theme: 'system',
    colorScheme: 'blue',
    language: 'en',
    timezone: 'UTC-4',
    fontSize: 'medium',
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // ============================================
  // LOAD SETTINGS
  // ============================================

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/settings/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
        // Sync theme with context
        if (data.theme) {
          setTheme(data.theme);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, setTheme]);

  // ============================================
  // UPDATE SETTING
  // ============================================

  const updateSetting = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // If theme changed, update context
    if (key === 'theme') {
      setTheme(value);
    }
    
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_BASE_URL}/api/settings/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });
      toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} updated!`);
    } catch (error) {
      console.error('❌ Failed to update setting:', error);
      toast.error('Failed to update setting');
    }
  };

  // ============================================
  // CHANGE PASSWORD
  // ============================================

  const handleChangePassword = async (oldPassword, newPassword) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change password');
    }

    toast.success('Password changed successfully! 🎉');
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleEditProfile = () => {
    toast.success('Profile edit feature coming soon!');
  };

  const handleTwoFactor = () => {
    toast.info('Two-factor authentication coming soon!');
  };

  const handleSessions = () => {
    toast.info('Active sessions feature coming soon!');
  };

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={`flex h-screen ${isDark ? 'dark' : ''} bg-gray-50 dark:bg-gray-900 overflow-hidden`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Configure your account and preferences
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                <span className="w-1.5 h-1.5 inline-block rounded-full bg-emerald-400 mr-1"></span>
                Settings saved
              </span>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileSection user={user} onEdit={handleEditProfile} />
            <NotificationsSection settings={settings} updateSetting={updateSetting} />
            <SecuritySection
              onChangePassword={() => setShowPasswordModal(true)}
              onTwoFactor={handleTwoFactor}
              onSessions={handleSessions}
            />
            <PreferencesSection settings={settings} updateSetting={updateSetting} />
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-red-900 dark:text-red-400">Danger Zone</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Delete Account</p>
                <p className="text-xs text-gray-400">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    toast.error('Account deletion coming soon!');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete Account
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  );
}