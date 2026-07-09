// src/pages/Tasks.jsx
import { useState, useEffect } from "react";
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
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserCircleIcon,
  CalendarIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import useTasks from "../hooks/useTasks";
import useProjects from "../hooks/useProjects";
import api from "../services/api";

// ============================================
// TOAST STYLE
// ============================================

const TOAST_STYLE = {
  borderRadius: '10px',
  background: '#333',
  color: '#fff',
};

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
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <span>{count}</span>;
};

// ============================================
// KPI CARD
// ============================================

const KPITaskCard = ({ title, value, icon: Icon, color, bgColor, subtitle }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            <AnimatedCounter value={value} />
          </p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: bgColor }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
};

// ============================================
// TASK DETAIL MODAL
// ============================================

const TaskDetailModal = ({ task, isOpen, onClose, projects, users }) => {
  if (!isOpen || !task) return null;

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
      in_progress: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      completed: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    };
    return colors[status] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
      medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    };
    return colors[priority] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: <ArrowTrendingDownIcon className="w-3 h-3" />,
      medium: <ArrowTrendingUpIcon className="w-3 h-3" />,
      high: <ExclamationTriangleIcon className="w-3 h-3" />,
    };
    return icons[priority] || null;
  };

  const getProjectName = (projectId) => {
    const project = projects?.find(p => p.id === projectId);
    return project?.name || "Unassigned";
  };

  const getUserName = (userId) => {
    const user = users?.find(u => u.id === userId);
    return user?.username || "Unassigned";
  };

  const isOverdue = () => {
    if (task.status === "completed") return false;
    return task.due_date && new Date(task.due_date) < new Date();
  };

  const overdue = isOverdue();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              <ClipboardDocumentListIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Task Details</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete task information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Status */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
              {task.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{task.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(task.status)}`}>
                {task.status === "completed" ? "✅" : task.status === "in_progress" ? "🔄" : "⏳"}
                {task.status?.replace('_', ' ') || "Pending"}
              </span>
              {overdue && (
                <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full animate-pulse">
                  ⚠️ Overdue
                </span>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500">Project</p>
              <p className="font-medium text-gray-900 dark:text-white">{getProjectName(task.project)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500">Assigned To</p>
              <p className="font-medium text-gray-900 dark:text-white">{getUserName(task.assigned_to)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500">Priority</p>
              <p className={`font-medium flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                {getPriorityIcon(task.priority)}
                {task.priority || "Medium"}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500">Due Date</p>
              <p className={`font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }) : "No date"}
                {overdue && " ⚠️"}
              </p>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Status</p>
            <p className="font-medium text-gray-900 dark:text-white mt-1 capitalize">
              {task.status?.replace('_', ' ') || "Pending"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
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
// TASK CARD
// ============================================

const TaskCard = ({ task, onEdit, onDelete, onView, projects }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
      medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    };
    return colors[priority] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: <ArrowTrendingDownIcon className="w-3 h-3" />,
      medium: <ArrowTrendingUpIcon className="w-3 h-3" />,
      high: <ExclamationTriangleIcon className="w-3 h-3" />,
    };
    return icons[priority] || null;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
      in_progress: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      completed: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    };
    return colors[status] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unassigned";
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && task.status !== "completed";
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 ${
        isHovered ? 'shadow-lg transform -translate-y-1' : ''
      } ${isOverdue(task.due_date) ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {task.title}
              </h3>
              {isOverdue(task.due_date) && (
                <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                  Overdue
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {task.description || "No description"}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex items-center space-x-1 ${getStatusColor(task.status)}`}>
            <span className="capitalize">{task.status.replace('_', ' ')}</span>
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex items-center space-x-1 ${getPriorityColor(task.priority)}`}>
            {getPriorityIcon(task.priority)}
            <span className="capitalize">{task.priority}</span>
          </span>
          {task.project && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full flex items-center space-x-1">
              <TagIcon className="w-3 h-3" />
              <span>{getProjectName(task.project)}</span>
            </span>
          )}
        </div>

        {/* Date & Assignee */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          {task.due_date && (
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
          {task.assigned_to && (
            <div className="flex items-center space-x-1">
              <UserCircleIcon className="w-4 h-4" />
              <span>{task.assigned_to}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end space-x-2">
          <button
            onClick={() => onView(task)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            title="Edit Task"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete Task"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN TASKS COMPONENT
// ============================================

export default function Tasks() {
  const navigate = useNavigate();
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const { projects } = useProjects();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  
  // Task Detail Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium",
    status: "pending",
    project: "",
    assigned_to: "",
  });

  // Calculate KPIs
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const overdueTasks = tasks.filter(t => {
    if (t.status === "completed") return false;
    return t.due_date && new Date(t.due_date) < new Date();
  }).length;

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort tasks (overdue first, then by due date)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aOverdue = a.due_date && new Date(a.due_date) < new Date() && a.status !== "completed";
    const bOverdue = b.due_date && new Date(b.due_date) < new Date() && b.status !== "completed";
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date);
    return 0;
  });

  // Fetch users
  useEffect(() => {
    setLoadingUsers(true);
    api.get("/users/")
      .then((res) => {
        const allUsers = res.data.results || [];
        setUsers(allUsers);
      })
      .catch(() => toast.error("Failed to load users", { style: TOAST_STYLE }))
      .finally(() => setLoadingUsers(false));
  }, []);

  // ================= CREATE =================
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.project) {
      toast.error("⚠️ Please enter a task title and select a project.", {
        duration: 3000,
        icon: '⚠️',
        style: TOAST_STYLE,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim() || "",
        due_date: newTask.due_date || null,
        priority: newTask.priority || "medium",
        status: newTask.status || "pending",
        project: parseInt(newTask.project),
      };

      if (newTask.assigned_to) {
        taskData.assigned_to = parseInt(newTask.assigned_to);
      }

      console.log("📤 Creating task with data:", taskData);

      await createTask(taskData);

      toast.success(`✅ Task "${newTask.title}" created successfully!`, {
        duration: 3000,
        icon: '🎉',
        style: TOAST_STYLE,
      });
      
      setNewTask({
        title: "",
        description: "",
        due_date: "",
        priority: "medium",
        status: "pending",
        project: "",
        assigned_to: "",
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error("❌ Create error:", err);
      toast.error("❌ Failed to create task. Please try again.", {
        duration: 3000,
        icon: '❌',
        style: TOAST_STYLE,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingTask?.title?.trim()) {
      toast.error("⚠️ Task title is required.", {
        duration: 3000,
        icon: '⚠️',
        style: TOAST_STYLE,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        title: editingTask.title.trim(),
        description: editingTask.description?.trim() || "",
        due_date: editingTask.due_date || null,
        priority: editingTask.priority || "medium",
        status: editingTask.status || "pending",
      };

      if (editingTask.project) {
        taskData.project = parseInt(editingTask.project);
      }

      if (editingTask.assigned_to) {
        taskData.assigned_to = parseInt(editingTask.assigned_to);
      }

      console.log("📤 Updating task with data:", taskData);

      // ✅ Use PATCH instead of PUT
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/tasks/${editingTask.id}/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Update error response:", errorData);
        throw new Error(errorData.detail || errorData.message || "Update failed");
      }

      // Refresh the task list
      await updateTask(editingTask.id, taskData);

      toast.success(`✅ Task "${editingTask.title}" updated successfully!`, {
        duration: 3000,
        icon: '✏️',
        style: TOAST_STYLE,
      });
      
      setEditingTask(null);
    } catch (err) {
      console.error("❌ Update error:", err);
      toast.error(err.message || "❌ Failed to update task. Please try again.", {
        duration: 3000,
        icon: '❌',
        style: TOAST_STYLE,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    const taskName = taskToDelete?.title || 'Task';
    
    try {
      await deleteTask(id);
      
      toast.success(`🗑️ Task "${taskName}" deleted successfully!`, {
        duration: 3000,
        icon: '🗑️',
        style: TOAST_STYLE,
      });
      
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error("❌ Failed to delete task. Please try again.", {
        duration: 3000,
        icon: '❌',
        style: TOAST_STYLE,
      });
    }
  };

  // ================= VIEW - OPEN DETAIL MODAL =================
  const handleView = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  // ================= CLOSE DETAIL MODAL =================
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };

  return (
    <div className="flex h-screen bg-[#F7F8FA] dark:bg-gray-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Manage all your tasks in one place</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === "grid" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === "list" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  List
                </button>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <KPITaskCard
              title="Total Tasks"
              value={totalTasks}
              icon={ClipboardDocumentListIcon}
              color="#6B7280"
              bgColor="#F3F4F6"
            />
            <KPITaskCard
              title="Completed"
              value={completedTasks}
              icon={CheckCircleIcon}
              color="#10B981"
              bgColor="#ECFDF5"
              subtitle={`${totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}%`}
            />
            <KPITaskCard
              title="In Progress"
              value={inProgressTasks}
              icon={ClockIcon}
              color="#3B82F6"
              bgColor="#EFF6FF"
            />
            <KPITaskCard
              title="Pending"
              value={pendingTasks}
              icon={ClipboardDocumentListIcon}
              color="#F59E0B"
              bgColor="#FFFBEB"
            />
            <KPITaskCard
              title="Overdue"
              value={overdueTasks}
              icon={ExclamationTriangleIcon}
              color="#EF4444"
              bgColor="#FEF2F2"
            />
          </div>

          {/* Search and Filter */}
          <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex-1 min-w-[200px] relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
              {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Tasks Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedTasks.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tasks found</h3>
                  <p className="text-gray-400 dark:text-gray-500 mt-1">
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Create your first task to get started"}
                  </p>
                  {!searchTerm && statusFilter === "all" && priorityFilter === "all" && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                      Create Task
                    </button>
                  )}
                </div>
              ) : (
                sortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projects={projects}
                    onEdit={setEditingTask}
                    onDelete={(id) => setShowDeleteConfirm(id)}
                    onView={handleView}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <tr className="text-left">
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {sortedTasks.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                          No tasks found
                        </td>
                      </tr>
                    ) : (
                      sortedTasks.map((task) => {
                        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";
                        const project = projects.find(p => p.id === task.project);
                        
                        return (
                          <tr key={task.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isOverdue ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                                {task.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{task.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${task.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {project?.name || 'Unassigned'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {task.due_date ? (
                                <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                                  {new Date(task.due_date).toLocaleDateString()}
                                  {isOverdue && ' ⚠️'}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleView(task)}
                                  className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingTask(task)}
                                  className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(task.id)}
                                  className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Task Detail Modal */}
      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={showDetailModal}
          onClose={closeDetailModal}
          projects={projects}
          users={users}
        />
      )}

      {/* Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Task</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  placeholder="Enter task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project *</label>
                <select
                  value={newTask.project}
                  onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
                <select
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={loadingUsers}
                >
                  {loadingUsers && <option>Loading users...</option>}
                  {!loadingUsers && (
                    <>
                      <option value="">Unassigned</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.role})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Task</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editingTask.due_date || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
                <select
                  value={editingTask.project || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, project: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
                <select
                  value={editingTask.assigned_to || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, assigned_to: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={loadingUsers}
                >
                  {loadingUsers && <option>Loading users...</option>}
                  {!loadingUsers && (
                    <>
                      <option value="">Unassigned</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.role})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Task</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-6 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
