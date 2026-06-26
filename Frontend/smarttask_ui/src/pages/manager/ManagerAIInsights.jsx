// src/pages/manager/ManagerAIInsights.jsx
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
  EyeIcon,
  ChevronRightIcon,
  FolderIcon,
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  XMarkIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  NoSymbolIcon,
  PlayIcon,
  PauseIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';

// ============================================
// CONSTANTS
// ============================================

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const INSIGHT_TYPES = {
  SUMMARY: 'summary',
  PREDICTION: 'prediction',
  RECOMMENDATION: 'recommendation',
};

const TYPE_CONFIG = {
  [INSIGHT_TYPES.SUMMARY]: {
    label: 'Summary',
    icon: DocumentTextIcon,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    emoji: '📋',
  },
  [INSIGHT_TYPES.PREDICTION]: {
    label: 'Prediction',
    icon: ClockIcon,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    emoji: '🔮',
  },
  [INSIGHT_TYPES.RECOMMENDATION]: {
    label: 'Recommendation',
    icon: LightBulbIcon,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    emoji: '💡',
  },
};

// ============================================
// API SERVICE
// ============================================

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Request failed');
    return data;
  },

  get: (url) => api.request(url),
  post: (url, body) => api.request(url, { method: 'POST', body: JSON.stringify(body) }),
};

// ============================================
// INSIGHT DETAIL MODAL
// ============================================

