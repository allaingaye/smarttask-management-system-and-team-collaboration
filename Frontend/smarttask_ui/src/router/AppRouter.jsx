// src/router/AppRouter.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Unauthorized from '../components/Unauthorized';

// 🏠 Public Homepage
import Homepage from '../pages/Homepage';

// Auth pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

// Admin pages (Full access)
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import Tasks from '../pages/Tasks';
import Analytics from '../pages/Analytics';
import RolesAccess from '../pages/RolesAccess';
import AuditLogs from '../pages/AuditLogs';
import AIInsights from '../pages/AIInsights';

// Manager pages (Scoped access)
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import ManagerProjects from '../pages/manager/ManagerProjects';
import ManagerTasks from '../pages/manager/ManagerTasks';
import ManagerAnalytics from '../pages/manager/ManagerAnalytics';
import ManagerAIInsights from '../pages/manager/ManagerAIInsights';

// Member pages
import MemberDashboard from '../pages/member/MemberDashboard';
import MemberTasks from '../pages/member/MemberTasks';
import MemberAIInsights from '../pages/member/MemberAIInsights';

// Common pages (all users)
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';

// ✅ 404 Component - Enhanced with dark mode support
const NotFound = ({ userRole, isAuthenticated }) => {
  const getHomePath = () => {
    if (!isAuthenticated) return '/';
    if (userRole === 'Manager') return '/manager/dashboard';
    if (userRole === 'Admin') return '/dashboard';
    if (userRole === 'Member') return '/member/dashboard';
    return '/';
  };

  const getRoleLabel = () => {
    if (!isAuthenticated) return 'Home';
    if (userRole === 'Manager') return 'Manager Dashboard';
    if (userRole === 'Member') return 'Member Dashboard';
    return 'Dashboard';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md p-8">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🔍</span>
        </div>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Page Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The page you are looking for doesn't exist or has been moved.</p>
        <a 
          href={getHomePath()} 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
        >
          {!isAuthenticated ? 'Go to Home' : `Go to ${getRoleLabel()}`}
        </a>
      </div>
    </div>
  );
};

// ✅ Role-based Dashboard Redirect
const DashboardRedirect = () => {
  const { userRole, isAuthenticated, loading } = useAuth();
  
  console.log('🔄 DashboardRedirect - isAuthenticated:', isAuthenticated, 'userRole:', userRole);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('🔄 Redirecting to homepage (not authenticated)');
    return <Navigate to="/" replace />;
  }
  
  // Redirect based on role
  if (userRole === 'Manager') {
    console.log('🔄 Redirecting to manager dashboard');
    return <Navigate to="/manager/dashboard" replace />;
  }
  
  if (userRole === 'Member') {
    console.log('🔄 Redirecting to member dashboard');
    return <Navigate to="/member/dashboard" replace />;
  }
  
  if (userRole === 'Admin') {
    console.log('🔄 Redirecting to admin dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Fallback: if authenticated but no role, go to homepage
  console.warn('⚠️ User authenticated but no role, redirecting to homepage');
  return <Navigate to="/" replace />;
};

// ✅ App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, userRole, loading } = useAuth();

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  console.log('📋 AppRouter - Current state:', {
    isAuthenticated,
    userRole: userRole || 'null (not logged in)',
    hasUser: !!userRole,
    timestamp: new Date().toISOString()
  });

  return (
    <Routes>
      {/* ==================== 🏠 PUBLIC ROUTES ==================== */}
      
      {/* ✅ Homepage - Landing page (public) */}
      <Route path="/" element={<Homepage />} />
      
      {/* ✅ Auth Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* ✅ Dashboard Redirect (if user goes to /dashboard without role) */}
      <Route path="/dashboard-redirect" element={<DashboardRedirect />} />

      {/* ==================== 🔒 AUTHENTICATED ROUTES ==================== */}

      {/* ✅ Common Routes - All Authenticated Users */}
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />

      {/* ==================== ✅ ADMIN ROUTES ==================== */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Projects />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Tasks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/roles" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <RolesAccess />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/audit-log" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AuditLogs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ai-insights" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AIInsights />
          </ProtectedRoute>
        } 
      />

      {/* ==================== ✅ MANAGER ROUTES ==================== */}
      <Route 
        path="/manager/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manager/projects" 
        element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <ManagerProjects />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manager/tasks" 
        element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <ManagerTasks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manager/analytics" 
        element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <ManagerAnalytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manager/ai-insights" 
        element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <ManagerAIInsights />
          </ProtectedRoute>
        } 
      />

      {/* ==================== ✅ MEMBER ROUTES ==================== */}
      <Route 
        path="/member/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Member']}>
            <MemberDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/member/tasks" 
        element={
          <ProtectedRoute allowedRoles={['Member']}>
            <MemberTasks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/member/ai-insights" 
        element={
          <ProtectedRoute allowedRoles={['Member']}>
            <MemberAIInsights />
          </ProtectedRoute>
        } 
      />
      
      {/* ✅ Alias for member tasks (backward compatibility) */}
      <Route 
        path="/my-tasks" 
        element={
          <ProtectedRoute allowedRoles={['Member']}>
            <MemberTasks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-ai-insights" 
        element={
          <ProtectedRoute allowedRoles={['Member']}>
            <MemberAIInsights />
          </ProtectedRoute>
        } 
      />

      {/* ✅ 404 - Role-aware */}
      <Route 
        path="*" 
        element={<NotFound userRole={userRole} isAuthenticated={isAuthenticated} />} 
      />
    </Routes>
  );
};

// ✅ Main App Router with Auth & Theme Providers
const AppRouter = () => {
  console.log('🚀 AppRouter initializing...');
  
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;