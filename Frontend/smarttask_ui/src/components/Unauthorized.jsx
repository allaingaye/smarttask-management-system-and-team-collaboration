// src/components/Unauthorized.jsx
import { useNavigate } from 'react-router-dom';
import { 
  ShieldExclamationIcon, 
  ArrowLeftIcon, 
  HomeIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  FolderIcon,
  ChartBarIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, userRole, logout, isAuthenticated, loading } = useAuth();
  const [suggestedPath, setSuggestedPath] = useState('/dashboard');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // ✅ Suggest the correct dashboard based on role
    if (userRole === 'Admin') {
      setSuggestedPath('/dashboard');
    } else if (userRole === 'Manager') {
      setSuggestedPath('/manager/dashboard');
    } else if (userRole === 'Member') {
      setSuggestedPath('/dashboard');
    } else {
      setSuggestedPath('/login');
    }

    // ✅ Auto-redirect after 5 seconds if not authenticated
    if (!isAuthenticated && !loading) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [userRole, isAuthenticated, navigate, loading]);

  // ✅ Get role-based suggestions (matches AppRouter structure)
  const getRoleSuggestions = () => {
    if (userRole === 'Admin') {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { label: 'Projects', path: '/projects', icon: FolderIcon },
        { label: 'Tasks', path: '/tasks', icon: ClipboardDocumentListIcon },
        { label: 'AI Insights', path: '/ai-insights', icon: SparklesIcon },
        { label: 'Analytics', path: '/analytics', icon: ChartBarIcon },
        { label: 'Roles & Access', path: '/roles', icon: UserCircleIcon },
        { label: 'Audit Logs', path: '/audit-log', icon: QuestionMarkCircleIcon },
        { label: 'Settings', path: '/settings', icon: Cog6ToothIcon },
      ];
    } else if (userRole === 'Manager') {
      return [
        { label: 'Manager Dashboard', path: '/manager/dashboard', icon: HomeIcon },
        { label: 'Projects', path: '/manager/projects', icon: FolderIcon },
        { label: 'Tasks', path: '/manager/tasks', icon: ClipboardDocumentListIcon },
        { label: 'AI Insights', path: '/manager/ai-insights', icon: SparklesIcon },
        { label: 'Analytics', path: '/manager/analytics', icon: ChartBarIcon },
        { label: 'Settings', path: '/settings', icon: Cog6ToothIcon },
      ];
    } else if (userRole === 'Member') {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { label: 'My Tasks', path: '/my-tasks', icon: ClipboardDocumentListIcon },
        { label: 'My AI Insights', path: '/my-ai-insights', icon: SparklesIcon },
        { label: 'Settings', path: '/settings', icon: Cog6ToothIcon },
      ];
    }
    return [];
  };

  const suggestions = getRoleSuggestions();

  // ✅ Handle logout
  const handleLogout = () => {
    logout(true);
    navigate('/login');
  };

  // ✅ Get role-specific emoji and color
  const getRoleInfo = () => {
    if (userRole === 'Admin') {
      return { 
        emoji: '🛡️', 
        color: 'purple', 
        bgColor: 'bg-purple-100', 
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
      };
    } else if (userRole === 'Manager') {
      return { 
        emoji: '📊', 
        color: 'blue', 
        bgColor: 'bg-blue-100', 
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
      };
    } else if (userRole === 'Member') {
      return { 
        emoji: '👤', 
        color: 'emerald', 
        bgColor: 'bg-emerald-100', 
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
      };
    }
    return { 
      emoji: '👤', 
      color: 'gray', 
      bgColor: 'bg-gray-100', 
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
    };
  };

  const roleInfo = getRoleInfo();

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Get role display name
  const getRoleDisplayName = () => {
    if (userRole === 'Admin') return 'Administrator';
    if (userRole === 'Manager') return 'Manager';
    if (userRole === 'Member') return 'Team Member';
    return userRole || 'User';
  };

  // ✅ Get role-specific help text
  const getRoleHelpText = () => {
    if (userRole === 'Admin') {
      return 'You have full system access. Try going to your dashboard or manage users.';
    } else if (userRole === 'Manager') {
      return 'You can manage your projects and team. Try going to your manager dashboard.';
    } else if (userRole === 'Member') {
      return 'You can work on your assigned tasks. Try going to your tasks page.';
    }
    return 'Please contact your administrator for assistance.';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-lg w-full p-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-28 h-28 rounded-full bg-red-100 flex items-center justify-center mb-6 shadow-lg shadow-red-200/50">
            <ShieldExclamationIcon className="w-14 h-14 text-red-500 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Access Denied
        </h1>
        <p className="text-center text-gray-500 mb-2">
          You don't have permission to access this page.
        </p>

        {/* User info */}
        {user && (
          <div className="text-center mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border ${roleInfo.borderColor}`}>
              <UserCircleIcon className="w-4 h-4 mr-1" />
              {user.username}
              <span className="mx-2 text-gray-300">|</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleInfo.bgColor} ${roleInfo.textColor}`}>
                {roleInfo.emoji} {getRoleDisplayName()}
              </span>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">{getRoleHelpText()}</p>
        </div>

        {/* Message */}
        <div className={`rounded-xl p-4 mb-6 ${isAuthenticated ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm ${isAuthenticated ? 'text-amber-800' : 'text-blue-800'}`}>
            {isAuthenticated ? (
              <>
                💡 This area is restricted. Your role <strong>"{getRoleDisplayName()}"</strong> does not have permission to access this page.
                {userRole === 'Manager' && (
                  <span className="block mt-1 text-xs text-amber-600">
                    Try accessing <strong>/manager/dashboard</strong> for your manager dashboard.
                  </span>
                )}
                {userRole === 'Member' && (
                  <span className="block mt-1 text-xs text-amber-600">
                    Try accessing <strong>/my-tasks</strong> for your tasks.
                  </span>
                )}
                {userRole === 'Admin' && (
                  <span className="block mt-1 text-xs text-amber-600">
                    Try accessing <strong>/dashboard</strong> for your admin dashboard.
                  </span>
                )}
              </>
            ) : (
              `🔒 You are not logged in. Redirecting to login in ${countdown} seconds...`
            )}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Go Back</span>
          </button>

          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate(suggestedPath)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                <HomeIcon className="w-5 h-5" />
                <span>Go to {userRole === 'Manager' ? 'Manager' : ''} Dashboard</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Go to Login</span>
            </button>
          )}
        </div>

        {/* Role-based suggestions */}
        {isAuthenticated && suggestions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center mb-3">
              You might want to try:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => navigate(suggestion.path)}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
                >
                  <suggestion.icon className="w-5 h-5 text-gray-400 mb-1 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[10px] text-gray-600 text-center group-hover:text-gray-900 transition-colors leading-tight">
                    {suggestion.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Need help? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}