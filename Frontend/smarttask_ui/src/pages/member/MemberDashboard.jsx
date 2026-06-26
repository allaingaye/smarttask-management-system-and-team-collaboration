// src/pages/member/MemberDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  HomeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PencilIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';

// ✅ Task Card Component
const TaskCard = ({ task, onUpdate, onAddNote, onView }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-emerald-100 text-emerald-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-amber-500',
      high: 'text-red-500',
    };
    return colors[priority] || 'text-gray-500';
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-amber-100 text-amber-700',
      high: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    if (task.status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const overdue = isOverdue(task.due_date);

  const handleStatusChange = (newStatus) => {
    onUpdate(task.id, { status: newStatus });
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
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            {overdue && (
              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                Overdue
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-1">{task.description || 'No description'}</p>
          
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(task.status)}`}>
              {task.status?.replace('_', ' ') || 'Pending'}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getPriorityBadge(task.priority)}`}>
              {task.priority || 'Medium'}
            </span>
            <span className="text-xs text-gray-400">
              Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
            </span>
          </div>

          {/* Progress Notes */}
          {task.notes && task.notes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>{task.notes.length} note{task.notes.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Status Update Buttons */}
          {task.status !== 'completed' && (
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
              {task.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Complete
                </button>
              )}
            </div>
          )}
          {task.status === 'completed' && (
            <span className="text-xs font-medium text-emerald-600">✅ Done</span>
          )}
        </div>
      </div>

      {/* Expandable Section */}
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
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
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
              {task.notes.map((note, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-2 text-sm text-gray-600">
                  <p>{note.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{note.timestamp}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => onView(task)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <EyeIcon className="w-4 h-4" />
            View details
          </button>
        </div>
      )}
    </div>
  );
};

// ✅ AI Insights Widget
const AIInsightsWidget = ({ insights, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <SparklesIcon className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
        </div>
        <p className="text-gray-400 text-sm">Complete more tasks to get personalized insights</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="w-5 h-5 text-indigo-500" />
        <h3 className="font-semibold text-gray-900">AI Insights</h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Personal</span>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className={`p-3 rounded-xl ${
            insight.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
            insight.type === 'success' ? 'bg-emerald-50 border border-emerald-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start gap-2">
              {insight.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
              {insight.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />}
              {insight.type === 'info' && <SparklesIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                <p className="text-sm text-gray-600">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MemberDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });
  const [insights, setInsights] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

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

        // ✅ Calculate stats
        const total = tasksList.length;
        const completed = tasksList.filter(t => t.status === 'completed').length;
        const inProgress = tasksList.filter(t => t.status === 'in_progress').length;
        const pending = tasksList.filter(t => t.status === 'pending').length;
        const overdue = tasksList.filter(t => {
          if (t.status === 'completed') return false;
          return t.due_date && new Date(t.due_date) < new Date();
        }).length;

        setStats({ total, completed, inProgress, pending, overdue });

        // ✅ Generate AI Insights
        generateInsights(tasksList);
      }
    } catch (error) {
      console.error('❌ Failed to fetch tasks:', error);
      toast.error('Failed to load your tasks');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // ✅ Generate AI Insights
  const generateInsights = (tasksList) => {
    const newInsights = [];
    const now = new Date();

    // Check for overdue tasks
    const overdueTasks = tasksList.filter(t => {
      if (t.status === 'completed') return false;
      return t.due_date && new Date(t.due_date) < now;
    });

    if (overdueTasks.length > 0) {
      newInsights.push({
        type: 'warning',
        title: '⚠️ Overdue Tasks',
        message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Prioritize these immediately!`,
      });
    }

    // Check for upcoming deadlines
    const upcomingTasks = tasksList.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.due_date) return false;
      const diff = new Date(t.due_date) - now;
      return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
    });

    if (upcomingTasks.length > 0) {
      newInsights.push({
        type: 'info',
        title: '📅 Upcoming Deadlines',
        message: `${upcomingTasks.length} task${upcomingTasks.length > 1 ? 's are' : ' is'} due within 3 days. Stay on track!`,
      });
    }

    // High priority tasks
    const highPriorityTasks = tasksList.filter(t => t.priority === 'high' && t.status !== 'completed');
    if (highPriorityTasks.length > 0) {
      newInsights.push({
        type: 'warning',
        title: '🔴 High Priority Tasks',
        message: `You have ${highPriorityTasks.length} high priority task${highPriorityTasks.length > 1 ? 's' : ''} pending. Focus on these first.`,
      });
    }

    // Check if all tasks are completed
    if (tasksList.length > 0 && tasksList.every(t => t.status === 'completed')) {
      newInsights.push({
        type: 'success',
        title: '🎉 All Done!',
        message: 'Great job! All your tasks are completed. Keep up the good work!',
      });
    }

    // Task completion rate
    const completed = tasksList.filter(t => t.status === 'completed').length;
    const total = tasksList.length;
    if (total > 0 && completed / total > 0.7) {
      newInsights.push({
        type: 'success',
        title: '📈 Great Progress',
        message: `You've completed ${Math.round((completed/total)*100)}% of your tasks. Keep going!`,
      });
    }

    setInsights(newInsights);
  };

  // ✅ Update task status
  const updateTaskStatus = async (taskId, updates) => {
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
        toast.success(`Task updated successfully!`);
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
        toast.success('Note added successfully!');
        fetchTasks();
      } else {
        toast.error('Failed to add note');
      }
    } catch (error) {
      console.error('❌ Failed to add note:', error);
      toast.error('Failed to add note');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ✅ KPI Card Component
  const KpiCard = ({ title, value, icon: Icon, color, bgColor, subtitle }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 My Dashboard</h1>
              <p className="text-gray-500 text-sm">
                Welcome back, <span className="font-medium text-gray-700">{user?.username}</span>! 
                Here's your personal workspace.
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard
              title="Total Tasks"
              value={stats.total}
              icon={HomeIcon}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <KpiCard
              title="Completed"
              value={stats.completed}
              icon={CheckCircleIcon}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
              subtitle={`${stats.total > 0 ? Math.round((stats.completed/stats.total)*100) : 0}% done`}
            />
            <KpiCard
              title="In Progress"
              value={stats.inProgress}
              icon={ClockIcon}
              color="text-amber-600"
              bgColor="bg-amber-50"
            />
            <KpiCard
              title="Pending"
              value={stats.pending}
              icon={ArrowTrendingUpIcon}
              color="text-gray-600"
              bgColor="bg-gray-50"
            />
            <KpiCard
              title="Overdue"
              value={stats.overdue}
              icon={ExclamationTriangleIcon}
              color="text-red-600"
              bgColor="bg-red-50"
              subtitle={stats.overdue > 0 ? '⚠️ Needs attention' : 'All on track'}
            />
          </div>

          {/* AI Insights Widget */}
          <AIInsightsWidget insights={insights} loading={loading} />

          {/* Tasks Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
              <span className="text-xs text-gray-400">{tasks.length} tasks</span>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-3 text-gray-500">Loading your tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <CheckCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No tasks assigned</h3>
                <p className="text-gray-400 mt-1">You're all caught up! 🎉</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={updateTaskStatus}
                    onAddNote={addProgressNote}
                    onView={(task) => {
                      setSelectedTask(task);
                      setShowTaskModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Task Details</h3>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedTask(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{selectedTask.title}</h4>
                <p className="text-gray-600 mt-1">{selectedTask.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedTask.status?.replace('_', ' ')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Priority</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedTask.priority}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Due Date</p>
                  <p className="font-medium text-gray-900">{selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'No date'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Project</p>
                  <p className="font-medium text-gray-900">{selectedTask.project_name || 'N/A'}</p>
                </div>
              </div>
              {selectedTask.notes && selectedTask.notes.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Progress Notes</h5>
                  <div className="space-y-2">
                    {selectedTask.notes.map((note, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">{note.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{note.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-4 border-t border-gray-100 flex gap-2">
                {selectedTask.status !== 'completed' && (
                  <>
                    {selectedTask.status === 'pending' && (
                      <button
                        onClick={() => {
                          updateTaskStatus(selectedTask.id, { status: 'in_progress' });
                          setShowTaskModal(false);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Start Task
                      </button>
                    )}
                    {selectedTask.status === 'in_progress' && (
                      <button
                        onClick={() => {
                          updateTaskStatus(selectedTask.id, { status: 'completed' });
                          setShowTaskModal(false);
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Complete Task
                      </button>
                    )}
                    <button
                      onClick={() => {
                        updateTaskStatus(selectedTask.id, { status: 'completed' });
                        setShowTaskModal(false);
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Mark Complete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}