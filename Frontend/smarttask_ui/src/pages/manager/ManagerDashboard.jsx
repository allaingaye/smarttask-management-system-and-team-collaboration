// src/pages/manager/ManagerDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  PlusIcon,
  UserPlusIcon,
  ChartPieIcon,
  ArrowRightIcon,
  CalendarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    inProgressTasks: 0,
    teamMembers: 0,
    completionRate: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // ============================================
  // FETCH DATA
  // ============================================

  const fetchManagerData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      console.log('📊 Fetching manager dashboard data...');

      // 1. Fetch projects
      const projectsResponse = await fetch(`${API_BASE_URL}/api/projects/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let managerProjects = [];
      let projectIds = [];

      if (projectsResponse.ok) {
        const data = await projectsResponse.json();
        const projects = data.results || data || [];
        
        // Filter projects owned by this manager
        managerProjects = projects.filter(p => {
          const managerId = p.manager?.id || p.manager;
          return managerId === user?.id;
        });
        
        projectIds = managerProjects.map(p => p.id);
        
        const active = managerProjects.filter(p => p.status === 'active').length;
        const completed = managerProjects.filter(p => p.status === 'completed').length;
        
        setStats(prev => ({
          ...prev,
          totalProjects: managerProjects.length,
          activeProjects: active,
          completedProjects: completed,
        }));
        setRecentProjects(managerProjects.slice(0, 4));
      }

      // 2. Fetch tasks
      const tasksResponse = await fetch(`${API_BASE_URL}/api/tasks/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let managerTasks = [];

      if (tasksResponse.ok) {
        const data = await tasksResponse.json();
        const tasks = data.results || data || [];
        setAllTasks(tasks);
        
        // Filter tasks: created by manager OR in manager's projects
        managerTasks = tasks.filter(t => {
          const isCreator = t.created_by === user?.id || 
                           t.creator === user?.id || 
                           t.created_by?.id === user?.id;
          const isInMyProject = projectIds.includes(t.project);
          return isCreator || isInMyProject;
        });
        
        const completed = managerTasks.filter(t => t.status === 'completed').length;
        const inProgress = managerTasks.filter(t => t.status === 'in_progress').length;
        const overdue = managerTasks.filter(t => {
          if (t.status === 'completed') return false;
          return t.due_date && new Date(t.due_date) < new Date();
        }).length;
        const total = managerTasks.length;
        const completionRate = total > 0 ? (completed / total * 100) : 0;
        
        setStats(prev => ({
          ...prev,
          totalTasks: total,
          completedTasks: completed,
          overdueTasks: overdue,
          inProgressTasks: inProgress,
          completionRate: Math.round(completionRate),
        }));
        setRecentTasks(managerTasks.slice(0, 5));
      }

      // 3. Fetch users (team members)
      const usersResponse = await fetch(`${API_BASE_URL}/api/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (usersResponse.ok) {
        const data = await usersResponse.json();
        const users = data.results || data || [];
        
        // Get all members (excluding current user)
        const members = users.filter(u => u.id !== user?.id);
        setTeamMembers(members);
        setStats(prev => ({
          ...prev,
          teamMembers: members.length,
        }));
      }

      console.log('✅ Dashboard data loaded:', {
        projects: managerProjects.length,
        tasks: managerTasks.length,
        members: teamMembers.length,
      });

    } catch (error) {
      console.error('❌ Failed to fetch manager data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, user]);

  useEffect(() => {
    fetchManagerData();
  }, [fetchManagerData]);

  // ============================================
  // QUICK ACTION CARDS
  // ============================================

  const QuickActionCard = ({ icon: Icon, title, description, onClick, color }) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300',
      purple: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300',
      amber: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300',
    };

    return (
      <div 
        onClick={onClick}
        className={`bg-white rounded-xl p-4 border-2 transition-all cursor-pointer group ${colors[color]}`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
              {title}
            </p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    );
  };

  // ============================================
  // KPI CARD
  // ============================================

  const KpiCard = ({ title, value, icon: Icon, color, bgColor, subtitle, trend }) => {
    const colorMap = {
      blue: 'text-blue-600',
      emerald: 'text-emerald-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
      amber: 'text-amber-600',
    };

    const bgMap = {
      blue: 'bg-blue-50',
      emerald: 'bg-emerald-50',
      red: 'bg-red-50',
      purple: 'bg-purple-50',
      amber: 'bg-amber-50',
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100/80 transition-all hover:shadow-md hover:border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${bgMap[color]}`}>
            <Icon className={`w-6 h-6 ${colorMap[color]}`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-3">
            <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-600">{trend}</span>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // PROJECT CARD
  // ============================================

  const ProjectCard = ({ project }) => {
    const statusColors = {
      active: 'bg-emerald-100 text-emerald-700',
      completed: 'bg-blue-100 text-blue-700',
      pending: 'bg-amber-100 text-amber-700',
    };

    const taskCount = allTasks.filter(t => t.project === project.id).length;

    return (
      <div 
        onClick={() => navigate(`/manager/projects/${project.id}`)}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {project.name}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {taskCount} task{taskCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-700'}`}>
              {project.status || 'Active'}
            </span>
            <EyeIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
        </div>
        {project.start_date && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <CalendarIcon className="w-3 h-3" />
            <span>Started {new Date(project.start_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // TASK ROW
  // ============================================

  const TaskRow = ({ task }) => {
    const statusColors = {
      completed: 'bg-emerald-100 text-emerald-700',
      in_progress: 'bg-blue-100 text-blue-700',
      pending: 'bg-amber-100 text-amber-700',
    };

    const isOverdue = task.status !== 'completed' && task.due_date && new Date(task.due_date) < new Date();

    return (
      <tr 
        onClick={() => navigate(`/manager/tasks/${task.id}`)}
        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-8 rounded-full transition-all group-hover:opacity-100 ${isOverdue ? 'bg-red-400' : task.status === 'completed' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            <span className="font-medium text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
              {task.title}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {task.project_name || '—'}
        </td>
        <td className="px-4 py-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[task.status] || 'bg-gray-100 text-gray-700'}`}>
            {task.status?.replace('_', ' ') || 'Pending'}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
            {isOverdue && ' ⚠️'}
          </span>
        </td>
      </tr>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                📊 Dashboard
                <span className="text-sm font-normal text-gray-400 bg-gray-100 px-3 py-0.5 rounded-full">
                  Manager
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Welcome back, <span className="font-medium text-gray-700">{user?.username}</span>! 
                Here's what's happening with your projects.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/manager/projects')}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 text-sm font-medium shadow-sm shadow-gray-900/10"
              >
                <PlusIcon className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Projects"
              value={stats.activeProjects || 0}
              icon={FolderIcon}
              color="blue"
              bgColor="blue"
              subtitle={`${stats.totalProjects} total`}
              trend={`${stats.activeProjects} active`}
            />
            <KpiCard
              title="Tasks Done"
              value={stats.completedTasks || 0}
              icon={CheckCircleIcon}
              color="emerald"
              bgColor="emerald"
              subtitle={`${stats.completionRate}% complete`}
              trend={`${stats.inProgressTasks} in progress`}
            />
            <KpiCard
              title="Overdue"
              value={stats.overdueTasks || 0}
              icon={ExclamationTriangleIcon}
              color="red"
              bgColor="red"
              subtitle="Need attention"
              trend={stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : 'All on track'}
            />
            <KpiCard
              title="Team"
              value={stats.teamMembers || 0}
              icon={UsersIcon}
              color="purple"
              bgColor="purple"
              subtitle="Active members"
              trend="Working on tasks"
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <QuickActionCard
                icon={FolderIcon}
                title="Create Project"
                description="Start a new project from scratch"
                onClick={() => navigate('/manager/projects')}
                color="blue"
              />
              <QuickActionCard
                icon={ClipboardDocumentListIcon}
                title="Assign Task"
                description="Distribute work to your team"
                onClick={() => navigate('/manager/tasks')}
                color="emerald"
              />
              <QuickActionCard
                icon={ChartPieIcon}
                title="View Analytics"
                description="Team performance metrics"
                onClick={() => navigate('/manager/analytics')}
                color="purple"
              />
            </div>
          </div>

          {/* Recent Projects */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-800">Your Projects</h2>
              <button
                onClick={() => navigate('/manager/projects')}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
              >
                View all <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200/60 p-8 text-center">
                <FolderIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No projects yet</p>
                <button
                  onClick={() => navigate('/manager/projects/create')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first project →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-800">Recent Tasks</h2>
              <button
                onClick={() => navigate('/manager/tasks')}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
              >
                View all <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200/60 p-8 text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200/60 p-8 text-center">
                <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No tasks yet</p>
                <button
                  onClick={() => navigate('/manager/tasks')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first task →
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/80 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Task</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentTasks.map(task => (
                        <TaskRow key={task.id} task={task} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;