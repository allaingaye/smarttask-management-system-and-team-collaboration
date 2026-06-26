// src/pages/manager/ManagerTasks.jsx
import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
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
  UserCircleIcon,
  ArrowPathIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';

// ============================================
// CONSTANTS
// ============================================

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const STATUS_MAP = {
  pending: { label: 'Pending', color: 'amber', icon: ClockIcon },
  in_progress: { label: 'In Progress', color: 'blue', icon: UserCircleIcon },
  completed: { label: 'Done', color: 'emerald', icon: CheckCircleIcon },
};

const PRIORITY_MAP = {
  low: { label: 'Low', color: 'slate' },
  medium: { label: 'Medium', color: 'orange' },
  high: { label: 'High', color: 'rose' },
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
  put: (url, body) => api.request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => api.request(url, { method: 'DELETE' }),
};

// ============================================
// HOOKS
// ============================================

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  });
  const set = (val) => {
    setValue(val);
    localStorage.setItem(key, JSON.stringify(val));
  };
  return [value, set];
}

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ============================================
// STATUS BADGE
// ============================================

const StatusBadge = memo(({ status }) => {
  const config = STATUS_MAP[status] || STATUS_MAP.pending;
  const Icon = config.icon;
  const colors = {
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${colors[config.color]}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

// ============================================
// PRIORITY BADGE
// ============================================

const PriorityBadge = memo(({ priority }) => {
  const config = PRIORITY_MAP[priority] || PRIORITY_MAP.medium;
  const colors = {
    slate: 'text-slate-500 bg-slate-50',
    orange: 'text-orange-600 bg-orange-50',
    rose: 'text-rose-600 bg-rose-50',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colors[config.color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.color === 'slate' ? 'bg-slate-400' : config.color === 'orange' ? 'bg-orange-400' : 'bg-rose-400'}`} />
      {config.label}
    </span>
  );
});

PriorityBadge.displayName = 'PriorityBadge';

// ============================================
// TASK ROW
// ============================================

const TaskRow = memo(({ task, projects, members, onView, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const project = projects.find(p => p.id === task.project);
  const assignee = members.find(m => m.id === task.assigned_to);
  const isOverdue = task.status !== 'completed' && task.due_date && new Date(task.due_date) < new Date();

  return (
    <tr 
      className="border-b border-slate-100 last:border-0 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-8 rounded-full transition-all ${isHovered ? 'opacity-100' : 'opacity-0'} ${
            task.status === 'completed' ? 'bg-emerald-400' : 
            isOverdue ? 'bg-rose-400' : 'bg-blue-400'
          }`} />
          <div>
            <p className={`text-sm font-medium text-slate-800 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{task.description}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-600">{project?.name || '—'}</span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
            {assignee?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-slate-600">{assignee?.username || 'Unassigned'}</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={task.status} />
      </td>
      <td className="px-4 py-3.5">
        <PriorityBadge priority={task.priority} />
      </td>
      <td className="px-4 py-3.5">
        <span className={`text-sm ${isOverdue ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
          {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
          {isOverdue && ' ⚠️'}
        </span>
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className={`flex items-center justify-end gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-60'}`}>
          <button
            onClick={() => onView('detail', task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            title="View"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onView('edit', task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onView('delete', task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

TaskRow.displayName = 'TaskRow';

// ============================================
// STATS CARDS
// ============================================

const StatsCards = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const overdue = tasks.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()).length;

  const cards = [
    { label: 'Total Tasks', value: total, icon: ClipboardDocumentListIcon, color: 'blue' },
    { label: 'In Progress', value: inProgress, icon: UserCircleIcon, color: 'amber' },
    { label: 'Completed', value: completed, icon: CheckCircleIcon, color: 'emerald' },
    { label: 'Overdue', value: overdue, icon: ExclamationTriangleIcon, color: 'rose' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => {
        const colors = {
          blue: 'bg-blue-50 text-blue-600 ring-blue-500/10',
          amber: 'bg-amber-50 text-amber-600 ring-amber-500/10',
          emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-500/10',
          rose: 'bg-rose-50 text-rose-600 ring-rose-500/10',
        };
        return (
          <div key={label} className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ring-1 ${colors[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// DETAIL MODAL
// ============================================

const TaskDetailModal = ({ task, isOpen, onClose, projects, members, onEdit }) => {
  if (!isOpen || !task) return null;

  const project = projects.find(p => p.id === task.project);
  const assignee = members.find(m => m.id === task.assigned_to);
  const isOverdue = task.status !== 'completed' && task.due_date && new Date(task.due_date) < new Date();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <ClipboardDocumentListIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Task Details</h3>
              <p className="text-xs text-slate-400">Full task information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{task.title}</h2>
            {task.description && (
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">{task.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Project</p>
              <p className="font-medium text-slate-700 mt-1">{project?.name || '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Assignee</p>
              <p className="font-medium text-slate-700 mt-1">{assignee?.username || 'Unassigned'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Status</p>
              <div className="mt-1"><StatusBadge status={task.status} /></div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Priority</p>
              <div className="mt-1"><PriorityBadge priority={task.priority} /></div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Due Date</p>
            <p className={`font-medium mt-1 ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
              {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : 'No due date'}
              {isOverdue && ' ⚠️ Overdue'}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Close</button>
            <button onClick={() => { onClose(); onEdit(task); }} className="px-4 py-2 text-sm bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2">
              <PencilIcon className="w-4 h-4" /> Edit Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const ManagerTasks = () => {
  const { user } = useAuth();
  const abortRef = useRef(null);

  // State
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useLocalStorage('manager_task_filter', 'all');
  
  // Modal state
  const [modal, setModal] = useState({ type: null, task: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    project: '',
    assigned_to: '',
  });

  const debouncedSearch = useDebounce(search);

  // ============================================
  // FETCH - FIXED to show ALL tasks created by manager
  // ============================================

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const [projData, taskData, userData] = await Promise.all([
        api.get('/api/projects/'),
        api.get('/api/tasks/'),
        api.get('/api/users/'),
      ]);

      const allProjects = projData.results || projData || [];
      const allTasksData = taskData.results || taskData || [];
      const allUsers = userData.results || userData || [];

      // Store all tasks for reference
      setAllTasks(allTasksData);

      // 🔥 FIX: Get ALL tasks created by this user OR assigned to their projects
      const myProjects = allProjects.filter(p => (p.manager?.id || p.manager) === user.id);
      const projectIds = myProjects.map(p => p.id);

      // Get tasks where:
      // 1. User is the creator (task.created_by === user.id)
      // 2. OR task belongs to a project managed by the user
      const myTasks = allTasksData.filter(t => {
        const isCreator = t.created_by === user.id || t.creator === user.id || t.created_by?.id === user.id;
        const isInMyProject = projectIds.includes(t.project);
        return isCreator || isInMyProject;
      });

      setProjects(myProjects);
      setTasks(myTasks);
      
      // Get team members (all users except current)
      const team = allUsers.filter(u => u.id !== user.id);
      setMembers(team);

      console.log(`📊 Found ${allTasksData.length} total tasks, ${myTasks.length} belong to you`);

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        toast.error(err.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ============================================
  // CRUD
  // ============================================

  const refresh = useCallback(async () => {
    await fetchData();
    toast.success('Refreshed ✨', { duration: 1500, icon: '🔄' });
  }, [fetchData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.project) return toast.error('Select a project');

    setIsSubmitting(true);
    try {
      await api.post('/api/tasks/', {
        ...form,
        project: parseInt(form.project),
        assigned_to: form.assigned_to ? parseInt(form.assigned_to) : null,
      });
      toast.success('Task created ✨');
      setModal({ type: null, task: null });
      resetForm();
      await refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const task = modal.task;
    if (!task?.title?.trim()) return toast.error('Title is required');

    setIsSubmitting(true);
    try {
      await api.put(`/api/tasks/${task.id}/`, {
        ...task,
        project: parseInt(task.project),
        assigned_to: task.assigned_to ? parseInt(task.assigned_to) : null,
      });
      toast.success('Task updated ✨');
      setModal({ type: null, task: null });
      await refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const task = modal.task;
    setIsSubmitting(true);
    try {
      await api.delete(`/api/tasks/${task.id}/`);
      toast.success('Task deleted ✨');
      setModal({ type: null, task: null });
      await refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  const resetForm = () => setForm({
    title: '', description: '', due_date: '',
    priority: 'medium', status: 'pending', project: '', assigned_to: '',
  });

  const openModal = (type, task = null) => {
    setModal({ type, task });
    if (type === 'edit' && task) {
      setModal({ type, task: { ...task, project: task.project, assigned_to: task.assigned_to || '' } });
    }
  };

  const closeModal = () => {
    setModal({ type: null, task: null });
    resetForm();
  };

  // ============================================
  // FILTER & SORT
  // ============================================

  const filtered = useMemo(() => {
    let result = tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         t.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
    // Sort by due date (overdue first)
    result.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });
    return result;
  }, [tasks, debouncedSearch, statusFilter]);

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openModal('create');
      }
      if (e.key === 'Escape' && modal.type) closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modal.type]);

  // ============================================
  // INIT
  // ============================================

  useEffect(() => {
    if (user?.id) fetchData();
    return () => abortRef.current?.abort();
  }, [user, fetchData]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Tasks</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {tasks.filter(t => t.status === 'completed').length} of {tasks.length} completed
              </p>
            </div>
            <button
              onClick={() => openModal('create')}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 text-sm font-medium shadow-sm shadow-slate-800/10"
            >
              <PlusIcon className="w-4 h-4" />
              New Task
              <span className="text-xs text-slate-400 hidden sm:inline">⌘N</span>
            </button>
          </div>

          {/* Stats */}
          <StatsCards tasks={tasks} />

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-slate-200/60 p-2.5 shadow-sm">
            <div className="flex-1 min-w-[180px] relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border-0 focus:ring-0 bg-transparent placeholder:text-slate-400 text-slate-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border-0 bg-transparent focus:ring-0 text-slate-600 cursor-pointer py-1.5"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Done</option>
              </select>
            </div>
            <span className="text-xs text-slate-400 ml-auto">
              {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {/* Debug Info */}
          <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3 text-xs">
            <details className="group">
              <summary className="font-medium text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
                🔍 Debug Info
              </summary>
              <div className="mt-2 space-y-0.5 text-slate-500">
                <p>Total tasks in DB: {allTasks.length}</p>
                <p>Tasks created by you or in your projects: {tasks.length}</p>
                <p>Projects managed: {projects.length}</p>
                <p>Showing: {filtered.length}</p>
                {allTasks.length > 0 && tasks.length === 0 && (
                  <p className="text-amber-600">⚠️ No tasks found. Check if you're the creator or manager.</p>
                )}
              </div>
            </details>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200/60 p-12 text-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-400 mt-3">Loading tasks…</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-rose-200/60 p-8 text-center">
              <p className="text-rose-600 text-sm">{error}</p>
              <button onClick={refresh} className="mt-3 text-sm text-slate-600 hover:text-slate-800 underline">Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/60 p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <ClipboardDocumentListIcon className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-base font-medium text-slate-700">No tasks here</h3>
              <p className="text-sm text-slate-400 mt-1">
                {search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first task'}
              </p>
              {!search && statusFilter === 'all' && (
                <button onClick={() => openModal('create')} className="mt-3 text-sm text-slate-600 hover:text-slate-800 font-medium">+ New Task</button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Task</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Project</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Assignee</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Priority</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Due</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        projects={projects}
                        members={members}
                        onView={openModal}
                        onEdit={openModal}
                        onDelete={openModal}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================== */}
      {/* CREATE MODAL */}
      {/* ========================================== */}

      {modal.type === 'create' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-800">New Task</h3>
                <p className="text-xs text-slate-400">Add a task to your project</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <XMarkIcon className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  placeholder="Add details (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow resize-none"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project <span className="text-rose-500">*</span></label>
                <select
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                <select
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow"
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.username}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Done</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-60">
                  {isSubmitting ? 'Creating…' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* EDIT MODAL */}
      {/* ========================================== */}

      {modal.type === 'edit' && modal.task && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-800">Edit Task</h3>
                <p className="text-xs text-slate-400">Update task details</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <XMarkIcon className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={modal.task.title || ''}
                  onChange={(e) => setModal({ ...modal, task: { ...modal.task, title: e.target.value } })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={modal.task.description || ''}
                  onChange={(e) => setModal({ ...modal, task: { ...modal.task, description: e.target.value } })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow resize-none"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project <span className="text-rose-500">*</span></label>
                <select
                  value={modal.task.project || ''}
                  onChange={(e) => setModal({ ...modal, task: { ...modal.task, project: e.target.value } })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                <select
                  value={modal.task.assigned_to || ''}
                  onChange={(e) => setModal({ ...modal, task: { ...modal.task, assigned_to: e.target.value } })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow"
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.username}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={modal.task.due_date || ''}
                    onChange={(e) => setModal({ ...modal, task: { ...modal.task, due_date: e.target.value } })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={modal.task.priority || 'medium'}
                    onChange={(e) => setModal({ ...modal, task: { ...modal.task, priority: e.target.value } })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={modal.task.status || 'pending'}
                  onChange={(e) => setModal({ ...modal, task: { ...modal.task, status: e.target.value } })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-shadow"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Done</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-60">
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* DELETE MODAL */}
      {/* ========================================== */}

      {modal.type === 'delete' && modal.task && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Delete Task?</h3>
              <p className="text-sm text-slate-500 mt-1">"{modal.task.title}" will be permanently removed.</p>
              <div className="flex justify-center gap-3 mt-6">
                <button onClick={closeModal} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={isSubmitting} className="px-4 py-2 text-sm bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-60">
                  {isSubmitting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* DETAIL MODAL */}
      {/* ========================================== */}

      <TaskDetailModal
        task={modal.task}
        isOpen={modal.type === 'detail'}
        onClose={closeModal}
        projects={projects}
        members={members}
        onEdit={(task) => openModal('edit', task)}
      />
    </div>
  );
};

export default ManagerTasks;