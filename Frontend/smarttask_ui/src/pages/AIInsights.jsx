// src/pages/AIInsights.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  SparklesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  FolderIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  StarIcon,
  AcademicCapIcon,
  ServerStackIcon,
  ArrowPathIcon,
  EyeIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  SparklesIcon as SparklesSolid,
} from "@heroicons/react/24/solid";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";

// ============================================
// ANIMATED COUNTER
// ============================================

const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  
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

  return <span>{count}</span>;
};

// ============================================
// KPI CARD
// ============================================

const KPICard = ({ title, value, icon: Icon, color, bgColor, subtitle, trend, trendValue }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 transition-all hover:shadow-md hover:border-gray-200/80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            <AnimatedCounter value={value} />
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      {trend && trendValue && (
        <div className="flex items-center space-x-1 mt-3">
          {trend === "up" ? (
            <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
          ) : trend === "down" ? (
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
          ) : null}
          <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-gray-400"}`}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================
// INSIGHT DETAIL MODAL
// ============================================

const InsightDetailModal = ({ insight, isOpen, onClose, type }) => {
  if (!isOpen || !insight) return null;

  const getTypeConfig = () => {
    switch(type) {
      case 'summary':
        return { 
          icon: DocumentTextIcon, 
          color: 'text-blue-600', 
          bg: 'bg-blue-50', 
          border: 'border-blue-200',
          label: 'Summary',
          emoji: '📋'
        };
      case 'prediction':
        return { 
          icon: ClockIcon, 
          color: 'text-amber-600', 
          bg: 'bg-amber-50', 
          border: 'border-amber-200',
          label: 'Prediction',
          emoji: '🔮'
        };
      case 'recommendation':
        return { 
          icon: LightBulbIcon, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-50', 
          border: 'border-emerald-200',
          label: 'Recommendation',
          emoji: '💡'
        };
      default:
        return { 
          icon: DocumentTextIcon, 
          color: 'text-gray-600', 
          bg: 'bg-gray-50', 
          border: 'border-gray-200',
          label: 'Insight',
          emoji: '📌'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${config.border}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${config.bg}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {config.emoji} {config.label} Details
              </h3>
              <p className="text-xs text-gray-500">AI-generated {config.label.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div>
            <h4 className="text-lg font-bold text-gray-900">{insight.title}</h4>
            <div className={`mt-3 p-4 rounded-xl ${config.bg} border ${config.border}`}>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {insight.body}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Type</p>
              <p className="font-medium text-gray-700 mt-1">{config.label}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Generated</p>
              <p className="font-medium text-gray-700 mt-1">
                {insight.generated_at ? new Date(insight.generated_at).toLocaleString() : 'Just now'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// AI FEATURE CARD (with Detail View)
// ============================================

const AIFeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  type, 
  color, 
  bgColor, 
  onClick, 
  isLoading, 
  emoji,
  isHighlighted,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTypeStyles = () => {
    switch(type) {
      case "summary":
        return {
          border: isHighlighted ? "border-blue-400" : "border-blue-200",
          badge: "bg-blue-100 text-blue-700",
          iconBg: "bg-blue-50",
        };
      case "prediction":
        return {
          border: isHighlighted ? "border-amber-400" : "border-amber-200",
          badge: "bg-amber-100 text-amber-700",
          iconBg: "bg-amber-50",
        };
      case "recommendation":
        return {
          border: isHighlighted ? "border-emerald-400" : "border-emerald-200",
          badge: "bg-emerald-100 text-emerald-700",
          iconBg: "bg-emerald-50",
        };
      default:
        return {
          border: "border-gray-200",
          badge: "bg-gray-100 text-gray-700",
          iconBg: "bg-gray-50",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border ${styles.border} transition-all duration-300 ${
        isHovered ? 'shadow-lg transform -translate-y-1' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${styles.iconBg} flex-shrink-0`}>
          {emoji ? (
            <span className="text-2xl">{emoji}</span>
          ) : (
            <Icon className={`w-6 h-6 ${color}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
              {type}
            </span>
          </div>
          {isLoading ? (
            <div className="mt-2 h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-3">
              {description}
            </p>
          )}
          {onClick && !isLoading && (
            <div className="mt-3 flex items-center space-x-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              <EyeIcon className="w-3.5 h-3.5" />
              <span>View details</span>
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// LOADING SKELETON
// ============================================

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 w-48 bg-gray-200 rounded"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
      ))}
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export default function AIInsights() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [kpiData, setKpiData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    tasksInProgress: 0,
    totalProjects: 0,
    activeProjects: 0,
    completionRate: 0,
  });

  // Detail modal state
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    insight: null,
    type: null,
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // ============================================
  // FETCH AI INSIGHTS
  // ============================================

  const fetchAIInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Please login to view AI insights");
        navigate("/login");
        setLoading(false);
        return;
      }

      const url = `${API_BASE_URL}/api/ai/insights/`;
      console.log("🔍 Fetching AI insights from:", url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);

      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        navigate("/login");
        setLoading(false);
        return;
      }

      if (response.status === 404) {
        console.error("❌ API endpoint not found.");
        setError("API endpoint not found. Please check server configuration.");
        toast.error("AI Insights endpoint not found.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        console.error("❌ Error response:", text.substring(0, 200));
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 AI Insights received:", data);
      
      // Handle both array and object responses
      let insightsData = [];
      if (Array.isArray(data)) {
        insightsData = data;
      } else if (data.insights && Array.isArray(data.insights)) {
        insightsData = data.insights;
      } else if (data.ai_insights) {
        // Structured response
        const structured = [];
        if (data.ai_insights.summary) {
          structured.push({
            id: 1,
            title: "AI Summary",
            body: data.ai_insights.summary,
            type: "summary",
            icon: "📊",
            generated_at: data.ai_insights.generated_at,
          });
        }
        if (data.ai_insights.risks) {
          structured.push({
            id: 2,
            title: "Risk Analysis",
            body: data.ai_insights.risks,
            type: "prediction",
            icon: "🔮",
            generated_at: data.ai_insights.generated_at,
          });
        }
        if (data.ai_insights.recommendations) {
          structured.push({
            id: 3,
            title: "Recommendations",
            body: data.ai_insights.recommendations,
            type: "recommendation",
            icon: "💡",
            generated_at: data.ai_insights.generated_at,
          });
        }
        insightsData = structured;
        
        // Update KPI data from metrics
        if (data.metrics) {
          setKpiData({
            totalTasks: data.metrics.total_tasks || 0,
            completedTasks: data.metrics.completed_tasks || 0,
            overdueTasks: data.metrics.overdue_tasks || 0,
            tasksInProgress: data.metrics.in_progress_tasks || 0,
            totalProjects: 0,
            activeProjects: data.metrics.active_projects || 0,
            completionRate: data.metrics.completion_rate || 0,
          });
        }
      }
      
      setInsights(insightsData);

      // Extract KPI data from insights if not already set
      if (insightsData.length > 0 && !kpiData.completionRate) {
        const kpiInsights = insightsData.reduce((acc, item) => {
          if (item.title === "Completion Rate" || item.title === "AI Summary") {
            const match = item.body.match(/([\d.]+)%/);
            if (match) acc.completionRate = parseFloat(match[1]);
          }
          if (item.title === "Overdue Tasks" || item.title === "Risk Analysis") {
            const match = item.body.match(/(\d+)/);
            if (match) acc.overdueTasks = parseInt(match[1]) || 0;
          }
          if (item.title === "Active Projects") {
            const match = item.body.match(/(\d+)/);
            if (match) acc.activeProjects = parseInt(match[1]) || 0;
          }
          return acc;
        }, {
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          tasksInProgress: 0,
          totalProjects: 0,
          activeProjects: 0,
          completionRate: 0,
        });

        setKpiData(prev => ({
          ...prev,
          ...kpiInsights,
        }));
      }
      
      if (insightsData.length > 0) {
        toast.success(`✨ ${insightsData.length} AI insights loaded`);
      }

    } catch (err) {
      console.error("❌ Failed to fetch AI insights:", err);
      
      if (err.message === "Failed to fetch" || err.message.includes("NetworkError")) {
        setError("Cannot connect to server. Make sure Django is running on port 8000.");
        toast.error("⚠️ Cannot connect to server. Is Django running?");
      } else {
        setError(err.message);
        toast.error(`Failed to load AI insights: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, navigate]);

  // ============================================
  // REFRESH DATA
  // ============================================

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchAIInsights();
    setIsRefreshing(false);
    toast.success("AI Insights refreshed!");
  };

  // ============================================
  // OPEN DETAIL MODAL
  // ============================================

  const openDetailModal = (insight, type) => {
    setDetailModal({
      isOpen: true,
      insight: {
        ...insight,
        generated_at: insight.generated_at || new Date().toISOString(),
      },
      type: type || insight.type || 'summary',
    });
  };

  const closeDetailModal = () => {
    setDetailModal({
      isOpen: false,
      insight: null,
      type: null,
    });
  };

  // ============================================
  // INITIAL FETCH
  // ============================================

  useEffect(() => {
    fetchAIInsights();
  }, [fetchAIInsights]);

  // ============================================
  // CATEGORIZE INSIGHTS
  // ============================================

  const summaries = insights.filter(item => 
    item.type === "summary" || 
    item.title === "AI Summary" || 
    item.title === "Completion Rate" || 
    item.title === "Trend Analysis"
  );

  const predictions = insights.filter(item => 
    item.type === "prediction" || 
    item.title === "Risk Prediction" || 
    item.title === "Risk Analysis" ||
    item.title === "Project Delay Risk"
  );

  const recommendations = insights.filter(item => 
    item.type === "recommendation" || 
    item.title === "Workload Balance" || 
    item.title === "Team Capacity" ||
    item.title === "Recommendations"
  );

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            <LoadingSkeleton />
          </main>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#333",
            padding: "16px",
            borderRadius: "12px",
          },
        }}
      />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <SparklesSolid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
                <p className="text-gray-500 text-sm">
                  Smart summaries and recommendations powered by OpenAI
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 disabled:opacity-50"
                title="Refresh AI Insights"
              >
                <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-xs text-gray-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>AI Active</span>
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start space-x-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Connection Error</h4>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <button
                  onClick={refreshData}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          {!error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Tasks Completed"
                value={kpiData.completedTasks || 0}
                icon={CheckCircleIcon}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
                subtitle={`${kpiData.completionRate || 0}% completion rate`}
                trend={kpiData.completionRate > 50 ? "up" : "down"}
                trendValue={`${kpiData.completionRate > 50 ? "+" : ""}${kpiData.completionRate}% overall`}
              />
              <KPICard
                title="Projects On Track"
                value={kpiData.activeProjects || 0}
                icon={FolderIcon}
                color="text-blue-600"
                bgColor="bg-blue-50"
                subtitle="Active projects"
                trend="up"
                trendValue="All active"
              />
              <KPICard
                title="Overdue Tasks"
                value={kpiData.overdueTasks || 0}
                icon={ExclamationTriangleIcon}
                color="text-red-600"
                bgColor="bg-red-50"
                subtitle="Needs immediate attention"
                trend={kpiData.overdueTasks > 0 ? "down" : "up"}
                trendValue={kpiData.overdueTasks > 0 ? `${kpiData.overdueTasks} tasks overdue` : "No overdue tasks"}
              />
              <KPICard
                title="Total Tasks"
                value={kpiData.totalTasks || 0}
                icon={ChartBarIcon}
                color="text-purple-600"
                bgColor="bg-purple-50"
                subtitle="All tasks tracked"
              />
            </div>
          )}

          {/* AI Features Section */}
          {!error && (
            <div className="space-y-8">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-gray-900">AI Powered Insights</h2>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  Powered by OpenAI
                </span>
              </div>

              {/* Summaries */}
              {summaries.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="text-md font-semibold text-gray-800">📋 Summaries</h3>
                    <span className="text-xs text-gray-400">Key metrics and achievements</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {summaries.map((insight, index) => (
                      <AIFeatureCard
                        key={`summary-${index}`}
                        icon={DocumentTextIcon}
                        title={insight.title}
                        description={insight.body}
                        type="summary"
                        color="text-blue-600"
                        emoji={insight.icon || "📋"}
                        isHighlighted={index === 0}
                        onClick={() => openDetailModal(insight, 'summary')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Predictions */}
              {predictions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-amber-500" />
                    <h3 className="text-md font-semibold text-gray-800">🔮 Predictions</h3>
                    <span className="text-xs text-gray-400">Project risk and timeline forecasts</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {predictions.map((insight, index) => (
                      <AIFeatureCard
                        key={`prediction-${index}`}
                        icon={ClockIcon}
                        title={insight.title}
                        description={insight.body}
                        type="prediction"
                        color="text-amber-600"
                        emoji={insight.icon || "🔮"}
                        isHighlighted={index === 0}
                        onClick={() => openDetailModal(insight, 'prediction')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <LightBulbIcon className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-md font-semibold text-gray-800">💡 Recommendations</h3>
                    <span className="text-xs text-gray-400">Actionable next steps</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {recommendations.map((insight, index) => (
                      <AIFeatureCard
                        key={`recommendation-${index}`}
                        icon={LightBulbIcon}
                        title={insight.title}
                        description={insight.body}
                        type="recommendation"
                        color="text-emerald-600"
                        emoji={insight.icon || "💡"}
                        isHighlighted={index === 0}
                        onClick={() => openDetailModal(insight, 'recommendation')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* No Insights Message */}
              {summaries.length === 0 && predictions.length === 0 && recommendations.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No AI Insights Available</h3>
                  <p className="text-gray-400 mt-1">
                    Connect to the server and ensure you have projects and tasks to generate insights.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Info */}
          <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-2xl p-6 border border-indigo-100/50">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-indigo-100">
                <AcademicCapIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">AI Learning</p>
                <p className="text-xs text-gray-500">
                  These insights are generated based on your project data using OpenAI. 
                  As you complete more tasks, the AI gets smarter.
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-xs text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                  Powered by OpenAI
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Insight Detail Modal */}
      <InsightDetailModal
        insight={detailModal.insight}
        isOpen={detailModal.isOpen}
        onClose={closeDetailModal}
        type={detailModal.type}
      />
    </div>
  );
}