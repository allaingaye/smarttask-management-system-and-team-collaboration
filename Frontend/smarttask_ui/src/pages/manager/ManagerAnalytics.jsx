// src/pages/manager/ManagerAnalytics.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PresentationChartLineIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';

// ✅ Simple Chart Component (using div-based bars)
const SimpleBarChart = ({ data, title, color = 'blue' }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  const colors = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  };

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-3">{title}</p>
      <div className="space-y-2">
        {data.slice(0, 8).map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-16 truncate">{item.label}</span>
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${colors[color]} rounded-full transition-all duration-500`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-700 w-8 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ✅ Donut Chart Component
const DonutChart = ({ completed, total, label }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="40"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="12"
          />
          <circle
            cx="64"
            cy="64"
            r="40"
            fill="none"
            stroke={percentage > 50 ? '#10B981' : percentage > 25 ? '#F59E0B' : '#EF4444'}
            strokeWidth="12"
            strokeLinecap="round"
            style={{
              strokeDasharray: strokeDasharray,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Stat Card with Progress
const StatCard = ({ title, value, icon: Icon, color, bgColor, subtitle, trend, progress }) => {
  const trendColors = {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-400 bg-gray-50',
  };

  const trendIcons = {
    up: <ArrowTrendingUpIcon className="w-3 h-3" />,
    down: <ArrowTrendingDownIcon className="w-3 h-3" />,
    neutral: <ClockIcon className="w-3 h-3" />,
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 hover:shadow-md transition-all">
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
      {trend && (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-3 ${trendColors[trend]}`}>
          {trendIcons[trend]}
          <span>{trend === 'up' ? '+' : ''}{trend === 'down' ? '-' : ''}12% this month</span>
        </div>
      )}
      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

const ManagerAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    inProgressTasks: 0,
    teamMembers: 0,
    completionRate: 0,
    projectData: [],
    taskData: [],
    weeklyTrend: [],
  });
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // ✅ Fetch projects
      const projectsResponse = await fetch(`${API_BASE_URL}/api/projects/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let projects = [];
      let tasks = [];

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        const allProjects = projectsData.results || projectsData || [];
        projects = allProjects.filter(p => {
          const managerId = p.manager?.id || p.manager;
          return managerId === user?.id;
        });
      }

      // ✅ Fetch tasks
      const tasksResponse = await fetch(`${API_BASE_URL}/api/tasks/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        const allTasks = tasksData.results || tasksData || [];
        const projectIds = projects.map(p => p.id);
        tasks = allTasks.filter(t => projectIds.includes(t.project));
      }

      // ✅ Calculate stats
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
      const overdueTasks = tasks.filter(t => {
        if (t.status === 'completed') return false;
        return t.due_date && new Date(t.due_date) < new Date();
      }).length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // ✅ Project data for charts
      const projectData = projects.map(p => ({
        label: p.name,
        value: tasks.filter(t => t.project === p.id).length,
      })).filter(p => p.value > 0);

      // ✅ Weekly trend data
      const now = new Date();
      const weeklyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = tasks.filter(t => {
          const taskDate = new Date(t.created_at || t.due_date);
          return taskDate.toISOString().split('T')[0] === dateStr;
        });
        weeklyTrend.push({
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          value: dayTasks.length,
        });
      }

      // ✅ Team members count
      const teamMembers = new Set();
      tasks.forEach(t => {
        if (t.assigned_to) teamMembers.add(t.assigned_to);
      });

      setData({
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        overdueTasks,
        inProgressTasks,
        teamMembers: teamMembers.size,
        completionRate,
        projectData,
        taskData: [
          { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: 'bg-gray-500' },
          { label: 'In Progress', value: inProgressTasks, color: 'bg-blue-500' },
          { label: 'Completed', value: completedTasks, color: 'bg-emerald-500' },
          { label: 'Overdue', value: overdueTasks, color: 'bg-red-500' },
        ],
        weeklyTrend,
      });
    } catch (error) {
      console.error('❌ Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ✅ Quick Stats Summary
  const QuickSummary = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100/50">
      <div className="text-center">
        <p className="text-xs text-gray-500">Completion Rate</p>
        <p className="text-xl font-bold text-blue-600">{data.completionRate}%</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500">Active Projects</p>
        <p className="text-xl font-bold text-emerald-600">{data.activeProjects}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500">Team Members</p>
        <p className="text-xl font-bold text-purple-600">{data.teamMembers}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500">Overdue Tasks</p>
        <p className={`text-xl font-bold ${data.overdueTasks > 0 ? 'text-red-600' : 'text-gray-400'}`}>
          {data.overdueTasks}
        </p>
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <PresentationChartLineIcon className="w-7 h-7 text-indigo-500" />
                Analytics
              </h1>
              <p className="text-gray-500 text-sm">
                Performance metrics for your projects and team
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
                <CalendarIcon className="w-3 h-3 inline mr-1" />
                Last 30 days
              </span>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <UserGroupIcon className="w-3 h-3 inline mr-1" />
                {data.teamMembers} team members
              </span>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-3 text-gray-500">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Quick Summary */}
              <QuickSummary />

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Projects"
                  value={data.totalProjects}
                  icon={FolderIcon}
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                  subtitle={`${data.activeProjects} active`}
                  trend="up"
                  progress={data.totalProjects > 0 ? (data.activeProjects / data.totalProjects) * 100 : 0}
                />
                <StatCard
                  title="Tasks Completed"
                  value={data.completedTasks}
                  icon={CheckCircleIcon}
                  color="text-emerald-600"
                  bgColor="bg-emerald-50"
                  subtitle={`${data.completionRate}% completion rate`}
                  trend="up"
                  progress={data.completionRate}
                />
                <StatCard
                  title="In Progress"
                  value={data.inProgressTasks}
                  icon={ClockIcon}
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                  subtitle={`${data.totalTasks} total tasks`}
                  trend="neutral"
                />
                <StatCard
                  title="Overdue Tasks"
                  value={data.overdueTasks}
                  icon={ExclamationTriangleIcon}
                  color="text-red-600"
                  bgColor="bg-red-50"
                  subtitle={data.overdueTasks > 0 ? 'Needs attention' : 'All on track'}
                  trend={data.overdueTasks > 0 ? 'down' : 'up'}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart - Completion Rate */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">Task Completion</h3>
                  <p className="text-xs text-gray-400 mb-4">Overall task completion rate</p>
                  <div className="flex items-center justify-center">
                    <DonutChart 
                      completed={data.completedTasks} 
                      total={data.totalTasks} 
                      label="Completion Rate"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Completed</p>
                      <p className="text-lg font-bold text-emerald-600">{data.completedTasks}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Remaining</p>
                      <p className="text-lg font-bold text-gray-600">{data.totalTasks - data.completedTasks}</p>
                    </div>
                  </div>
                </div>

                {/* Task Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">Task Distribution</h3>
                  <p className="text-xs text-gray-400 mb-4">Breakdown by status</p>
                  <SimpleBarChart 
                    data={data.taskData} 
                    title="Task Status"
                    color="blue"
                  />
                </div>
              </div>

              {/* Weekly Trend & Project Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Trend */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">Weekly Activity</h3>
                  <p className="text-xs text-gray-400 mb-4">Tasks created per day</p>
                  <SimpleBarChart 
                    data={data.weeklyTrend} 
                    title="Tasks Created"
                    color="purple"
                  />
                </div>

                {/* Project Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">Project Distribution</h3>
                  <p className="text-xs text-gray-400 mb-4">Tasks per project</p>
                  <SimpleBarChart 
                    data={data.projectData} 
                    title="Projects"
                    color="emerald"
                  />
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Projects</p>
                    <p className="text-xl font-bold text-gray-900">{data.totalProjects}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Active Projects</p>
                    <p className="text-xl font-bold text-emerald-600">{data.activeProjects}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completion Rate</p>
                    <p className="text-xl font-bold text-blue-600">{data.completionRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Team Efficiency</p>
                    <p className="text-xl font-bold text-purple-600">
                      {data.totalTasks > 0 && data.teamMembers > 0 
                        ? Math.round(data.totalTasks / data.teamMembers) 
                        : 0} avg tasks/member
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagerAnalytics;