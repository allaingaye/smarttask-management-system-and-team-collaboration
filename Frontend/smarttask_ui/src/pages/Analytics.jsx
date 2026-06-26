// src/pages/Analytics.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Activity,
  Briefcase,
  Target,
  Award,
  FileText,
  Printer,
  Mail,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";

// ============================================
// STAT CARD
// ============================================

const StatCard = ({ icon: Icon, title, value, subtitle, trend, color, loading }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${
          trend.includes('+') ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        }`}>
          {trend}
        </span>
      )}
    </div>
    {loading ? (
      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-3"></div>
    ) : (
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{value}</h3>
    )}
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
    {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{subtitle}</p>}
  </div>
);

// ============================================
// PERFORMANCE RING
// ============================================

const PerformanceRing = ({ label, value, color, loading }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  if (loading) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900 dark:text-white">{value}%</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{label}</p>
    </div>
  );
};

// ============================================
// ACTIVITY ITEM
// ============================================

const ActivityItem = ({ activity }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'create': return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'update': return <RefreshCw className="w-4 h-4 text-amber-600" />;
      case 'comment': return <Users className="w-4 h-4 text-purple-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBgColor = (type) => {
    switch(type) {
      case 'complete': return 'bg-emerald-100 dark:bg-emerald-900/30';
      case 'create': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'update': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'comment': return 'bg-purple-100 dark:bg-purple-900/30';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getBgColor(activity.type)}`}>
        {getIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">
          <span className="font-semibold">{activity.user}</span>{" "}
          {activity.action}{" "}
          <span className="font-medium text-indigo-600 dark:text-indigo-400">{activity.task}</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.time}</p>
      </div>
    </div>
  );
};

// ============================================
// EXPORT MODAL
// ============================================

