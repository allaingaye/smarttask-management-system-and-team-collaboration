// src/pages/RolesAccess.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  UserGroupIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  KeyIcon,
  UsersIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  EyeIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { ShieldCheckIcon as ShieldCheckSolid } from "@heroicons/react/24/solid";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";

// ✅ Animated Counter
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
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{count}</span>;
};

// ✅ KPI Card
const KPICard = ({ title, value, icon: Icon, color, bgColor, subtitle }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            <AnimatedCounter value={value} />
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
};

// ✅ Role Badge Component
const RoleBadge = ({ role }) => {
  const styles = {
    Admin: "bg-purple-100 text-purple-700 border-purple-200",
    Manager: "bg-blue-100 text-blue-700 border-blue-200",
    Member: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  
  const icons = {
    Admin: <ShieldCheckIcon className="w-3 h-3" />,
    Manager: <UserGroupIcon className="w-3 h-3" />,
    Member: <UserCircleIcon className="w-3 h-3" />,
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex items-center space-x-1 ${styles[role] || styles.Member}`}>
      {icons[role]}
      <span>{role}</span>
    </span>
  );
};

// ✅ Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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
        Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems} users
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
                ? "bg-violet-600 text-white"
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

// ✅ Access Denied Component
const AccessDenied = ({ role }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <NoSymbolIcon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">Access Restricted</h3>
      <p className="text-gray-500 text-center mt-2 max-w-md">
        You don't have permission to view this page. 
        This area is restricted to <span className="font-medium text-purple-600">Administrators</span> only.
      </p>
      <div className="mt-6 flex items-center space-x-2">
        <span className="text-sm text-gray-400">Your role:</span>
        <RoleBadge role={role} />
      </div>
    </div>
  );
};

// ✅ User Table Component with Pagination
const UsersTable = ({ users, onEditRole, userRole, pagination, showActions = true }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
      {/* Search & Filter */}
      <div className="p-4 border-b border-gray-100/80 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-4 h-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm bg-white"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Member">Member</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 ml-auto">
          {filteredUsers.length} users found
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 5 : 4} className="px-6 py-12 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{user.username}</span>
                      {user.id === parseInt(localStorage.getItem("user_id") || "0") && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email || "—"}</td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center space-x-1 text-xs text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Active</span>
                    </span>
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onEditRole(user)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          userRole === "Admin"
                            ? "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                            : "text-gray-300 cursor-not-allowed"
                        }`}
                        disabled={userRole !== "Admin"}
                        title="Edit Role"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
        />
      )}
    </div>
  );
};

