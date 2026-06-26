// src/pages/member/MemberAIInsights.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  UserCircleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  XMarkIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';

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
          color: 'text-blue-600 dark:text-blue-400', 
          bg: 'bg-blue-50 dark:bg-blue-900/20', 
          border: 'border-blue-200 dark:border-blue-800',
          label: 'Summary',
          emoji: '📋'
        };
      case 'prediction':
        return { 
          icon: ClockIcon, 
          color: 'text-amber-600 dark:text-amber-400', 
          bg: 'bg-amber-50 dark:bg-amber-900/20', 
          border: 'border-amber-200 dark:border-amber-800',
          label: 'Prediction',
          emoji: '🔮'
        };
      case 'recommendation':
        return { 
          icon: LightBulbIcon, 
          color: 'text-emerald-600 dark:text-emerald-400', 
          bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
          border: 'border-emerald-200 dark:border-emerald-800',
          label: 'Recommendation',
          emoji: '💡'
        };
      default:
        return { 
          icon: DocumentTextIcon, 
          color: 'text-gray-600 dark:text-gray-400', 
          bg: 'bg-gray-50 dark:bg-gray-800', 
          border: 'border-gray-200 dark:border-gray-700',
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${config.border}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${config.bg}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {config.emoji} {config.label} Details
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI-generated {config.label.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">{insight.title}</h4>
            <div className={`mt-3 p-4 rounded-xl ${config.bg} border ${config.border}`}>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {insight.body}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Type</p>
              <p className="font-medium text-gray-700 dark:text-gray-300 mt-1">{config.label}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Generated</p>
              <p className="font-medium text-gray-700 dark:text-gray-300 mt-1">
                {insight.generated_at ? new Date(insight.generated_at).toLocaleString() : 'Just now'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
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
  onClick, 
  isLoading,
  isHighlighted,
  emoji,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTypeStyles = () => {
    switch(type) {
      case "summary":
        return {
          border: isHighlighted ? "border-blue-400 dark:border-blue-500" : "border-blue-200 dark:border-blue-800",
          badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
          iconBg: "bg-blue-50 dark:bg-blue-900/20",
        };
      case "prediction":
        return {
          border: isHighlighted ? "border-amber-400 dark:border-amber-500" : "border-amber-200 dark:border-amber-800",
          badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
          iconBg: "bg-amber-50 dark:bg-amber-900/20",
        };
      case "recommendation":
        return {
          border: isHighlighted ? "border-emerald-400 dark:border-emerald-500" : "border-emerald-200 dark:border-emerald-800",
          badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
          iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
        };
      default:
        return {
          border: "border-gray-200 dark:border-gray-700",
          badge: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
          iconBg: "bg-gray-50 dark:bg-gray-700/50",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${styles.border} transition-all duration-300 ${
        isHovered ? 'shadow-lg transform -translate-y-1 dark:shadow-gray-800' : ''
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
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
              {type}
            </span>
          </div>
          {isLoading ? (
            <div className="mt-2 h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed line-clamp-3">
              {description}
            </p>
          )}
          {onClick && !isLoading && (
            <div className="mt-3 flex items-center space-x-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
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
// PERSONAL STAT CARD
// ============================================

const PersonalStatCard = ({ title, value, icon: Icon, color, bgColor, subtitle, trend }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md dark:hover:shadow-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center space-x-1 mt-3">
          {trend === "up" ? (
            <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {trend === "up" ? "+" : ""}12% this week
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================
// PRIORITY TASK COMPONENT
// ============================================

const PriorityTask = ({ task, onComplete }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      medium: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      low: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    };
    return colors[priority] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  };

  const isOverdue = () => {
    if (task.status === "completed") return false;
    return task.due_date && new Date(task.due_date) < new Date();
  };

  const overdue = isOverdue();

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${
      overdue ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
    } transition-all`}>
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-2 h-2 rounded-full ${
          task.priority === 'high' ? 'bg-red-500' :
          task.priority === 'medium' ? 'bg-amber-500' :
          'bg-gray-400 dark:bg-gray-500'
        }`}></div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {overdue && (
              <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">⚠️ Overdue</span>
            )}
            {task.due_date && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      {task.status !== 'completed' && (
        <button
          onClick={() => onComplete(task.id)}
          className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex-shrink-0"
        >
          Complete
        </button>
      )}
      {task.status === 'completed' && (
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex-shrink-0">✅ Done</span>
      )}
    </div>
  );
};

// ============================================
// LOADING SKELETON
// ============================================

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      ))}
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export default function MemberAIInsights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });
  const [priorityTasks, setPriorityTasks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [productivityScore, setProductivityScore] = useState(0);

  // Detail modal state
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    insight: null,
    type: null,
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // ============================================
  // OPEN DETAIL MODAL
  // ============================================

  const openDetailModal = (insight, type) => {
    setDetailModal({
      isOpen: true,
      insight: {
        ...insight,
        generated_at: new Date().toISOString(),
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
  // FETCH AI INSIGHTS
  // ============================================

  const fetchAIInsights = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');

      // Fetch tasks assigned to member
      const response = await fetch(`${API_BASE_URL}/api/tasks/?assigned_to=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const tasks = data.results || data || [];

        // Calculate stats
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        const overdue = tasks.filter(t => {
          if (t.status === 'completed') return false;
          return t.due_date && new Date(t.due_date) < new Date();
        }).length;

        setTaskStats({ total, completed, inProgress, pending, overdue });

        // Get priority tasks (high priority + overdue)
        const highPriority = tasks.filter(t => 
          t.priority === 'high' && t.status !== 'completed'
        );
        const overdueTasks = tasks.filter(t => {
          if (t.status === 'completed') return false;
          return t.due_date && new Date(t.due_date) < new Date();
        });
        
        // Combine and deduplicate
        const priorityMap = new Map();
        [...highPriority, ...overdueTasks].forEach(task => {
          if (!priorityMap.has(task.id)) {
            priorityMap.set(task.id, task);
          }
        });
        setPriorityTasks(Array.from(priorityMap.values()).slice(0, 5));

        // Calculate productivity score
        const completionRate = total > 0 ? (completed / total) * 100 : 0;
        const onTimeRate = total > 0 ? ((total - overdue) / total) * 100 : 0;
        const score = Math.round((completionRate * 0.6) + (onTimeRate * 0.4));
        setProductivityScore(Math.min(100, score));

        // Generate AI recommendations
        const recs = generateRecommendations(tasks, overdue, pending, total, completed);
        setRecommendations(recs);
      }

      // Generate AI insights summary
      generateAIInsights();

    } catch (error) {
      console.error('❌ Failed to fetch AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // ============================================
  // GENERATE RECOMMENDATIONS
  // ============================================

  const generateRecommendations = (tasks, overdue, pending, total, completed) => {
    const recs = [];
    const now = new Date();

    // Overdue tasks
    if (overdue > 0) {
      recs.push({
        id: 1,
        title: '⚠️ Overdue Tasks',
        message: `You have ${overdue} overdue task${overdue > 1 ? 's' : ''}. Prioritize these immediately to avoid further delays.`,
        type: 'warning',
        priority: 'high',
        confidence: 95,
      });
    }

    // Upcoming deadlines
    const upcoming = tasks.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.due_date) return false;
      const diff = new Date(t.due_date) - now;
      return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
    });

    if (upcoming.length > 0) {
      recs.push({
        id: 2,
        title: '📅 Upcoming Deadlines',
        message: `${upcoming.length} task${upcoming.length > 1 ? 's are' : ' is'} due within 3 days. Focus on completing these first.`,
        type: 'info',
        priority: 'medium',
        confidence: 88,
      });
    }

    // High priority pending
    const highPriorityPending = tasks.filter(t => 
      t.priority === 'high' && t.status === 'pending'
    );

    if (highPriorityPending.length > 0) {
      recs.push({
        id: 3,
        title: '🔴 High Priority Tasks',
        message: `You have ${highPriorityPending.length} high priority task${highPriorityPending.length > 1 ? 's' : ''} pending. Start with these first.`,
        type: 'warning',
        priority: 'high',
        confidence: 92,
      });
    }

    // Productivity boost
    if (total > 0 && completed / total > 0.7) {
      recs.push({
        id: 4,
        title: '📈 Great Progress!',
        message: `You've completed ${Math.round((completed/total)*100)}% of your tasks. Keep up the momentum!`,
        type: 'success',
        priority: 'low',
        confidence: 98,
      });
    }

    // If everything is done
    if (total > 0 && tasks.every(t => t.status === 'completed')) {
      recs.push({
        id: 5,
        title: '🎉 All Done!',
        message: 'Amazing work! All your tasks are completed. Take a moment to celebrate!',
        type: 'success',
        priority: 'low',
        confidence: 99,
      });
    }

    // If many pending tasks
    if (pending > 5) {
      recs.push({
        id: 6,
        title: '📋 Task Backlog',
        message: `You have ${pending} pending tasks. Consider breaking them into smaller chunks or delegating some tasks.`,
        type: 'info',
        priority: 'medium',
        confidence: 85,
      });
    }

    // Work-life balance
    if (total > 10 && completed / total < 0.3) {
      recs.push({
        id: 7,
        title: '⚡ Workload Management',
        message: 'You have a large number of tasks. Consider reviewing priorities and focusing on the most important ones.',
        type: 'info',
        priority: 'medium',
        confidence: 80,
      });
    }

    return recs.slice(0, 6);
  };

  // ============================================
  // GENERATE AI INSIGHTS
  // ============================================

  const generateAIInsights = useCallback(() => {
    const recs = recommendations;
    
    setInsights({
      summary: [
        {
          id: 1,
          title: "Workload Analysis",
          body: `Based on your current task load, you have ${taskStats.total} tasks with ${taskStats.overdue} overdue. ${taskStats.overdue > 0 ? 'Prioritize overdue tasks first.' : 'Great job keeping up with your tasks!'}`,
          type: "summary",
          icon: "📊",
          confidence: 94,
        },
        {
          id: 2,
          title: "Productivity Score",
          body: `Your productivity score is ${productivityScore}%. ${productivityScore > 70 ? "🌟 Excellent! You're on track." : productivityScore > 40 ? "📈 You're making progress. Keep going!" : "🎯 Focus on completing high-priority tasks to improve."}`,
          type: "summary",
          icon: "📈",
          confidence: 96,
        },
        {
          id: 3,
          title: "Task Completion Trend",
          body: `${taskStats.completed} tasks completed, ${taskStats.inProgress} in progress, ${taskStats.pending} pending. ${taskStats.overdue > 0 ? `⚠️ ${taskStats.overdue} overdue needs attention.` : '✅ All tasks on track.'}`,
          type: "summary",
          icon: "📊",
          confidence: 92,
        },
      ],
      predictions: [
        {
          id: 4,
          title: "Task Completion Forecast",
          body: `At your current pace, you will complete approximately ${Math.round(taskStats.total * 0.4)} tasks this week. ${taskStats.overdue > 0 ? 'Address overdue tasks to improve velocity.' : 'Keep up the good work!'}`,
          type: "prediction",
          icon: "🔮",
          confidence: 78,
        },
        {
          id: 5,
          title: "Deadline Risk Assessment",
          body: `${taskStats.overdue > 0 ? `⚠️ You have ${taskStats.overdue} overdue tasks. ` : ''}${taskStats.pending > 5 ? `📋 You have ${taskStats.pending} pending tasks. Consider reviewing your schedule.` : '✅ Your workload appears manageable.'}`,
          type: "prediction",
          icon: "⏰",
          confidence: 82,
        },
        {
          id: 6,
          title: "Projected Performance",
          body: `Based on your completion rate of ${taskStats.total > 0 ? Math.round((taskStats.completed/taskStats.total)*100) : 0}%, ${taskStats.completed > 0 ? 'you are on track to meet your goals.' : 'start completing tasks to build momentum.'}`,
          type: "prediction",
          icon: "📈",
          confidence: 75,
        },
      ],
      recommendations: recs.map((rec, index) => ({
        id: 10 + index,
        title: rec.title,
        body: rec.message,
        type: "recommendation",
        icon: rec.type === 'warning' ? '⚠️' : rec.type === 'success' ? '✅' : '💡',
        priority: rec.priority,
        confidence: rec.confidence || 85,
      })),
    });
  }, [recommendations, taskStats, productivityScore]);

  // ============================================
  // COMPLETE TASK
  // ============================================

  const handleCompleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.ok) {
        toast.success('✅ Task completed!');
        fetchAIInsights();
      } else {
        toast.error('Failed to complete task');
      }
    } catch (error) {
      console.error('❌ Failed to complete task:', error);
      toast.error('Failed to complete task');
    }
  };

  // ============================================
  // REFRESH INSIGHTS
  // ============================================

  const refreshInsights = async () => {
    await fetchAIInsights();
    toast.success('AI Insights refreshed! ✨');
  };

  // ============================================
  // GET CATEGORIZED INSIGHTS
  // ============================================

  const summaries = useMemo(() => insights?.summary || [], [insights]);
  const predictions = useMemo(() => insights?.predictions || [], [insights]);
  const recommendationsList = useMemo(() => insights?.recommendations || [], [insights]);

  // ============================================
  // INITIAL FETCH
  // ============================================

  useEffect(() => {
    fetchAIInsights();
  }, [fetchAIInsights]);

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My AI Insights</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Personalized recommendations for your workload
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshInsights}
                disabled={loading}
                className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all duration-200 disabled:opacity-50"
                title="Refresh AI Insights"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>AI Active</span>
              </span>
            </div>
          </div>

          {/* Personal Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PersonalStatCard
              title="Productivity Score"
              value={`${productivityScore}%`}
              icon={ChartBarIcon}
              color="text-blue-600 dark:text-blue-400"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
              subtitle={productivityScore > 70 ? "🌟 Great job!" : "📈 Keep going!"}
              trend={productivityScore > 50 ? "up" : "down"}
            />
            <PersonalStatCard
              title="Tasks Completed"
              value={taskStats.completed}
              icon={CheckCircleIcon}
              color="text-emerald-600 dark:text-emerald-400"
              bgColor="bg-emerald-50 dark:bg-emerald-900/20"
              subtitle={`${taskStats.total} total tasks`}
              trend={taskStats.completed > 0 ? "up" : "down"}
            />
            <PersonalStatCard
              title="In Progress"
              value={taskStats.inProgress}
              icon={ClockIcon}
              color="text-amber-600 dark:text-amber-400"
              bgColor="bg-amber-50 dark:bg-amber-900/20"
              subtitle="Active tasks"
            />
            <PersonalStatCard
              title="Overdue"
              value={taskStats.overdue}
              icon={ExclamationTriangleIcon}
              color="text-red-600 dark:text-red-400"
              bgColor="bg-red-50 dark:bg-red-900/20"
              subtitle={taskStats.overdue > 0 ? "⚠️ Needs attention" : "✅ All on track"}
              trend={taskStats.overdue > 0 ? "down" : "up"}
            />
          </div>

          {/* Priority Tasks */}
          {priorityTasks.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Priority Tasks</h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {priorityTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/my-tasks')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  View all →
                </button>
              </div>
              <div className="space-y-2">
                {priorityTasks.map((task) => (
                  <PriorityTask
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* AI Insights Section */}
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Powered Insights</h2>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                Powered by AI
              </span>
            </div>

            {/* Summaries */}
            {summaries.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">📋 Summaries</h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Your performance overview</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {summaries.map((insight, index) => (
                    <AIFeatureCard
                      key={`summary-${index}`}
                      icon={DocumentTextIcon}
                      title={insight.title}
                      description={insight.body}
                      type="summary"
                      color="text-blue-600 dark:text-blue-400"
                      isHighlighted={index === 0}
                      emoji={insight.icon || "📋"}
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
                  <ClockIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">🔮 Predictions</h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500">What to expect</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {predictions.map((insight, index) => (
                    <AIFeatureCard
                      key={`prediction-${index}`}
                      icon={ClockIcon}
                      title={insight.title}
                      description={insight.body}
                      type="prediction"
                      color="text-amber-600 dark:text-amber-400"
                      isHighlighted={index === 0}
                      emoji={insight.icon || "🔮"}
                      onClick={() => openDetailModal(insight, 'prediction')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendationsList.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <LightBulbIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">💡 Recommendations</h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Actionable next steps</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {recommendationsList.map((insight, index) => {
                    const priorityColor = insight.priority === 'high' ? 'text-red-600 dark:text-red-400' : 
                                         insight.priority === 'medium' ? 'text-amber-600 dark:text-amber-400' : 
                                         'text-emerald-600 dark:text-emerald-400';
                    return (
                      <AIFeatureCard
                        key={`recommendation-${index}`}
                        icon={LightBulbIcon}
                        title={insight.title}
                        description={insight.body}
                        type="recommendation"
                        color={priorityColor}
                        isHighlighted={index === 0}
                        emoji={insight.icon || "💡"}
                        onClick={() => openDetailModal(insight, 'recommendation')}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Insights Message */}
            {summaries.length === 0 && predictions.length === 0 && recommendationsList.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                <SparklesIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No AI Insights Available</h3>
                <p className="text-gray-400 dark:text-gray-500 mt-1">
                  Complete some tasks to generate personalized insights.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Info */}
          <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100/50 dark:border-indigo-800/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <AcademicCapIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">AI Learning</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  These insights are personalized based on your task data. 
                  As you complete more tasks, the AI gets smarter.
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                  Powered by AI
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <InsightDetailModal
        insight={detailModal.insight}
        isOpen={detailModal.isOpen}
        onClose={closeDetailModal}
        type={detailModal.type}
      />
    </div>
  );
}