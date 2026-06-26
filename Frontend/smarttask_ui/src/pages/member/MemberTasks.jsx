// src/pages/member/MemberTasks.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';

// ✅ Task Card Component
const TaskCard = ({ task, onUpdate, onAddNote, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority || 'medium',
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700 border-gray-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockIcon className="w-3 h-3" />,
      in_progress: <UserCircleIcon className="w-3 h-3" />,
      completed: <CheckCircleIcon className="w-3 h-3" />,
    };
    return icons[status] || null;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700 border-gray-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      high: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const isOverdue = () => {
    if (task.status === 'completed') return false;
    return task.due_date && new Date(task.due_date) < new Date();
  };

  const overdue = isOverdue();

  const handleStatusChange = (newStatus) => {
    onUpdate(task.id, { status: newStatus });
    setIsExpanded(false);
  };

  const handleUpdateTask = () => {
    onUpdate(task.id, editData);
    setIsEditing(false);
    setIsExpanded(false);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(task.id, newNote);
      setNewNote('');
      setShowNoteInput(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-6 transition-all hover:shadow-md ${
      overdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task title"
              />
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="2"
                placeholder="Task description"
              />
              <div className="flex gap-2">
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateTask}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      title: task.title,
                      description: task.description || '',
                      status: task.status,
                      priority: task.priority || 'medium',
                    });
                  }}
                  className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                {overdue && (
                  <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                    Overdue
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-1">{task.description || 'No description'}</p>
              
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                  {task.status?.replace('_', ' ') || 'Pending'}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getPriorityBadge(task.priority)}`}>
                  {task.priority || 'Medium'}
                </span>
                <span className="text-xs text-gray-400">
                  Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2 ml-4">
          {!isEditing && task.status !== 'completed' && (
            <div className="flex gap-1">
              {task.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start
                </button>
              )}
              {task.status === 'in_progress' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => handleStatusChange('completed')}
                className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Complete
              </button>
            </div>
          )}
          {task.status === 'completed' && (
            <span className="text-xs font-medium text-emerald-600">✅ Done</span>
          )}
        </div>
      </div>

      {/* Expandable Section */}
      {!isEditing && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            {isExpanded ? 'Show less' : 'Show more'}
            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
              {/* Add Note */}
              <div>
                {showNoteInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a progress note..."
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                      Add
                    </button>
                    <button
                      onClick={() => setShowNoteInput(false)}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNoteInput(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add progress note
                  </button>
                )}
              </div>

              {/* Notes List */}
              {task.notes && task.notes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">Progress Notes</p>
                  {task.notes.map((note, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">{note.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{note.timestamp}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Edit & Delete */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function MemberTasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // ✅ Fetch member's tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');

      const response = await fetch(`${API_BASE_URL}/api/tasks/?assigned_to=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const tasksList = data.results || data || [];
        setTasks(tasksList);
      } else {
        toast.error('Failed to load tasks');
      }
    } catch (error) {
      console.error('❌ Failed to fetch tasks:', error);
      toast.error('Failed to load your tasks');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // ✅ Update task
  const updateTask = async (taskId, updates) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast.success('✅ Task updated successfully!');
        fetchTasks();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('❌ Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  // ✅ Add progress note
  const addProgressNote = async (taskId, note) => {
    try {
      const token = localStorage.getItem('access_token');
      const task = tasks.find(t => t.id === taskId);
      const currentNotes = task?.notes || [];
      
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: [...currentNotes, {
            content: note,
            timestamp: new Date().toLocaleString(),
          }],
        }),
      });

      if (response.ok) {
        toast.success('✅ Note added successfully!');
        fetchTasks();
      } else {
        toast.error('Failed to add note');
      }
    } catch (error) {
      console.error('❌ Failed to add note:', error);
      toast.error('Failed to add note');
    }
  };

  // ✅ Delete task
  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('🗑️ Task deleted successfully!');
        fetchTasks();
      } else {
        toast.error('Failed to delete task');
      }
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ✅ Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => {
      if (t.status === 'completed') return false;
      return t.due_date && new Date(t.due_date) < new Date();
    }).length,
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📋 My Tasks</h1>
              <p className="text-gray-500 text-sm">
                View and manage tasks assigned to you
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {tasks.length} tasks
              </span>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
              <p className="text-lg font-bold text-emerald-600">{stats.completed}</p>
              <p className="text-xs text-emerald-600">Completed</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
              <p className="text-lg font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-xs text-blue-600">In Progress</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-lg font-bold text-gray-600">{stats.pending}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
            <div className={`rounded-xl p-3 text-center border ${stats.overdue > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
              <p className={`text-lg font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-gray-400'}`}>{stats.overdue}</p>
              <p className={`text-xs ${stats.overdue > 0 ? 'text-red-600' : 'text-gray-400'}`}>Overdue</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex-1 min-w-[200px] relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="text-sm text-gray-500 ml-auto">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-3 text-gray-500">Loading your tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
              <CheckCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">No tasks found</h3>
              <p className="text-gray-400 mt-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : "You're all caught up! 🎉"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={updateTask}
                  onAddNote={addProgressNote}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}