// src/pages/Projects.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  SparklesIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  RefreshCwIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import useProjects from "../hooks/useProjects";
import api from "../services/api";

// ✅ Animated Counter Component
const AnimatedCounter = ({ value, duration = 1000 }) => {
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

  return <span>{count}</span>;
};

// ✅ Project Card Component
const ProjectCard = ({ project, onEdit, onDelete, onView, onAIGuidance }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-emerald-100 text-emerald-700 border-emerald-200",
      completed: "bg-blue-100 text-blue-700 border-blue-200",
      archived: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <ClockIcon className="w-3 h-3" />,
      completed: <CheckCircleIcon className="w-3 h-3" />,
      archived: <ArchiveBoxIcon className="w-3 h-3" />,
    };
    return icons[status] || null;
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 ${
        isHovered ? 'shadow-lg transform -translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {getInitials(project.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {project.description || "No description"}
                </p>
              </div>
            </div>
          </div>
          <span className={`ml-3 text-xs font-medium px-2.5 py-1 rounded-full border flex items-center space-x-1 ${getStatusColor(project.status)}`}>
            {getStatusIcon(project.status)}
            <span className="capitalize">{project.status}</span>
          </span>
        </div>

        {/* Details */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Start Date</p>
            <p className="font-medium text-gray-700">
              {project.start_date ? new Date(project.start_date).toLocaleDateString() : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">End Date</p>
            <p className="font-medium text-gray-700">
              {project.end_date ? new Date(project.end_date).toLocaleDateString() : "Not set"}
            </p>
          </div>
        </div>

        {/* Manager */}
        <div className="mt-3 flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            {project.manager?.username ? getInitials(project.manager.username) : "?"}
          </div>
          <span className="text-sm text-gray-600">
            Manager: {project.manager?.username || project.manager || "Unassigned"}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end space-x-1">
          <button
            onClick={() => onAIGuidance(project)}
            className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Get AI Guidance"
          >
            <SparklesIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onView(project)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(project)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Project"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Project"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ KPI Card Component
const KPIProjectCard = ({ title, value, icon: Icon, color, bgColor, count }) => {
  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            <AnimatedCounter value={count} />
          </p>
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: bgColor }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
};

// ✅ Project Trend Chart Component
const ProjectTrendChart = ({ projectId }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `http://localhost:8000/api/ai/projects/${projectId}/charts/`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!response.ok) throw new Error("Failed to fetch chart data");
        
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("❌ Failed to load chart:", error);
        toast.error("Failed to load chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="h-48 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-400">Loading chart...</span>
      </div>
    );
  }

  if (!chartData || !chartData.chart_data || chartData.chart_data.length === 0) {
    return (
      <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center">
        <span className="text-gray-400">No data available</span>
      </div>
    );
  }

  const maxValue = Math.max(
    ...chartData.chart_data.map(d => Math.max(d.completed || 0, d.created || 0, d.overdue || 0))
  ) || 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700">📊 Project Trends</h4>
        <div className="flex items-center space-x-4 text-xs">
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            <span className="text-gray-500">Completed</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="text-gray-500">Created</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="text-gray-500">Overdue</span>
          </span>
        </div>
      </div>

      <div className="relative h-48">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between h-full pt-6">
          {chartData.chart_data.slice(-14).map((day, index) => {
            const heightCompleted = ((day.completed || 0) / maxValue) * 100;
            const heightCreated = ((day.created || 0) / maxValue) * 100;
            const heightOverdue = ((day.overdue || 0) / maxValue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                <div className="relative w-full flex justify-center space-x-0.5 h-32">
                  <div 
                    className="w-3 bg-emerald-500 rounded-t transition-all duration-500"
                    style={{ height: `${Math.max(heightCompleted || 2, 2)}%` }}
                  ></div>
                  <div 
                    className="w-3 bg-blue-500 rounded-t transition-all duration-500"
                    style={{ height: `${Math.max(heightCreated || 2, 2)}%` }}
                  ></div>
                  <div 
                    className="w-3 bg-red-500 rounded-t transition-all duration-500"
                    style={{ height: `${Math.max(heightOverdue || 2, 2)}%` }}
                  ></div>
                </div>
                <span className="text-[8px] text-gray-400 transform -rotate-45 origin-top-left">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs">
        <div className="bg-emerald-50 rounded-lg p-2">
          <p className="text-emerald-600 font-bold">{chartData.summary?.total_completed || 0}</p>
          <p className="text-gray-500">Total Completed</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-2">
          <p className="text-blue-600 font-bold">{chartData.summary?.total_created || 0}</p>
          <p className="text-gray-500">Total Created</p>
        </div>
        <div className="bg-red-50 rounded-lg p-2">
          <p className="text-red-600 font-bold">{chartData.summary?.current_overdue || 0}</p>
          <p className="text-gray-500">Current Overdue</p>
        </div>
      </div>
    </div>
  );
};

// ✅ Action Buttons Component
const ActionButtons = ({ projectId, onActionApplied }) => {
  const [loading, setLoading] = useState(false);
  const [showReassign, setShowReassign] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    if (showReassign) {
      fetchUsers();
    }
  }, [showReassign]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/users/", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(data.results || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const applyAction = async (action, data = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/api/ai/projects/${projectId}/apply/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, ...data })
      });
      
      if (!response.ok) throw new Error("Failed to apply recommendation");
      
      const result = await response.json();
      toast.success(result.message);
      onActionApplied();
      setShowReassign(false);
      
    } catch (error) {
      console.error("❌ Failed to apply:", error);
      toast.error("Failed to apply recommendation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <button
        onClick={() => setShowReassign(!showReassign)}
        disabled={loading}
        className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1"
      >
        <span>🔄</span>
        <span>Reassign Task</span>
      </button>
      <button
        onClick={() => applyAction("extend_deadline", { task_id: 0, new_days: 3 })}
        disabled={loading}
        className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-1"
      >
        <span>📅</span>
        <span>Extend Deadline</span>
      </button>
      <button
        onClick={() => applyAction("set_priority", { task_id: 0, new_priority: "high" })}
        disabled={loading}
        className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
      >
        <span>🔴</span>
        <span>Set High Priority</span>
      </button>

      {showReassign && (
        <div className="w-full mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Reassign Task</p>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Task ID"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="flex-1 min-w-[100px] px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
            />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-1 min-w-[100px] px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (selectedTask && selectedUser) {
                  applyAction("reassign_task", { 
                    task_id: parseInt(selectedTask), 
                    new_user_id: parseInt(selectedUser) 
                  });
                } else {
                  toast.error("Please select both task and user");
                }
              }}
              disabled={loading}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={() => setShowReassign(false)}
              className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ AI Guidance Modal Component
const AIGuidanceModal = ({ project, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchAIInsights = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          toast.error("Please login to view AI insights");
          onClose();
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/ai/projects/${project.id}/insights/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("You don't have permission to view this project's insights");
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setInsights(data);
      } catch (err) {
        console.error("❌ Failed to fetch AI insights:", err);
        setError(err.message);
        toast.error("Failed to load AI guidance");
      } finally {
        setLoading(false);
      }
    };

    fetchAIInsights();
  }, [project.id, onClose, refreshKey]);

  const handleActionApplied = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("✅ Action applied successfully!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">AI Guidance</h3>
              <p className="text-xs text-gray-500">{project.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-3 text-gray-500">Generating AI insights...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : insights ? (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{insights.metrics?.total_tasks || 0}</p>
                  <p className="text-xs text-gray-500">Total Tasks</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{insights.metrics?.completion_rate || 0}%</p>
                  <p className="text-xs text-gray-500">Completion</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{insights.metrics?.overdue_tasks || 0}</p>
                  <p className="text-xs text-gray-500">Overdue</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">{insights.metrics?.high_priority || 0}</p>
                  <p className="text-xs text-gray-500">High Priority</p>
                </div>
              </div>

              {/* ✅ Trend Chart */}
              <ProjectTrendChart projectId={project.id} />

              {/* AI Summary & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">📋 Summary</h4>
                      <p className="text-sm text-blue-700 mt-1">{insights.ai_insights?.summary}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900">⚠️ Risks</h4>
                      <p className="text-sm text-amber-700 mt-1">{insights.ai_insights?.risks}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Recommendations with Action Buttons */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <LightBulbIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-emerald-900">💡 Recommendations</h4>
                    <p className="text-sm text-emerald-700 mt-1 whitespace-pre-wrap">{insights.ai_insights?.recommendations}</p>
                    
                    <ActionButtons 
                      projectId={project.id}
                      onActionApplied={handleActionApplied}
                    />
                  </div>
                </div>
              </div>

              {/* Team Workload */}
              {insights.workload?.team_members?.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">👥 Team Workload</h4>
                  <div className="space-y-2">
                    {insights.workload.team_members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{member.username}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                member.task_count > 3 ? 'bg-red-500' : 
                                member.task_count > 2 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min((member.task_count / 5) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-medium ${
                            member.task_count > 3 ? 'text-red-600' : 
                            member.task_count > 2 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {member.task_count} tasks
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-gray-400">Powered by OpenAI</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Projects() {
  const navigate = useNavigate();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAIGuidance, setShowAIGuidance] = useState(false);

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "active",
    manager: "",
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "active").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const archivedProjects = projects.filter(p => p.status === "archived").length;

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setLoadingUsers(true);
    api.get("/users/")
      .then((res) => {
        const allUsers = res.data.results || [];
        const filtered = allUsers.filter(
          (user) => user.role === "Manager" || user.role === "Member"
        );
        setUsers(filtered);
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleAIGuidance = (project) => {
    setSelectedProject(project);
    setShowAIGuidance(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim() || !newProject.manager) {
      toast.error("Please enter a project name and select a manager.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createProject(newProject);
      toast.success("🎉 Project created successfully!");
      setNewProject({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "active",
        manager: "",
      });
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProject(editingProject.id, editingProject);
      toast.success(`✅ Project "${editingProject.name}" updated successfully!`);
      setEditingProject(null);
    } catch (error) {
      toast.error("Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      toast.success("🗑️ Project deleted successfully!");
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const handleView = (project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="flex h-screen bg-[#F7F8FA] overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-500 text-sm">Manage all your projects in one place</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPIProjectCard
              title="Total Projects"
              icon={FolderIcon}
              color="#6B7280"
              bgColor="#F3F4F6"
              count={totalProjects}
            />
            <KPIProjectCard
              title="Active Projects"
              icon={ClockIcon}
              color="#10B981"
              bgColor="#ECFDF5"
              count={activeProjects}
            />
            <KPIProjectCard
              title="Completed Projects"
              icon={CheckCircleIcon}
              color="#3B82F6"
              bgColor="#EFF6FF"
              count={completedProjects}
            />
            <KPIProjectCard
              title="Archived Projects"
              icon={ArchiveBoxIcon}
              color="#6B7280"
              bgColor="#F3F4F6"
              count={archivedProjects}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex-1 min-w-[200px] relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📂</div>
                <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                <p className="text-gray-400 mt-1">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Create your first project to get started"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    Create Project
                  </button>
                )}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={setEditingProject}
                  onDelete={(id) => setShowDeleteConfirm(id)}
                  onView={handleView}
                  onAIGuidance={handleAIGuidance}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {/* ✅ AI Guidance Modal */}
      {showAIGuidance && selectedProject && (
        <AIGuidanceModal
          project={selectedProject}
          onClose={() => {
            setShowAIGuidance(false);
            setSelectedProject(null);
          }}
        />
      )}

      {/* ✅ Create Project Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Create New Project</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Enter project description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newProject.start_date}
                    onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newProject.end_date}
                    onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager *</label>
                <select
                  value={newProject.manager}
                  onChange={(e) => setNewProject({ ...newProject, manager: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  disabled={loadingUsers}
                  required
                >
                  {loadingUsers && <option>Loading users...</option>}
                  {!loadingUsers && (
                    <>
                      <option value="">Select Manager</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.role})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Edit Project</h3>
              <button
                onClick={() => setEditingProject(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editingProject.start_date}
                    onChange={(e) => setEditingProject({ ...editingProject, start_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={editingProject.end_date}
                    onChange={(e) => setEditingProject({ ...editingProject, end_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingProject.status}
                  onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager *</label>
                <select
                  value={editingProject.manager}
                  onChange={(e) => setEditingProject({ ...editingProject, manager: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  disabled={loadingUsers}
                  required
                >
                  {loadingUsers && <option>Loading users...</option>}
                  {!loadingUsers && (
                    <>
                      <option value="">Select Manager</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.role})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Project</h3>
              <p className="text-gray-500 text-sm">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}