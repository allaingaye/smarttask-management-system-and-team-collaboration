// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const refreshTimeoutRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // ✅ Clear all auth data
  const clearAuthData = useCallback(() => {
    console.log('🧹 Clearing all auth data...');
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setLoginError(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    
    // Clear any scheduled refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // ✅ Fetch current user
  const fetchCurrentUser = useCallback(async (retryCount = 0) => {
    const currentToken = localStorage.getItem('access_token');
    
    if (!currentToken) {
      setLoading(false);
      return null;
    }

    try {
      console.log('🔍 Fetching current user...');
      const response = await fetch(`${API_BASE_URL}/api/me/`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
          is_staff: data.is_staff,
          is_superuser: data.is_superuser,
        };
        setUser(userData);
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_id', data.id);
        localStorage.setItem('username', data.username);
        localStorage.setItem('user_email', data.email);
        console.log('✅ User authenticated:', userData.username, 'Role:', data.role);
        return userData;
      } else if (response.status === 401 && retryCount < 1) {
        console.warn('⚠️ Token expired, attempting refresh...');
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return fetchCurrentUser(retryCount + 1);
        }
        clearAuthData();
        return null;
      } else {
        console.warn('⚠️ Failed to fetch user, clearing auth data');
        clearAuthData();
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to fetch user:', error);
      if (retryCount < 1) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return fetchCurrentUser(retryCount + 1);
        }
      }
      clearAuthData();
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, clearAuthData]);

  // ✅ Refresh access token
  const refreshAccessToken = useCallback(async () => {
    const currentRefreshToken = localStorage.getItem('refresh_token');
    
    if (!currentRefreshToken || isRefreshing) {
      return false;
    }

    setIsRefreshing(true);
    try {
      console.log('🔄 Refreshing token...');
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: currentRefreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access;
        
        setToken(newToken);
        localStorage.setItem('access_token', newToken);
        
        if (data.refresh) {
          setRefreshToken(data.refresh);
          localStorage.setItem('refresh_token', data.refresh);
        }
        
        console.log('✅ Token refreshed successfully');
        return true;
      } else {
        console.warn('⚠️ Token refresh failed');
        clearAuthData();
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);
      clearAuthData();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [API_BASE_URL, clearAuthData, isRefreshing]);

  // ✅ Login
  const login = async (username, password) => {
    setLoginError(null);
    console.log('🔐 Attempting login for:', username);
    
    // Clear any existing auth data first
    clearAuthData();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password.trim() 
        }),
      });

      console.log('📡 Login response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const error = await response.json();
          console.error('📡 Error response:', error);
          errorMessage = error.detail || error.message || error.non_field_errors?.[0] || errorMessage;
        } catch (e) {
          const text = await response.text();
          console.error('📡 Error text:', text);
          errorMessage = `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Login successful!');
      
      const newToken = data.access;
      const newRefreshToken = data.refresh;
      
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      localStorage.setItem('access_token', newToken);
      localStorage.setItem('refresh_token', newRefreshToken);

      // Fetch user data
      const userData = await fetchCurrentUser();
      
      if (userData) {
        toast.success(`Welcome back, ${userData.username}!`, {
          duration: 3000,
          icon: '👋',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        
        // ✅ Redirect based on role
        let redirectPath = '/dashboard';
        if (userData.role === 'Manager') {
          redirectPath = '/manager/dashboard';
        } else if (userData.role === 'Admin') {
          redirectPath = '/dashboard';
        }
        
        console.log(`🔀 Redirecting to: ${redirectPath} (Role: ${userData.role})`);
        navigate(redirectPath, { replace: true });
        return true;
      } else {
        throw new Error('Failed to fetch user data after login');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setLoginError(error.message);
      toast.error(error.message || 'Login failed', {
        duration: 4000,
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return false;
    }
  };

  // ✅ Logout - UPDATED to ensure complete cleanup
  const logout = useCallback((showToast = true) => {
    console.log('👋 Logging out...');
    
    // Clear all auth data including state
    clearAuthData();
    
    // Double-check that user is cleared
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    
    // Clear localStorage again to be safe
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    
    // Clear sessionStorage if used
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    
    if (showToast) {
      toast.success('Logged out successfully', {
        duration: 2000,
        icon: '👋',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
    
    // Navigate to login only if not already on login page
    if (!['/login', '/register'].includes(location.pathname)) {
      navigate('/login', { replace: true });
    }
  }, [clearAuthData, navigate, location]);

  // ✅ Check if user has role
  const hasRole = useCallback((allowedRoles) => {
    if (!user) return false;
    if (!Array.isArray(allowedRoles)) {
      allowedRoles = [allowedRoles];
    }
    return allowedRoles.includes(user.role);
  }, [user]);

  // ✅ Check if user has permission (for specific actions)
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    const permissions = {
      Admin: [
        'view_all',
        'manage_users',
        'manage_roles',
        'manage_projects',
        'manage_tasks',
        'view_analytics',
        'view_audit_logs',
        'view_ai_insights',
        'create_projects',
        'edit_projects',
        'delete_projects',
        'create_tasks',
        'edit_tasks',
        'delete_tasks',
        'assign_tasks',
        'view_team_members',
        'manage_team_members',
      ],
      Manager: [
        'view_projects',
        'create_projects',
        'edit_own_projects',
        'view_tasks',
        'create_tasks',
        'edit_tasks',
        'assign_tasks',
        'view_analytics',
        'view_ai_insights',
        'view_team_members',
        'manage_team_members',
      ],
      Member: [
        'view_own_tasks',
        'update_own_tasks',
        'view_projects',
        'view_personal_ai_insights',
      ],
    };

    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes(permission);
  }, [user]);

  // ✅ Get user display name
  const getDisplayName = useCallback(() => {
    return user?.username || 'User';
  }, [user]);

  // ✅ Get user initials
  const getUserInitials = useCallback(() => {
    if (!user?.username) return 'U';
    const name = user.username;
    if (name.includes(' ')) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return name.slice(0, 2).toUpperCase();
  }, [user]);

  // ✅ Get role color
  const getRoleColor = useCallback((role = null) => {
    const colors = {
      Admin: 'bg-purple-100 text-purple-700 border-purple-200',
      Manager: 'bg-blue-100 text-blue-700 border-blue-200',
      Member: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return colors[role || user?.role] || 'bg-gray-100 text-gray-700';
  }, [user]);

  // ✅ Get user's dashboard path
  const getDashboardPath = useCallback(() => {
    if (user?.role === 'Manager') return '/manager/dashboard';
    if (user?.role === 'Admin') return '/dashboard';
    return '/dashboard';
  }, [user]);

  // ✅ Get user's home path (for 404 redirects)
  const getHomePath = useCallback(() => {
    if (user?.role === 'Manager') return '/manager/dashboard';
    return '/dashboard';
  }, [user]);

  // ✅ Check if user is Manager
  const isManager = useCallback(() => {
    return user?.role === 'Manager';
  }, [user]);

  // ✅ Check if user is Admin
  const isAdmin = useCallback(() => {
    return user?.role === 'Admin';
  }, [user]);

  // ✅ Auto-refresh token every 5 minutes
  useEffect(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    if (token && refreshToken && user) {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshAccessToken();
      }, 4.5 * 60 * 1000); // 4.5 minutes
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [token, refreshToken, user, refreshAccessToken]);

  // ✅ Initial load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('access_token');
      if (savedToken) {
        await fetchCurrentUser();
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ✅ FIXED: isAuthenticated and userRole now properly reflect state
  const value = {
    user,
    token,
    refreshToken,
    loading,
    isRefreshing,
    loginError,
    login,
    logout,
    hasRole,
    hasPermission,
    fetchCurrentUser,
    refreshAccessToken,
    getDisplayName,
    getUserInitials,
    getRoleColor,
    getDashboardPath,
    getHomePath,
    clearAuthData,
    isManager,
    isAdmin,
    isAuthenticated: !!user, // true only if user exists
    userRole: user?.role || null, // null when user is null, not 'Member'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};