const ExportModal = ({ isOpen, onClose, onExport, data, loading }) => {
  const [reportType, setReportType] = useState('summary');
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState('monthly');
  const [includeCharts, setIncludeCharts] = useState(true);

  if (!isOpen) return null;

  const exportOptions = [
    { id: 'summary', label: 'Executive Summary', icon: FileText },
    { id: 'detailed', label: 'Detailed Report', icon: FileText },
    { id: 'tasks', label: 'Task Report', icon: CheckCircle },
    { id: 'projects', label: 'Project Report', icon: Briefcase },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Export Report</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Download analytics report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {exportOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = reportType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setReportType(opt.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium mt-1 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {opt.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Format
            </label>
            <div className="flex gap-3">
              {['pdf', 'csv', 'excel'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium capitalize ${
                    format === f 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="quarterly">This Quarter</option>
              <option value="yearly">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Options */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Include Charts & Visualizations
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onExport({ reportType, format, dateRange, includeCharts })}
              disabled={loading}
              className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// FILTER BAR
// ============================================

const FilterBar = ({ filters, onFilterChange, onApply }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onApply();
  };

  const handleReset = () => {
    const resetFilters = {
      project: 'all',
      status: 'all',
      priority: 'all',
      assignee: 'all',
      dateRange: 'monthly',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    onApply();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
        </div>

        <select
          value={localFilters.project}
          onChange={(e) => handleChange('project', e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Projects</option>
          <option value="project-1">Project Alpha</option>
          <option value="project-2">Project Beta</option>
        </select>

        <select
          value={localFilters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={localFilters.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <button
          onClick={handleApply}
          className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Apply Filters
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function Analytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('monthly');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [filters, setFilters] = useState({
    project: 'all',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    dateRange: 'monthly',
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // ============================================
  // FETCH ANALYTICS
  // ============================================

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Please login to view analytics");
        navigate("/login");
        return;
      }

      const userRole = localStorage.getItem("user_role");
      const isManager = userRole === "Manager";

      let url = `${API_BASE_URL}/api/analytics/`;
      if (isManager) {
        url = `${API_BASE_URL}/api/analytics/manager/`;
      }

      // Add query params for filtering
      const params = new URLSearchParams();
      if (filters.project !== 'all') params.append('project', filters.project);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.dateRange !== 'monthly') params.append('range', filters.dateRange);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast.error("You don't have permission to view analytics");
          navigate("/dashboard");
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);

    } catch (error) {
      console.error("❌ Failed to fetch analytics:", error);
      toast.error("Failed to load analytics data");
      setData(getFallbackData());
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, navigate, filters]);

  // ============================================
  // GET FALLBACK DATA
  // ============================================

  const getFallbackData = () => ({
    overview: {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      pendingTasks: 0,
      teamMembers: 0,
      completionRate: 0,
      avgTaskDuration: "0 days",
    },
    monthlyStats: [
      { month: "Jan", projects: 0, tasks: 0, completed: 0 },
      { month: "Feb", projects: 0, tasks: 0, completed: 0 },
      { month: "Mar", projects: 0, tasks: 0, completed: 0 },
      { month: "Apr", projects: 0, tasks: 0, completed: 0 },
      { month: "May", projects: 0, tasks: 0, completed: 0 },
      { month: "Jun", projects: 0, tasks: 0, completed: 0 },
    ],
    projectStatus: [
      { name: "Active", value: 0, color: "#3B82F6" },
      { name: "Completed", value: 0, color: "#10B981" },
      { name: "Archived", value: 0, color: "#6B7280" },
    ],
    taskDistribution: [
      { name: "Pending", value: 0, color: "#F59E0B" },
      { name: "In Progress", value: 0, color: "#3B82F6" },
      { name: "Completed", value: 0, color: "#10B981" },
    ],
    weeklyActivity: [
      { day: "Mon", tasks: 0, completed: 0 },
      { day: "Tue", tasks: 0, completed: 0 },
      { day: "Wed", tasks: 0, completed: 0 },
      { day: "Thu", tasks: 0, completed: 0 },
      { day: "Fri", tasks: 0, completed: 0 },
      { day: "Sat", tasks: 0, completed: 0 },
      { day: "Sun", tasks: 0, completed: 0 },
    ],
    performance: {
      efficiency: 0,
      productivity: 0,
      quality: 0,
      timeliness: 0,
    },
    recentActivity: [],
  });

  // ============================================
  // EXPORT REPORT
  // ============================================

  const handleExport = async (options) => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${API_BASE_URL}/api/analytics/export/`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...options,
          filters: filters,
          data: data,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report.${options.format === 'pdf' ? 'pdf' : options.format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Report exported successfully!`);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setExportLoading(false);
    }
  };

  // ============================================
  // REFRESH DATA
  // ============================================

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success("Analytics refreshed!");
  };

  // ============================================
  // APPLY FILTERS
  // ============================================

  const handleApplyFilters = () => {
    fetchAnalytics();
    toast.success("Filters applied!");
  };

  // ============================================
  // FORMAT TIME
  // ============================================

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================
  // INITIAL FETCH
  // ============================================

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const chartData = data || getFallbackData();

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Real-time project and task performance insights
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="quarterly">This Quarter</option>
                <option value="yearly">This Year</option>
              </select>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onApply={handleApplyFilters}
          />

          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Briefcase}
              title="Total Projects"
              value={chartData.overview?.totalProjects || 0}
              subtitle={`${chartData.overview?.activeProjects || 0} active`}
              trend="+12%"
              color="bg-blue-500"
              loading={loading}
            />
            <StatCard
              icon={CheckCircle}
              title="Completed Tasks"
              value={chartData.overview?.completedTasks || 0}
              subtitle={`${chartData.overview?.completionRate || 0}% completion rate`}
              trend="+18%"
              color="bg-emerald-500"
              loading={loading}
            />
            <StatCard
              icon={Users}
              title="Team Members"
              value={chartData.overview?.teamMembers || 0}
              subtitle="Active contributors"
              trend="+3"
              color="bg-purple-500"
              loading={loading}
            />
            <StatCard
              icon={TrendingUp}
              title="Completion Rate"
              value={`${chartData.overview?.completionRate || 0}%`}
              subtitle={`${chartData.overview?.avgTaskDuration || '0 days'} average duration`}
              trend="+5.2%"
              color="bg-orange-500"
              loading={loading}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Monthly Activity
                </h3>
              </div>
              <div className="h-80">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.monthlyStats || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="projects" name="Projects" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tasks" name="Tasks" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Project Status Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Project Status Distribution
              </h3>
              <div className="grid grid-cols-2 gap-4 h-80">
                <div className="flex items-center justify-center">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.projectStatus || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(chartData.projectStatus || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex flex-col justify-center space-y-3">
                  {(chartData.projectStatus || []).map((status) => (
                    <div key={status.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                        {status.name}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {status.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Weekly Activity
              </h3>
              <div className="h-64">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.weeklyActivity || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="tasks"
                        name="Tasks"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.1}
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        name="Completed"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Task Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Task Distribution
              </h3>
              <div className="h-64">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.taskDistribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(chartData.taskDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Performance Metrics & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <PerformanceRing
                  label="Efficiency"
                  value={chartData.performance?.efficiency || 0}
                  color="#3B82F6"
                  loading={loading}
                />
                <PerformanceRing
                  label="Productivity"
                  value={chartData.performance?.productivity || 0}
                  color="#10B981"
                  loading={loading}
                />
                <PerformanceRing
                  label="Quality"
                  value={chartData.performance?.quality || 0}
                  color="#8B5CF6"
                  loading={loading}
                />
                <PerformanceRing
                  label="Timeliness"
                  value={chartData.performance?.timeliness || 0}
                  color="#F59E0B"
                  loading={loading}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                Recent Activity
                <span className="text-xs text-gray-400 ml-2">({chartData.recentActivity?.length || 0} activities)</span>
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : chartData.recentActivity?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  chartData.recentActivity?.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      activity={{
                        ...activity,
                        time: formatTime(activity.timestamp),
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        data={data}
        loading={exportLoading}
      />
    </div>
  );
}