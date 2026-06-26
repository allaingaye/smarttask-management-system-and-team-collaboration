// src/components/Sidebar/Sidebar.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  SparklesIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar({ unreadCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, isAuthenticated, logout, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, overdue: 0, inProgress: 0 });
  const [projectStats, setProjectStats] = useState({ total: 0, active: 0, completed: 0 });

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // ✅ Fetch stats based on role
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // Fetch tasks
      const tasksResponse = await fetch(`${API_BASE_URL}/api/tasks/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (tasksResponse.ok) {
        const data = await tasksResponse.json();
        const tasks = data.results || data || [];
        const completed = tasks.filter(t => t.status === "completed").length;
        const inProgress = tasks.filter(t => t.status === "in_progress").length;
        const overdue = tasks.filter(t => {
          if (t.status === "completed") return false;
          return t.due_date && new Date(t.due_date) < new Date();
        }).length;
        
        setTaskStats({
          total: tasks.length,
          completed,
          inProgress,
          overdue,
        });
      }

      // Fetch projects (only for Manager/Admin)
      if (userRole === "Manager" || userRole === "Admin") {
        const projectsResponse = await fetch(`${API_BASE_URL}/api/projects/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (projectsResponse.ok) {
          const data = await projectsResponse.json();
          const projects = data.results || data || [];
          const active = projects.filter(p => p.status === "active").length;
          const completed = projects.filter(p => p.status === "completed").length;
          
          setProjectStats({
            total: projects.length,
            active,
            completed,
          });
        }
      }
    } catch (error) {
      console.error("❌ Failed to fetch stats:", error);
    }
  }, [API_BASE_URL, userRole]);

  // ✅ Fetch stats when userRole changes
  useEffect(() => {
    if (userRole && isAuthenticated) {
      fetchStats();
    }
  }, [userRole, isAuthenticated, fetchStats]);

  // ✅ Update loading state from auth context
  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  // ✅ Get role-specific dashboard configuration
  const getDashboardConfig = () => {
    if (userRole === "Manager") {
      return {
        label: "Dashboard",
        path: "/manager/dashboard",
        icon: HomeIcon,
        description: "Overview & metrics"
      };
    }
    if (userRole === "Member") {
      return {
        label: "My Dashboard",
        path: "/member/dashboard",
        icon: HomeIcon,
        description: "Personal workspace"
      };
    }
    // Admin or default
    return {
      label: "Dashboard",
      path: "/dashboard",
      icon: HomeIcon,
      description: "Overview"
    };
  };

  // ✅ Role-based navigation items with CORRECT paths
  const getMenuItems = () => {
    const dashboard = getDashboardConfig();
    
    const commonItems = [
      dashboard, // Single dashboard entry
      { 
        label: "Notifications", 
        icon: BellIcon, 
        path: "/notifications",
        badge: unreadCount,
        description: "Updates & alerts"
      },
    ];

    // ✅ Admin Menu
    if (userRole === "Admin") {
      return [
        ...commonItems,
        { 
          label: "Projects", 
          icon: FolderIcon, 
          path: "/projects", 
          description: `${projectStats.active} active · ${projectStats.completed} done`,
          badge: projectStats.active > 0 ? projectStats.active : 0,
        },
        { 
          label: "Tasks", 
          icon: ClipboardDocumentListIcon, 
          path: "/tasks",
          description: `${taskStats.total} total · ${taskStats.inProgress} in progress`,
          badge: taskStats.overdue > 0 ? taskStats.overdue : 0,
        },
        { 
          label: "AI Insights", 
          icon: SparklesIcon, 
          path: "/ai-insights", 
          description: "Smart analytics" 
        },
        { 
          label: "Analytics", 
          icon: ChartBarIcon, 
          path: "/analytics", 
          description: "Reports & metrics" 
        },
        { 
          label: "Roles & Access", 
          icon: UsersIcon, 
          path: "/roles", 
          description: "User management" 
        },
        { 
          label: "Audit Log", 
          icon: DocumentTextIcon, 
          path: "/audit-log", 
          description: "Activity history" 
        },
        { 
          label: "Settings", 
          icon: Cog6ToothIcon, 
          path: "/settings", 
          description: "Preferences" 
        },
      ];
    }

    // ✅ Manager Menu
    if (userRole === "Manager") {
      return [
        ...commonItems,
        { 
          label: "Projects", 
          icon: FolderIcon, 
          path: "/manager/projects",
          description: `${projectStats.active} active · ${projectStats.completed} done`,
          badge: projectStats.active > 0 ? projectStats.active : 0,
        },
        { 
          label: "Tasks", 
          icon: ClipboardDocumentListIcon, 
          path: "/manager/tasks",
          description: `${taskStats.total} total · ${taskStats.inProgress} in progress`,
          badge: taskStats.overdue > 0 ? taskStats.overdue : 0,
        },
        { 
          label: "AI Insights", 
          icon: SparklesIcon, 
          path: "/manager/ai-insights",
          description: "Project analytics" 
        },
        { 
          label: "Analytics", 
          icon: ChartBarIcon, 
          path: "/manager/analytics",
          description: "Reports & metrics" 
        },
        { 
          label: "Settings", 
          icon: Cog6ToothIcon, 
          path: "/settings",
          description: "Preferences" 
        },
      ];
    }

    // ✅ Member Menu
    if (userRole === "Member") {
      return [
        ...commonItems,
        { 
          label: "My Tasks", 
          icon: ClipboardDocumentListIcon, 
          path: "/member/tasks",
          description: `${taskStats.total} tasks · ${taskStats.completed} done`,
          badge: taskStats.overdue > 0 ? taskStats.overdue : 0,
        },
        { 
          label: "AI Insights", 
          icon: SparklesIcon, 
          path: "/member/ai-insights",
          description: "Personal insights" 
        },
        { 
          label: "Settings", 
          icon: Cog6ToothIcon, 
          path: "/settings",
          description: "Preferences" 
        },
      ];
    }

    // Fallback
    return [
      ...commonItems,
      { label: "Settings", icon: Cog6ToothIcon, path: "/settings", description: "Preferences" },
    ];
  };

  const items = getMenuItems();

  // ✅ Handle Logout using AuthContext
  const handleLogout = () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <ArrowRightOnRectangleIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Confirm Logout</p>
                <p className="mt-1 text-sm text-gray-500">Are you sure you want to sign out?</p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      logout(true); // Use auth context logout
                      setTimeout(() => {
                        navigate("/login", { replace: true });
                      }, 300);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yes, logout
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      { duration: 5000, position: "top-center" }
    );
  };

  // ✅ Helper functions
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    const colors = {
      Admin: "bg-purple-100 text-purple-700 border-purple-200",
      Manager: "bg-blue-100 text-blue-700 border-blue-200",
      Member: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  const getRoleIcon = (role) => {
    const icons = {
      Admin: "🛡️",
      Manager: "👔",
      Member: "👤",
    };
    return icons[role] || "👤";
  };

  // ✅ Loading state
  if (loading || authLoading) {
    return (
      <aside className="w-64 bg-white border-r h-screen flex flex-col sticky top-0 z-20 shadow-sm">
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      </aside>
    );
  }

  // ✅ If not authenticated, show minimal sidebar or nothing
  if (!isAuthenticated) {
    return null;
  }

  const displayName = user?.username || localStorage.getItem("username") || "User";
  const displayRole = userRole || localStorage.getItem("user_role") || "Member";

  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col sticky top-0 z-20 shadow-sm">
      {/* Brand block */}
      <div className="p-5 flex items-center space-x-3 border-b border-gray-100">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold rounded-xl w-10 h-10 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <span className="text-lg">✨</span>
        </div>
        <div>
          <span className="text-xl font-bold text-gray-800">SmartTask</span>
          <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
            Real-time Collaboration
          </p>
        </div>
      </div>

      {/* Quick Stats Banner */}
      {taskStats.total > 0 && (
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <ClipboardDocumentListIcon className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600">{taskStats.total} tasks</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex items-center text-emerald-600">
                <CheckCircleIcon className="h-3 w-3 mr-0.5" />
                {taskStats.completed}
              </span>
              {taskStats.overdue > 0 && (
                <span className="flex items-center text-red-500">
                  <ExclamationCircleIcon className="h-3 w-3 mr-0.5" />
                  {taskStats.overdue}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {items.map(({ label, icon: Icon, path, badge, description }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              `group relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Icon 
                className={`h-5 w-5 flex-shrink-0 transition-colors ${
                  location.pathname === path ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                }`} 
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm truncate">{label}</span>
                {description && (
                  <span className="text-[10px] text-gray-400 group-hover:text-gray-500 truncate">
                    {description}
                  </span>
                )}
              </div>
            </div>
            {badge > 0 && (
              <span className={`flex-shrink-0 ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                location.pathname === path 
                  ? "bg-indigo-600 text-white" 
                  : badge > 5 
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-amber-500 text-white"
              }`}>
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
              {getInitials(displayName)}
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400"></span>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getRoleColor(displayRole)}`}>
                {getRoleIcon(displayRole)} {displayRole}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}