// ✅ Edit Role Modal
const EditRoleModal = ({ user, onClose, onSave }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || "Member");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(user.id, selectedRole);
      toast.success(`Role updated to ${selectedRole} for ${user.username}`);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Edit User Role</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Select Role</label>
            <div className="grid grid-cols-3 gap-3">
              {["Admin", "Manager", "Member"].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    selectedRole === role
                      ? "border-violet-500 bg-violet-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    {role === "Admin" && <ShieldCheckSolid className="w-6 h-6 text-purple-600" />}
                    {role === "Manager" && <UserGroupIcon className="w-6 h-6 text-blue-600" />}
                    {role === "Member" && <UserCircleIcon className="w-6 h-6 text-emerald-600" />}
                    <span className="text-xs font-medium text-gray-700">{role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
            >
              {loading ? "Saving..." : "Update Role"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RolesAccess() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState("Member");
  const [userData, setUserData] = useState(null);
  const [editUser, setEditUser] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 10;

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // ✅ Get current user info
  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/me/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
        setUserData(data);
        localStorage.setItem("user_role", data.role);
        localStorage.setItem("user_id", data.id);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  }, [API_BASE_URL]);

  // ✅ Fetch users based on role
  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      // ✅ Different endpoints for different roles
      let endpoint = "";
      if (userRole === "Admin") {
        endpoint = `${API_BASE_URL}/api/list-users/?page=${page}&page_size=${pageSize}`;
      } else if (userRole === "Manager") {
        // ✅ Managers can only see Members
        endpoint = `${API_BASE_URL}/api/users/?role=Member&page=${page}&page_size=${pageSize}`;
      } else {
        // ✅ Members can only see themselves
        endpoint = `${API_BASE_URL}/api/users/?page=${page}&page_size=${pageSize}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast.error("You don't have permission to view users");
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // ✅ Handle different response formats
      let results = data.results || [];
      let count = data.count || 0;
      
      // ✅ For non-admin roles, wrap the response
      if (userRole !== "Admin" && !data.results) {
        results = Array.isArray(data) ? data : [data];
        count = results.length;
      }
      
      setUsers(results);
      setTotalUsers(count);
      setTotalPages(Math.ceil(count / pageSize));
      setCurrentPage(page);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, navigate, pageSize, userRole]);

  // ✅ Update user role (Admin only)
  const updateUserRole = async (userId, newRole) => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/api/auth/update-role/${userId}/`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: newRole }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update role");
    }

    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
  };

  // ✅ Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchCurrentUser();
    await fetchUsers(currentPage);
    setRefreshing(false);
    toast.success("Data refreshed!");
  };

  // ✅ Handle page change
  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchUsers(page);
    }
  };

  // ✅ Initial fetch - depends on userRole
  useEffect(() => {
    if (userRole) {
      fetchUsers(1);
    }
  }, [userRole, fetchUsers]);

  // ✅ Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // ✅ Permission definitions (Admin only)
  const permissions = [
    { id: 1, name: "View Users", roles: ["Admin", "Manager", "Member"] },
    { id: 2, name: "Manage Users", roles: ["Admin"] },
    { id: 3, name: "Manage Roles", roles: ["Admin"] },
    { id: 4, name: "View Audit Logs", roles: ["Admin"] },
    { id: 5, name: "Create Projects", roles: ["Admin", "Manager"] },
    { id: 6, name: "Edit Projects", roles: ["Admin", "Manager"] },
    { id: 7, name: "Delete Projects", roles: ["Admin", "Manager"] },
    { id: 8, name: "Create Tasks", roles: ["Admin", "Manager", "Member"] },
    { id: 9, name: "Assign Tasks", roles: ["Admin", "Manager"] },
    { id: 10, name: "Delete Tasks", roles: ["Admin", "Manager"] },
  ];

  const roles = [
    { name: "Admin", description: "Full system access", icon: ShieldCheckIcon },
    { name: "Manager", description: "Manage projects and tasks", icon: UserGroupIcon },
    { name: "Member", description: "Work on assigned tasks", icon: UserCircleIcon },
  ];

  const adminCount = users.filter(u => u.role === "Admin").length;
  const managerCount = users.filter(u => u.role === "Manager").length;
  const memberCount = users.filter(u => u.role === "Member").length;

  // ✅ Role-based rendering
  const isAdmin = userRole === "Admin";
  const isManager = userRole === "Manager";
  const isMember = userRole === "Member";

  // ✅ If not Admin, show limited view
  if (!isAdmin && !isManager && !isMember) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            <AccessDenied role={userRole} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <ShieldCheckSolid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isAdmin ? "Roles & Access" : isManager ? "Team Members" : "My Profile"}
                </h1>
                <p className="text-gray-500 text-sm">
                  {isAdmin 
                    ? "Manage user roles and permissions across the platform"
                    : isManager 
                    ? "View and manage your team members"
                    : "View your profile information"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="p-2.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all duration-200 disabled:opacity-50"
                title="Refresh"
              >
                <ArrowPathIcon className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              <RoleBadge role={userRole} />
            </div>
          </div>

          {/* ✅ Admin View - Full Access */}
          {isAdmin && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                  title="Total Users"
                  value={totalUsers}
                  icon={UsersIcon}
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                  subtitle="Active users"
                />
                <KPICard
                  title="Admins"
                  value={adminCount}
                  icon={ShieldCheckIcon}
                  color="text-purple-600"
                  bgColor="bg-purple-50"
                  subtitle="Full system access"
                />
                <KPICard
                  title="Managers"
                  value={managerCount}
                  icon={UserGroupIcon}
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                  subtitle="Project managers"
                />
                <KPICard
                  title="Members"
                  value={memberCount}
                  icon={UserCircleIcon}
                  color="text-emerald-600"
                  bgColor="bg-emerald-50"
                  subtitle="Team members"
                />
              </div>

              {/* Permission Matrix - Admin Only */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <KeyIcon className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Permission Matrix</h2>
                  </div>
                  <span className="text-xs text-gray-400">Admin view only</span>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/80 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permission</th>
                          {roles.map((role) => (
                            <th key={role.name} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex flex-col items-center">
                                <role.icon className="w-4 h-4" />
                                <span className="mt-1">{role.name}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {permissions.map((permission) => (
                          <tr key={permission.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-3 text-sm text-gray-700">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-400">•</span>
                                <span>{permission.name}</span>
                              </div>
                            </td>
                            {roles.map((role) => {
                              const hasPermission = permission.roles?.includes(role.name);
                              return (
                                <td key={`${permission.id}-${role.name}`} className="px-4 py-3 text-center">
                                  {hasPermission ? (
                                    <CheckCircleIcon className="w-5 h-5 text-emerald-500 mx-auto" />
                                  ) : (
                                    <XCircleIcon className="w-5 h-5 text-gray-300 mx-auto" />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ✅ Manager View - Limited Access */}
          {isManager && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <KPICard
                title="Team Members"
                value={totalUsers}
                icon={UserGroupIcon}
                color="text-blue-600"
                bgColor="bg-blue-50"
                subtitle="Your team"
              />
              <KPICard
                title="Managers"
                value={managerCount}
                icon={ShieldCheckIcon}
                color="text-purple-600"
                bgColor="bg-purple-50"
                subtitle="Management"
              />
              <KPICard
                title="Members"
                value={memberCount}
                icon={UserCircleIcon}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
                subtitle="Team members"
              />
            </div>
          )}

          {/* ✅ Users Table - Different views for different roles */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <UsersIcon className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {isAdmin ? "Users" : isManager ? "Team Members" : "Your Profile"}
                </h2>
              </div>
              <span className="text-xs text-gray-400">
                {isAdmin ? "Click pencil icon to edit roles" : isManager ? "View only" : "Personal info"}
              </span>
            </div>
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-violet-500 border-t-transparent"></div>
                <p className="mt-3 text-gray-500">Loading...</p>
              </div>
            ) : (
              <UsersTable
                users={users}
                onEditRole={setEditUser}
                userRole={userRole}
                showActions={isAdmin}
                pagination={{
                  currentPage,
                  totalPages,
                  onPageChange: handlePageChange,
                  totalItems: totalUsers,
                  pageSize,
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Edit Role Modal - Admin Only */}
      {editUser && isAdmin && (
        <EditRoleModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={updateUserRole}
        />
      )}
    </div>
  );
}