// src/pages/manager/ManagerProjects.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';

const ManagerProjects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  
  // ✅ Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'active',
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // ✅ Helper: Get user ID from various possible sources
  const getUserId = useCallback(() => {
    if (!user) return null;
    
    // Try multiple possible ID fields
    const userId = user?.id || 
                  user?.userId || 
                  user?.user_id || 
                  user?.pk || 
                  user?.uid ||
                  user?.sub;
    
    // If it's an object with an id property
    if (typeof userId === 'object' && userId !== null) {
      return userId.id || userId.pk || null;
    }
    
    return userId;
  }, [user]);

  // ✅ Helper: Get user display name
  const getUserDisplayName = useCallback(() => {
    if (!user) return 'Unknown User';
    return user?.name || user?.username || user?.email || 'User';
  }, [user]);

  // ✅ Fetch projects owned by manager
  const fetchProjects = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log('🔍 Fetching all projects...');
      const response = await fetch(`${API_BASE_URL}/api/projects/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allProjects = data.results || data || [];
        
        console.log('📦 Total projects from API:', allProjects.length);
        console.log('👤 Current user:', user);
        
        // ✅ Filter projects owned by this manager
        const userId = getUserId();
        console.log('🔑 Using user ID for filtering:', userId);
        
        if (!userId) {
          console.warn('⚠️ No user ID found, showing all projects');
          setProjects(allProjects);
        } else {
          const managerProjects = allProjects.filter(p => {
            const managerId = p.manager?.id || p.manager;
            return String(managerId) === String(userId);
          });
          
          console.log('✅ Filtered manager projects:', managerProjects.length);
          setProjects(managerProjects);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || errorData.detail || `Failed to load projects (${response.status})`;
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Failed to fetch projects:', error);
      const errorMsg = error.message || 'Failed to load projects';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_BASE_URL, user, getUserId]);

  // ✅ Create project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      toast.error('User ID not found. Please login again.');
      console.error('❌ No user ID available:', user);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        setIsSubmitting(false);
        return;
      }
      
      const projectData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        status: formData.status || 'active',
        manager: userId,
      };
      
      console.log('📤 Creating project with data:', projectData);
      console.log('👤 Manager ID being sent:', userId);
      
      const response = await fetch(`${API_BASE_URL}/api/projects/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const responseData = await response.json().catch(() => ({}));
      console.log('📥 Create response status:', response.status);
      console.log('📥 Create response data:', responseData);

      if (response.ok) {
        toast.success('🎉 Project created successfully!');
        setShowCreateModal(false);
        resetForm();
        await fetchProjects(false);
      } else {
        // Extract detailed error message
        let errorMsg = 'Failed to create project';
        if (responseData.message) errorMsg = responseData.message;
        else if (responseData.detail) errorMsg = responseData.detail;
        else if (responseData.error) errorMsg = responseData.error;
        else if (typeof responseData === 'string') errorMsg = responseData;
        else if (responseData.errors) {
          // Handle validation errors
          const errors = Object.values(responseData.errors).flat();
          errorMsg = errors.join(', ');
        }
        
        toast.error(errorMsg);
        console.error('❌ Server error:', responseData);
      }
    } catch (error) {
      console.error('❌ Failed to create project:', error);
      toast.error(`Failed to create project: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Update project
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    
    if (!selectedProject?.name?.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      toast.error('User ID not found. Please login again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const updateData = {
        name: selectedProject.name.trim(),
        description: selectedProject.description?.trim() || '',
        start_date: selectedProject.start_date || null,
        end_date: selectedProject.end_date || null,
        status: selectedProject.status || 'active',
        manager: userId,
      };
      
      console.log('📤 Updating project:', selectedProject.id, updateData);
      
      const response = await fetch(`${API_BASE_URL}/api/projects/${selectedProject.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success('✅ Project updated successfully!');
        setShowEditModal(false);
        setSelectedProject(null);
        await fetchProjects(false);
      } else {
        let errorMsg = 'Failed to update project';
        if (responseData.message) errorMsg = responseData.message;
        else if (responseData.detail) errorMsg = responseData.detail;
        else if (responseData.error) errorMsg = responseData.error;
        toast.error(errorMsg);
        console.error('❌ Update error:', responseData);
      }
    } catch (error) {
      console.error('❌ Failed to update project:', error);
      toast.error(`Failed to update project: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'active',
    });
  };

  // ✅ Load projects on mount and user change
  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setLoading(false);
      setError('Please login to view your projects');
    }
  }, [user, fetchProjects]);

  // ✅ Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ Status utilities
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      archived: 'bg-gray-100 text-gray-700 border-gray-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <ClockIcon className="w-3 h-3" />,
      completed: <CheckCircleIcon className="w-3 h-3" />,
      archived: <ArchiveBoxIcon className="w-3 h-3" />,
      pending: <ClockIcon className="w-3 h-3" />,
      cancelled: <XMarkIcon className="w-3 h-3" />,
    };
    return icons[status] || null;
  };

  const getInitials = (name) => {
    if (!name) return 'P';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // ✅ Render loading skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ✅ Render empty state
  const renderEmptyState = () => (
    <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-sm">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <FolderIcon className="w-12 h-12 text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {searchTerm || statusFilter !== 'all' ? 'No matching projects' : 'No projects yet'}
      </h3>
      <p className="text-gray-500 max-w-sm mx-auto mb-6">
        {searchTerm || statusFilter !== 'all' 
          ? 'Try adjusting your search or filters to find what you\'re looking for' 
          : 'Get started by creating your first project'}
      </p>
      {!searchTerm && statusFilter === 'all' && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 flex items-center space-x-2 mx-auto"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create Project</span>
        </button>
      )}
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
                <span>📁 My Projects</span>
                {projects.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {projects.length}
                  </span>
                )}
              </h1>
              <p className="text-gray-500 text-sm">
                {user ? `Welcome back, ${getUserDisplayName()}` : 'Please login to manage your projects'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchProjects(false)}
                disabled={refreshing}
                className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 disabled:opacity-50"
                title="Refresh projects"
              >
                <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={() => fetchProjects()}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try again →
                </button>
              </div>
            </div>
          )}

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="flex-1 min-w-[200px] relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 hover:bg-white transition-colors cursor-pointer"
              >
                <option value="all">📊 All Status</option>
                <option value="active">🟢 Active</option>
                <option value="pending">🟡 Pending</option>
                <option value="completed">🔵 Completed</option>
                <option value="archived">⚪ Archived</option>
                <option value="cancelled">🔴 Cancelled</option>
              </select>
            </div>
            <div className="text-sm text-gray-500 ml-auto bg-gray-50 px-3 py-1.5 rounded-lg">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            renderSkeleton()
          ) : filteredProjects.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {getInitials(project.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {project.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border ${getStatusColor(project.status)} flex-shrink-0 ml-2`}>
                        {getStatusIcon(project.status)}
                        <span className="capitalize">{project.status}</span>
                      </span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                      <div className="text-gray-500">
                        <span className="font-medium">Due:</span>{' '}
                        {formatDate(project.end_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/manager/projects/${project.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Project"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProject({
                              ...project,
                              start_date: project.start_date || '',
                              end_date: project.end_date || '',
                              status: project.status || 'active',
                            });
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Project"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ✅ Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <PlusIcon className="w-5 h-5 text-blue-600" />
                Create New Project
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Enter project description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="active">🟢 Active</option>
                  <option value="pending">🟡 Pending</option>
                  <option value="completed">🔵 Completed</option>
                  <option value="archived">⚪ Archived</option>
                  <option value="cancelled">🔴 Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium shadow-lg shadow-blue-500/25"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Edit Project Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <PencilIcon className="w-5 h-5 text-indigo-600" />
                Edit Project
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProject(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProject} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={selectedProject.name || ''}
                  onChange={(e) => setSelectedProject({ ...selectedProject, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={selectedProject.description || ''}
                  onChange={(e) => setSelectedProject({ ...selectedProject, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={selectedProject.start_date || ''}
                    onChange={(e) => setSelectedProject({ ...selectedProject, start_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={selectedProject.end_date || ''}
                    onChange={(e) => setSelectedProject({ ...selectedProject, end_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={selectedProject.status || 'active'}
                  onChange={(e) => setSelectedProject({ ...selectedProject, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="active">🟢 Active</option>
                  <option value="pending">🟡 Pending</option>
                  <option value="completed">🔵 Completed</option>
                  <option value="archived">⚪ Archived</option>
                  <option value="cancelled">🔴 Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProject(null);
                  }}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium shadow-lg shadow-blue-500/25"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerProjects;