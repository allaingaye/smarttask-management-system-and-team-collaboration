// src/pages/AuditLogs.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  DocumentTextIcon,
  ClockIcon,
  UserCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  XMarkIcon,
  UserGroupIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";

// ✅ Action Icons Mapping
const getActionIcon = (action) => {
  const actionLower = action?.toLowerCase() || '';
  if (actionLower.includes('create')) return <PlusIcon className="w-4 h-4 text-emerald-500" />;
  if (actionLower.includes('update') || actionLower.includes('edit') || actionLower.includes('change')) 
    return <PencilIcon className="w-4 h-4 text-blue-500" />;
  if (actionLower.includes('delete') || actionLower.includes('remove')) 
    return <TrashIcon className="w-4 h-4 text-red-500" />;
  if (actionLower.includes('view') || actionLower.includes('read')) 
    return <EyeIcon className="w-4 h-4 text-gray-500" />;
  if (actionLower.includes('login') || actionLower.includes('logout')) 
    return <UserCircleIcon className="w-4 h-4 text-purple-500" />;
  if (actionLower.includes('assign')) 
    return <UserGroupIcon className="w-4 h-4 text-indigo-500" />;
  return <DocumentTextIcon className="w-4 h-4 text-gray-400" />;
};

// ✅ Action Colors Mapping
const getActionColor = (action) => {
  const actionLower = action?.toLowerCase() || '';
  if (actionLower.includes('create')) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (actionLower.includes('update') || actionLower.includes('edit') || actionLower.includes('change')) 
    return "bg-blue-100 text-blue-700 border-blue-200";
  if (actionLower.includes('delete') || actionLower.includes('remove')) 
    return "bg-red-100 text-red-700 border-red-200";
  if (actionLower.includes('view') || actionLower.includes('read')) 
    return "bg-gray-100 text-gray-700 border-gray-200";
  if (actionLower.includes('login') || actionLower.includes('logout')) 
    return "bg-purple-100 text-purple-700 border-purple-200";
  if (actionLower.includes('assign')) 
    return "bg-indigo-100 text-indigo-700 border-indigo-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
};

// ✅ Get Type Icon
const getTypeIcon = (type) => {
  switch(type?.toLowerCase()) {
    case 'project': return <FolderIcon className="w-3 h-3" />;
    case 'task': return <ClipboardDocumentListIcon className="w-3 h-3" />;
    case 'user': return <UserCircleIcon className="w-3 h-3" />;
    case 'settings': return <Cog6ToothIcon className="w-3 h-3" />;
    default: return <DocumentTextIcon className="w-3 h-3" />;
  }
};

// ✅ Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
      <div className="text-sm text-gray-500">
        Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDoubleLeftIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              page === currentPage
                ? "bg-indigo-600 text-white"
                : page === "..."
                ? "text-gray-400 cursor-default"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            disabled={page === "..."}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function AuditLogs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(20);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // ✅ Fetch audit logs from backend
  const fetchAuditLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Please login to view audit logs");
        navigate("/login");
        return;
      }

      let url = `${API_BASE_URL}/api/list-audit-logs/?page=${page}&page_size=${pageSize}`;
      
      // ✅ Add filters
      if (actionFilter !== "all") {
        url += `&action=${encodeURIComponent(actionFilter)}`;
      }
      if (typeFilter !== "all") {
        url += `&type=${encodeURIComponent(typeFilter)}`;
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast.error("You don't have permission to view audit logs");
          navigate("/dashboard");
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // ✅ Transform backend data to match frontend format
      const formattedActivities = (data.results || []).map(item => ({
        id: item.id,
        user: item.actor__username || "System",
        action: item.action || "Unknown",
        target: item.target_user__username || "N/A",
        time: formatTime(item.timestamp),
        timestamp: item.timestamp,
        type: item.type || "system",
        details: item.details || "",
      }));

      setActivities(formattedActivities);
      setTotalItems(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
      setCurrentPage(page);

    } catch (error) {
      console.error("❌ Failed to fetch audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, navigate, pageSize, actionFilter, typeFilter, searchTerm]);

  // ✅ Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ✅ Refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchAuditLogs(currentPage);
    setIsRefreshing(false);
    toast.success("Audit logs refreshed!");
  };

  // ✅ Handle page change
  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchAuditLogs(page);
    }
  };

  // ✅ Initial fetch
  useEffect(() => {
    fetchAuditLogs(1);
  }, [fetchAuditLogs]);

  // ✅ Filtered activities
  const filteredActivities = activities;

  // ✅ Get unique action types for filter
  const uniqueActions = ["all", ...new Set(activities.map(a => a.action))];

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
                <DocumentTextIcon className="w-7 h-7 text-indigo-500" />
                Audit Logs
              </h1>
              <p className="text-gray-500 text-sm">
                Track all user activities, system events, and changes in real-time
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 disabled:opacity-50"
                title="Refresh"
              >
                <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <span className="text-xs text-gray-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live</span>
              </span>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex-1 min-w-[200px] relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  fetchAuditLogs(1);
                }}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  fetchAuditLogs(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="all">All Actions</option>
                {uniqueActions.filter(a => a !== "all").map((action) => (
                  <option key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500 ml-auto">
              {totalItems} activity{totalItems !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Activities Feed */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                <p className="mt-3 text-gray-500">Loading activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No activities recorded</h3>
                <p className="text-gray-400 mt-1">Activities will appear here as users interact with the system</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center p-4 hover:bg-gray-50/80 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                      <UserCircleIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-medium text-gray-900">{activity.user}</span>
                        <span className="text-sm text-gray-500">{activity.action}</span>
                        <span className="font-medium text-gray-700">{activity.target}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${getActionColor(activity.action)}`}>
                          {getActionIcon(activity.action)}
                          {activity.action}
                        </span>
                        {activity.type && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            {getTypeIcon(activity.type)}
                            {activity.type}
                          </span>
                        )}
                      </div>
                      {activity.details && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{activity.details}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400 flex-shrink-0 ml-4">
                      <ClockIcon className="w-4 h-4" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Pagination */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between px-6 py-4">
              <div className="text-xs text-gray-400">
                Showing {activities.length} of {totalItems} activities
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>Retention: 30 days</span>
                <span className="w-px h-4 bg-gray-200"></span>
                <button
                  onClick={() => toast.info("Exporting audit log...")}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Export Log
                </button>
              </div>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              pageSize={pageSize}
            />
          </div>
        </main>
      </div>
    </div>
  );
}