const InsightDetailModal = ({ insight, isOpen, onClose, type, onApply, projectId }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  if (!isOpen || !insight) return null;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG[INSIGHT_TYPES.SUMMARY];
  const Icon = config.icon;

  const isActionable = type === INSIGHT_TYPES.RECOMMENDATION || type === INSIGHT_TYPES.PREDICTION;

  // Parse actions from insight if available
  const actions = insight.actions || [];

  const handleApplyAction = async (action) => {
    setIsApplying(true);
    try {
      const payload = {
        action: action.action || 'reassign_task',
        task_id: action.task_id,
        new_user_id: action.to ? parseInt(action.to) : null,
        new_priority: action.priority || 'high',
        new_days: action.days || 3,
      };

      const result = await api.post(`/api/ai/projects/${projectId}/apply/`, payload);
      toast.success(result.message || '✅ Recommendation applied successfully!');
      
      // Refresh insights after applying
      await onApply?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to apply recommendation');
    } finally {
      setIsApplying(false);
    }
  };

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

          {/* Actions Section - Show specific actions from recommendation */}
          {actions.length > 0 && isActionable && (
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Suggested Actions</h5>
              <div className="space-y-3">
                {actions.map((action, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{action.action}</p>
                        {action.instruction && (
                          <p className="text-xs text-gray-500 mt-1">{action.instruction}</p>
                        )}
                        {action.from && action.to && (
                          <p className="text-xs text-gray-500 mt-1">
                            From: <span className="font-medium">{action.from}</span> → To: <span className="font-medium">{action.to}</span>
                          </p>
                        )}
                        {action.task_title && (
                          <p className="text-xs text-gray-500 mt-1">
                            Task: <span className="font-medium">{action.task_title}</span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleApplyAction(action)}
                        disabled={isApplying}
                        className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex-shrink-0"
                      >
                        {isApplying ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            {insight.confidence && (
              <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Confidence</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{insight.confidence}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Close
            </button>
            {isActionable && actions.length === 0 && (
              <button
                onClick={() => handleApplyAction({ action: 'apply_all' })}
                disabled={isApplying}
                className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isApplying ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Apply Recommendation
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// AI FEATURE CARD
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
  confidence,
  actions,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTypeStyles = () => {
    switch(type) {
      case INSIGHT_TYPES.SUMMARY:
        return {
          border: isHighlighted ? "border-blue-400" : "border-blue-200",
          badge: "bg-blue-100 text-blue-700",
          iconBg: "bg-blue-50",
          hoverBg: "hover:border-blue-300",
        };
      case INSIGHT_TYPES.PREDICTION:
        return {
          border: isHighlighted ? "border-amber-400" : "border-amber-200",
          badge: "bg-amber-100 text-amber-700",
          iconBg: "bg-amber-50",
          hoverBg: "hover:border-amber-300",
        };
      case INSIGHT_TYPES.RECOMMENDATION:
        return {
          border: isHighlighted ? "border-emerald-400" : "border-emerald-200",
          badge: "bg-emerald-100 text-emerald-700",
          iconBg: "bg-emerald-50",
          hoverBg: "hover:border-emerald-300",
        };
      default:
        return {
          border: "border-gray-200",
          badge: "bg-gray-100 text-gray-700",
          iconBg: "bg-gray-50",
          hoverBg: "hover:border-gray-300",
        };
    }
  };

  const styles = getTypeStyles();

  // Determine risk level for predictions
  const getRiskLevel = () => {
    if (type !== INSIGHT_TYPES.PREDICTION) return null;
    const lower = description.toLowerCase();
    if (lower.includes('high risk') || lower.includes('critical') || lower.includes('urgent')) {
      return { label: 'High Risk', color: 'text-rose-600 bg-rose-50' };
    }
    if (lower.includes('moderate') || lower.includes('some risk')) {
      return { label: 'Moderate Risk', color: 'text-amber-600 bg-amber-50' };
    }
    if (lower.includes('low risk') || lower.includes('on track')) {
      return { label: 'Low Risk', color: 'text-emerald-600 bg-emerald-50' };
    }
    return null;
  };

  const riskLevel = getRiskLevel();
  const actionCount = actions?.length || 0;

  return (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm border ${styles.border} ${styles.hoverBg} transition-all duration-300 ${
        isHovered ? 'shadow-md transform -translate-y-0.5' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl ${styles.iconBg} flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
              {type}
            </span>
            {confidence && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {confidence}% confidence
              </span>
            )}
            {riskLevel && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${riskLevel.color}`}>
                {riskLevel.label}
              </span>
            )}
            {actionCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {actionCount} action{actionCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {isLoading ? (
            <div className="mt-2 space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed line-clamp-3">
              {description}
            </p>
          )}
          {onClick && !isLoading && (
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
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
// PROJECT SELECTION CARD
// ============================================

const ProjectCard = ({ project, isSelected, onClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      archived: 'bg-gray-100 text-gray-700 border-gray-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-50 shadow-md' 
          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {getInitials(project.name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{project.name}</p>
            {project.description && (
              <p className="text-xs text-gray-500 truncate">{project.description}</p>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${getStatusColor(project.status)}`}>
          {project.status || 'Active'}
        </span>
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
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
      ))}
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const ManagerAIInsights = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  
  // Detail modal
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    insight: null,
    type: null,
  });

  // ============================================
  // FETCH PROJECTS
  // ============================================

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/projects/');
      const allProjects = data.results || data || [];
      
      const managerProjects = allProjects.filter(p => {
        const managerId = p.manager?.id || p.manager;
        return managerId === user?.id;
      });
      
      setProjects(managerProjects);
      
      if (managerProjects.length > 0) {
        setSelectedProject(managerProjects[0]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ============================================
  // FETCH AI INSIGHTS
  // ============================================

  const fetchAIInsights = useCallback(async (projectId) => {
    if (!projectId) return;
    
    setInsightsLoading(true);
    setError(null);
    try {
      const data = await api.get(`/api/ai/projects/${projectId}/insights/`);
      setInsights(data);
    } catch (error) {
      console.error('❌ Failed to fetch AI insights:', error);
      setError(error.message);
      toast.error('Failed to load AI insights');
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  // ============================================
  // FETCH ALERTS
  // ============================================

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await api.get('/api/ai/alerts/');
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('❌ Failed to fetch alerts:', error);
    }
  }, []);

  // ============================================
  // REFRESH ALL DATA
  // ============================================

  const refreshAll = useCallback(async () => {
    if (selectedProject) {
      await Promise.all([
        fetchAIInsights(selectedProject.id),
        fetchAlerts(),
      ]);
      toast.success('All insights refreshed ✨');
    }
  }, [selectedProject, fetchAIInsights, fetchAlerts]);

  // ============================================
  // OPEN DETAIL MODAL
  // ============================================

  const openDetailModal = (insight, type) => {
    setDetailModal({
      isOpen: true,
      insight: {
        ...insight,
        generated_at: insights?.ai_insights?.generated_at || new Date().toISOString(),
        confidence: insight.confidence || 85,
        actions: insight.actions || [],
      },
      type: type,
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
  // BUILD INSIGHTS LIST FROM API DATA
  // ============================================

  const insightsList = useMemo(() => {
    if (!insights?.ai_insights) return [];

    const list = [];

    // Summary insights from backend
    if (insights.ai_insights.summary) {
      list.push({
        id: 1,
        title: 'Project Summary',
        body: insights.ai_insights.summary,
        type: INSIGHT_TYPES.SUMMARY,
        icon: DocumentTextIcon,
        color: 'text-blue-600',
        confidence: 92,
        actions: [],
      });
    }

    // Risk insights from backend
    if (insights.ai_insights.risks) {
      const risksArray = Array.isArray(insights.ai_insights.risks) 
        ? insights.ai_insights.risks 
        : [insights.ai_insights.risks];
      
      // Combine risks into one card
      const riskBody = risksArray.map(r => 
        typeof r === 'string' ? r : r.message || JSON.stringify(r)
      ).join('\n\n');
      
      list.push({
        id: 2,
        title: 'Risk Analysis',
        body: riskBody || 'No specific risks identified.',
        type: INSIGHT_TYPES.PREDICTION,
        icon: ExclamationTriangleIcon,
        color: 'text-amber-600',
        confidence: 78,
        actions: [],
      });
    }

    // Recommendations from backend
    if (insights.recommendations && insights.recommendations.length > 0) {
      const recs = insights.recommendations;
      
      // Create recommendation cards from each recommendation
      recs.forEach((rec, index) => {
        const actions = rec.actions || [];
        const actionDescriptions = actions.map(a => 
          `${a.action}: ${a.instruction || ''}`
        ).join('\n');
        
        list.push({
          id: 3 + index,
          title: rec.title || 'Recommendation',
          body: rec.description || rec.body || 'Actionable recommendation',
          type: INSIGHT_TYPES.RECOMMENDATION,
          icon: LightBulbIcon,
          color: 'text-emerald-600',
          confidence: 85,
          actions: actions,
          action: rec.action || 'reassign_task',
          task_id: rec.task_id || null,
          suggested_assignee_id: actions[0]?.to || null,
          suggested_priority: actions[0]?.priority || 'high',
        });
      });
    }

    // If no recommendations from backend, use fallback
    if (list.length === 0 && insights.ai_insights.recommendations) {
      list.push({
        id: 3,
        title: 'Recommendations',
        body: insights.ai_insights.recommendations,
        type: INSIGHT_TYPES.RECOMMENDATION,
        icon: LightBulbIcon,
        color: 'text-emerald-600',
        confidence: 85,
        actions: [],
      });
    }

    return list;
  }, [insights]);

  // ============================================
  // INITIAL FETCH
  // ============================================

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProject) {
      fetchAIInsights(selectedProject.id);
      fetchAlerts();
    }
  }, [selectedProject, fetchAIInsights, fetchAlerts]);

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <SparklesSolid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Insights</h1>
                <p className="text-sm text-gray-500">
                  Smart analysis powered by AI • {projects.length} projects
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshAll}
                disabled={insightsLoading}
                className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-50"
                title="Refresh insights"
              >
                <ArrowPathIcon className={`w-5 h-5 ${insightsLoading ? 'animate-spin' : ''}`} />
              </button>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className={`w-1.5 h-1.5 rounded-full ${insightsLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                {insightsLoading ? 'Analyzing...' : 'AI Active'}
              </span>
            </div>
          </div>

          {/* Alerts Banner */}
          {alerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">AI Alerts</p>
                  <div className="mt-1 space-y-1">
                    {alerts.slice(0, 3).map((alert, index) => (
                      <p key={index} className="text-sm text-amber-700">
                        {alert.message}
                      </p>
                    ))}
                    {alerts.length > 3 && (
                      <p className="text-xs text-amber-600">+{alerts.length - 3} more alerts</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/manager/notifications')}
                  className="text-sm text-amber-700 hover:text-amber-900 font-medium flex-shrink-0"
                >
                  View all →
                </button>
              </div>
            </div>
          )}

          {/* Project Selection */}
          {projects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderIcon className="w-5 h-5 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-700">Select Project</h2>
                  <span className="text-xs text-gray-400">({projects.length} projects)</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProject?.id === project.id}
                    onClick={() => setSelectedProject(project)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Project Metrics */}
          {insights && !insightsLoading && (
            <div className="bg-white rounded-xl border border-gray-200/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-700">Project Overview</h3>
                  <span className="text-xs text-gray-400">• {insights.project?.name}</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  insights.project?.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {insights.project?.status || 'Active'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{insights.metrics?.total_tasks || 0}</p>
                  <p className="text-xs text-gray-500">Total Tasks</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="text-lg font-bold text-emerald-600">{insights.metrics?.completed_tasks || 0}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-lg font-bold text-amber-600">{insights.metrics?.in_progress_tasks || 0}</p>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${insights.metrics?.overdue_tasks > 0 ? 'bg-rose-50' : 'bg-gray-50'}`}>
                  <p className={`text-lg font-bold ${insights.metrics?.overdue_tasks > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                    {insights.metrics?.overdue_tasks || 0}
                  </p>
                  <p className="text-xs text-gray-500">Overdue</p>
                </div>
              </div>
              {insights.metrics?.completion_rate !== undefined && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Completion Rate</span>
                    <span className="font-semibold text-gray-900">{insights.metrics.completion_rate}%</span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        insights.metrics.completion_rate > 70 ? 'bg-emerald-500' :
                        insights.metrics.completion_rate > 40 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(insights.metrics.completion_rate, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Insights Section */}
          {insightsLoading ? (
            <div className="bg-white rounded-xl border border-gray-200/60 p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-3 text-gray-500 text-sm">Generating AI insights...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-rose-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-rose-800">Unable to load insights</h3>
              <p className="text-sm text-rose-600 mt-1">{error}</p>
              <button
                onClick={refreshAll}
                className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          ) : insights ? (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-base font-semibold text-gray-800">AI-Powered Insights</h2>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {insights.ai_insights?.generated_at 
                    ? `Updated ${new Date(insights.ai_insights.generated_at).toLocaleTimeString()}`
                    : 'Real-time'
                  }
                </span>
              </div>

              {/* Render insights by type */}
              {insightsList.map((insight, index) => (
                <AIFeatureCard
                  key={insight.id}
                  icon={insight.icon}
                  title={insight.title}
                  description={insight.body}
                  type={insight.type}
                  color={insight.color}
                  isHighlighted={index === 0}
                  confidence={insight.confidence}
                  actions={insight.actions}
                  onClick={() => openDetailModal(insight, insight.type)}
                />
              ))}

              {/* Team Workload Section */}
              {insights.workload && insights.workload.team_members?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200/60 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <UsersIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-700">Team Workload</h3>
                    {insights.workload.team_health && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        insights.workload.team_health === 'good' ? 'bg-emerald-100 text-emerald-700' :
                        insights.workload.team_health === 'fair' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {insights.workload.team_health === 'good' ? '✅ Healthy' :
                         insights.workload.team_health === 'fair' ? '⚠️ Fair' : '🔴 Needs Attention'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {insights.workload.team_members.map((member) => (
                      <div key={member.user_id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{member.username}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                member.task_count > 5 ? 'bg-rose-500' :
                                member.task_count > 3 ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min((member.task_count / 5) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-8 text-right">
                            {member.task_count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {insights.workload.overloaded_members?.length > 0 && (
                    <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-700">
                        ⚠️ {insights.workload.overloaded_members.map(m => m.username).join(', ')} 
                        {' '}are overloaded ({insights.workload.overloaded_members[0]?.task_count || 0} tasks)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200/60 p-12 text-center">
              <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No AI Insights Available</h3>
              <p className="text-sm text-gray-400 mt-1">
                Select a project to view AI-powered insights and recommendations.
              </p>
            </div>
          )}

          {/* Bottom Info */}
          <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl p-5 border border-indigo-100/50">
            <div className="flex flex-wrap items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-100">
                <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-medium text-gray-800">AI Learning</p>
                <p className="text-xs text-gray-500">
                  Insights are generated using AI based on your project data. 
                  The AI analyzes task status, team workload, and deadlines to provide actionable recommendations.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                  Powered by AI
                </span>
                <span className="text-xs text-gray-400">
                  v2.0
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
        onApply={refreshAll}
        projectId={selectedProject?.id}
      />
    </div>
  );
};

export default ManagerAIInsights;