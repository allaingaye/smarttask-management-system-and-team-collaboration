// src/pages/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  ChartBarIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ClipboardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import TasksTable from "../components/Tables/TasksTable";
import CompletionRateChart from "../components/Charts/CompletionRateChart";
import TasksPerProjectChart from "../components/Charts/TasksPerProjectChart";
import useProjects from "../hooks/useProjects";
import useTasks from "../hooks/useTasks";

// ✅ Animated Counter Component
const AnimatedCounter = ({ value, duration = 1000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    let startTime;
    const startValue = 0;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * (value - startValue) + startValue);
      setCount(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{prefix}{count}{suffix}</span>;
};

// ✅ KPI Card Component
const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  subtitle, 
  trend, 
  trendValue, 
  onClick,
  loading = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowTrendingUpIcon className="w-3 h-3" />;
    if (trend === 'down') return <ArrowTrendingDownIcon className="w-3 h-3" />;
    return null;
  };

  return (
    <div
      className={`rounded-2xl p-6 shadow-sm transition-all duration-300 cursor-pointer ${
        isHovered ? 'shadow-lg transform -translate-y-1' : 'shadow-sm'
      } ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}CC 100%)`,
        borderLeft: `4px solid ${color}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">
              <AnimatedCounter value={value} duration={800} />
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div 
          className="p-3 rounded-xl flex-shrink-0"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      
      {trend && trendValue && (
        <div className="flex items-center space-x-1 mt-3">
          <span className={`text-xs font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            {trendValue}
          </span>
          <span className="text-xs text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
};

// ✅ Quick Stats Bar
const QuickStatsBar = ({ tasks, projects }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
          <p className="text-xs text-gray-500">Total Tasks</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
          <p className="text-xs text-gray-500">Completion Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
          <p className="text-xs text-gray-500">Total Projects</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{activeProjects}</p>
          <p className="text-xs text-gray-500">Active Projects</p>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { projects, loading: loadingProjects, error: errorProjects } = useProjects();
  const { tasks, loading: loadingTasks, error: errorTasks } = useTasks();
  const [refreshing, setRefreshing] = useState(false);

  const projectList = Array.isArray(projects) ? projects : [];
  const taskList = Array.isArray(tasks) ? tasks : [];

  // ✅ Project KPIs
  const activeProjects = projectList.filter((p) => p.status === "active").length;
  const completedProjects = projectList.filter((p) => p.status === "completed").length;
  const archivedProjects = projectList.filter((p) => p.status === "archived").length;

  // ✅ Task KPIs
  const tasksCompleted = taskList.filter((t) => t.status === "completed").length;
  const tasksInProgress = taskList.filter((t) => t.status === "in_progress").length;
  const tasksPending = taskList.filter((t) => t.status === "pending").length;
  const tasksOverdue = taskList.filter((t) => t.is_overdue).length;

  // ✅ Sort tasks so recent ones show first
  const recentTasks = [...taskList].sort(
    (a, b) => new Date(b.due_date) - new Date(a.due_date)
  );

  // ✅ Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Refreshing data...',
        success: 'Dashboard updated! ✨',
        error: 'Failed to refresh',
      }
    ).then(() => {
      // Refetch data here (you can use a refetch function from your hooks)
      window.location.reload();
    });
  };

  // ✅ Loading state with skeleton
  if (loadingProjects || loadingTasks) {
    return (
      <div className="flex h-screen bg-[#F7F8FA]">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (errorProjects || errorTasks) {
    return (
      <div className="flex h-screen bg-[#F7F8FA]">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">😅</div>
              <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
              <p className="text-gray-500 mt-2">Failed to fetch data. Please check your connection.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F7F8FA] overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-sm">
                Real-time overview of your projects and tasks
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                disabled={refreshing}
              >
                <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => navigate("/projects/create")}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <QuickStatsBar tasks={taskList} projects={projectList} />

          {/* Project KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Active Projects"
              value={activeProjects}
              icon={ChartBarIcon}
              color="#3B82F6"
              bgColor="#EFF6FF"
              subtitle={`${activeProjects} projects in progress`}
              trend="up"
              trendValue="12%"
              onClick={() => navigate("/projects?status=active")}
            />
            <KPICard
              title="Completed Projects"
              value={completedProjects}
              icon={CheckCircleIcon}
              color="#10B981"
              bgColor="#ECFDF5"
              subtitle={`${completedProjects} projects completed`}
              trend="up"
              trendValue="8%"
              onClick={() => navigate("/projects?status=completed")}
            />
            <KPICard
              title="Archived Projects"
              value={archivedProjects}
              icon={ArchiveBoxIcon}
              color="#6B7280"
              bgColor="#F3F4F6"
              subtitle={`${archivedProjects} projects archived`}
              onClick={() => navigate("/projects?status=archived")}
            />
            <KPICard
              title="Overdue Tasks"
              value={tasksOverdue}
              icon={ExclamationTriangleIcon}
              color="#EF4444"
              bgColor="#FEF2F2"
              subtitle={`${tasksOverdue} tasks overdue`}
              trend="down"
              trendValue="5%"
              onClick={() => navigate("/tasks?status=overdue")}
            />
          </div>

          {/* Task KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <KPICard
              title="Completed Tasks"
              value={tasksCompleted}
              icon={ClipboardDocumentCheckIcon}
              color="#10B981"
              bgColor="#ECFDF5"
              subtitle={`${tasksCompleted} tasks done`}
              trend="up"
              trendValue="15%"
              onClick={() => navigate("/tasks?status=completed")}
            />
            <KPICard
              title="In Progress"
              value={tasksInProgress}
              icon={ClockIcon}
              color="#F59E0B"
              bgColor="#FFFBEB"
              subtitle={`${tasksInProgress} tasks in progress`}
              onClick={() => navigate("/tasks?status=in_progress")}
            />
            <KPICard
              title="Pending Tasks"
              value={tasksPending}
              icon={ClipboardIcon}
              color="#8B5CF6"
              bgColor="#F5F3FF"
              subtitle={`${tasksPending} tasks pending`}
              onClick={() => navigate("/tasks?status=pending")}
            />
          </div>

          {/* Recent Tasks Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
                <p className="text-sm text-gray-500">Your latest tasks and their status</p>
              </div>
              <button
                onClick={() => navigate("/tasks")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
              >
                <span>View all</span>
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <TasksTable tasks={recentTasks.slice(0, 5)} />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Completion Rate</h2>
                  <p className="text-sm text-gray-500">Task completion over time</p>
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  +12%
                </span>
              </div>
              <div className="h-64">
                <CompletionRateChart />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Tasks Per Project</h2>
                  <p className="text-sm text-gray-500">Distribution across projects</p>
                </div>
              </div>
              <div className="h-64">
                <TasksPerProjectChart />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}