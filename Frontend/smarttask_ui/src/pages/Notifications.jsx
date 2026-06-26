// src/pages/Notifications.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowPathIcon,
  CalendarIcon,
  UserCircleIcon,
  TagIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  FolderIcon,
  AtSymbolIcon,
  InformationCircleIcon,
  MegaphoneIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import {
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckSolid,
  FolderIcon as FolderSolid,
  AtSymbolIcon as AtSymbolSolid,
  InformationCircleIcon as InformationCircleSolid,
  MegaphoneIcon as MegaphoneSolid,
} from "@heroicons/react/24/solid";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import { playNotificationSound } from "../utils/sound";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wsStatus, setWsStatus] = useState("Connecting...");
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [apiError, setApiError] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  // ✅ FIXED: Correct API URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // ✅ Format time with relative time
  const formatTime = useCallback((timestamp) => {
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
      year: 'numeric'
    });
  }, []);

  // ✅ Fetch past notifications from REST API
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        console.warn("⚠️ No access token found");
        toast.error("Please login to view notifications");
        navigate("/login");
        setIsLoading(false);
        return;
      }

      const url = `${API_BASE_URL}/api/notifications/`;
      console.log("🔍 Fetching notifications from:", url);
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
      
      console.log("📡 Response status:", response.status);
      
      if (response.status === 401) {
        console.error("❌ Unauthorized - token expired");
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        navigate("/login");
        setIsLoading(false);
        return;
      }
      
      if (response.status === 404) {
        console.error("❌ API endpoint not found. Check your Django URLs.");
        setApiError({
          message: "API endpoint not found",
          details: "Make sure Django is running and the URL is correct",
        });
        toast.error("API endpoint not found. Please check server configuration.");
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        const text = await response.text();
        console.error("❌ Response error:", text.substring(0, 200));
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("📦 Data received:", data);
      
      let notifs = [];
      if (Array.isArray(data)) {
        notifs = data;
        console.log("✅ Data is an array with", notifs.length, "items");
      } else if (data.results) {
        notifs = data.results;
        console.log("✅ Data has results with", notifs.length, "items");
      } else {
        console.warn("⚠️ Unexpected data format:", typeof data);
        notifs = [];
      }
      
      console.log("✅ Notifications loaded:", notifs.length);
      setNotifications(notifs);
      
      const unread = notifs.filter(n => n.unread).length;
      setUnreadCount(unread);
      console.log("✅ Unread count:", unread);
      
      if (notifs.length > 0) {
        toast.success(`📬 ${notifs.length} notifications loaded`, { 
          duration: 2000,
          icon: "📬",
        });
      }
      
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
      setApiError({
        message: err.message || "Failed to load notifications",
        details: "Please check your server connection",
      });
      toast.error(`Failed to load notifications: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, navigate]);

  // ✅ Refresh notifications
  const refreshNotifications = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
  };

  // ✅ Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ✅ WebSocket connection with auto-reconnect
  useEffect(() => {
    let isMounted = true;
    
    const connectWebSocket = () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setWsStatus("No token");
        return;
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname === "localhost" ? "127.0.0.1" : window.location.hostname;
      const port = "8000";
      
      const wsUrl = `${protocol}//${host}:${port}/ws/notifications/?token=${token}`;
      
      console.log(`🔗 Connecting to WebSocket: ${wsUrl}`);
      setWsStatus("Connecting...");

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket connected");
        setWsStatus("Connected ✅");
        toast.success("🔔 Connected to notification service", {
          duration: 2000,
          icon: "✅",
        });
        
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📩 Incoming WebSocket message:", data);
          
          if (data.type === "connection") {
            console.log("📡 Connection established:", data.message);
            return;
          }

          const enriched = {
            id: data.id || Date.now(),
            title: data.title || "Notification",
            body: data.body || "",
            type: data.type || "info",
            unread: data.unread ?? true,
            time: data.time || new Date().toISOString().replace('T', ' ').substring(0, 19),
          };

          showToastNotification(enriched);

          if (enriched.type === "task" || enriched.type === "mention") {
            playNotificationSound(enriched.type);
          }

          if (isMounted) {
            setNotifications((prev) => {
              const exists = prev.some(n => n.id === enriched.id);
              if (exists) return prev;
              return [enriched, ...prev];
            });
            setUnreadCount(prev => prev + 1);
          }
          
        } catch (err) {
          console.error("❌ Failed to parse WebSocket message:", event.data, err);
        }
      };

      socket.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        setWsStatus("Error ❌");
        toast.error("WebSocket connection error");
      };

      socket.onclose = (event) => {
        console.log(`🔌 WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
        setWsStatus("Disconnected 🔌");
        
        if (isMounted && event.code !== 1000) {
          reconnectTimerRef.current = setTimeout(() => {
            console.log("🔄 Attempting to reconnect...");
            connectWebSocket();
          }, 3000);
        }
      };
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close(1000, "Component unmounting");
      }
    };
  }, []);

  // ✅ Show toast notification with different styles
  const showToastNotification = (notification) => {
    const { type, title, body } = notification;
    
    const getIcon = () => {
      switch(type) {
        case "task": return "🔔";
        case "project": return "📁";
        case "mention": return "@";
        case "summary": return "ℹ️";
        default: return "📢";
      }
    };

    const getBorderColor = () => {
      switch(type) {
        case "task": return "#3B82F6";
        case "mention": return "#8B5CF6";
        case "project": return "#10B981";
        case "summary": return "#F59E0B";
        default: return "#6B7280";
      }
    };

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          style={{
            padding: "0",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            borderLeft: `4px solid ${getBorderColor()}`,
            minWidth: "320px",
          }}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <span className="text-2xl">{getIcon()}</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {title}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {body}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              ✕
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-right",
      }
    );
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const url = `${API_BASE_URL}/api/notifications/mark-read/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
      }
      
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, unread: false }))
      );
      setUnreadCount(0);
      toast.success("✅ All notifications marked as read", {
        duration: 2000,
        icon: "📚",
      });
      
    } catch (err) {
      console.error("❌ Failed to mark all as read:", err);
      toast.error("Failed to mark all as read");
    }
  };

  // ✅ Mark single notification as read
  const markNotificationAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const url = `${API_BASE_URL}/api/notifications/${id}/mark-read/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, unread: false } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (err) {
      console.error(`❌ Failed to mark notification ${id} as read:`, err);
      toast.error("Failed to mark as read");
    }
  };

  // ✅ Get icon for notification type - MODERN HEROICONS
  const getNotificationIcon = (type, unread = true) => {
    const iconClass = `w-6 h-6 ${unread ? 'text-blue-600' : 'text-gray-400'}`;
    
    switch(type) {
      case "task":
        return <ClipboardDocumentCheckIcon className={iconClass} />;
      case "project":
        return <FolderIcon className={iconClass} />;
      case "mention":
        return <AtSymbolIcon className={iconClass} />;
      case "summary":
        return <InformationCircleIcon className={iconClass} />;
      default:
        return <MegaphoneIcon className={iconClass} />;
    }
  };

  // ✅ Get icon background color
  const getIconBg = (type, unread = true) => {
    if (!unread) return "bg-gray-100";
    
    switch(type) {
      case "task": return "bg-blue-100";
      case "project": return "bg-emerald-100";
      case "mention": return "bg-purple-100";
      case "summary": return "bg-amber-100";
      default: return "bg-indigo-100";
    }
  };

  // ✅ Get status badge color
  const getStatusBadgeColor = (type) => {
    switch(type) {
      case "task": return "bg-blue-50 text-blue-600 border-blue-200";
      case "project": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "mention": return "bg-purple-50 text-purple-600 border-purple-200";
      case "summary": return "bg-amber-50 text-amber-600 border-amber-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // ✅ Get background color for notification
  const getNotificationBg = (unread) => {
    return unread ? "bg-blue-50/30 hover:bg-blue-50/60" : "hover:bg-gray-50";
  };

  // ✅ Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filterType === "all") return true;
    return n.type === filterType;
  });

  // ✅ Filter options with Heroicons
  const filterOptions = [
    { value: "all", label: "All", icon: ClipboardDocumentCheckIcon },
    { value: "task", label: "Tasks", icon: ClipboardDocumentCheckIcon },
    { value: "project", label: "Projects", icon: FolderIcon },
    { value: "mention", label: "Mentions", icon: AtSymbolIcon },
    { value: "summary", label: "Summaries", icon: InformationCircleIcon },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* ✅ Toast Container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 5000,
          style: {
            background: "#fff",
            color: "#333",
            padding: "0",
          },
        }}
      />

      {/* Sidebar with unread count */}
      <Sidebar active="Notifications" unreadCount={unreadCount} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar notifications={notifications} unreadCount={unreadCount} />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-500 text-sm">
                Stay on top of changes to your tasks and projects
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshNotifications}
                disabled={isRefreshing}
                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 disabled:opacity-50"
                title="Refresh"
              >
                <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  unreadCount > 0
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Mark all as read</span>
              </button>
            </div>
          </div>

          {/* Status and Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center space-x-1.5 ${
                wsStatus.includes("Connected") 
                  ? "bg-emerald-50 text-emerald-700" 
                  : wsStatus.includes("Error") 
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                <span className={`w-2 h-2 rounded-full ${wsStatus.includes("Connected") ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span>{wsStatus}</span>
              </span>
              {unreadCount > 0 && (
                <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium animate-pulse flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                  <span>{unreadCount} unread</span>
                </span>
              )}
              <span className="text-xs text-gray-400">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 bg-gray-50/80 rounded-xl p-1">
              <FunnelIcon className="w-4 h-4 text-gray-400 ml-1.5 mr-0.5" />
              {filterOptions.map((option) => {
                const IconComponent = option.icon;
                const isActive = filterType === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 flex items-center space-x-1.5 ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/60"
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Failed to load notifications</p>
                <p className="text-xs text-red-600 mt-1">{apiError.details}</p>
                <button
                  onClick={() => {
                    setApiError(null);
                    fetchNotifications();
                  }}
                  className="mt-2 text-xs text-red-700 hover:text-red-900 font-medium underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Notifications feed */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 divide-y divide-gray-100/60 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-3 text-gray-500">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <BellIcon className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">All caught up!</h3>
                <p className="text-gray-400 mt-2">
                  {filterType !== "all" 
                    ? `No ${filterType} notifications found` 
                    : "No notifications to display"}
                </p>
                {filterType !== "all" && (
                  <button
                    onClick={() => setFilterType("all")}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all notifications →
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start p-5 space-x-4 cursor-pointer transition-all duration-200 ${getNotificationBg(n.unread)} ${
                    selectedNotification === n.id ? 'ring-2 ring-blue-500 ring-inset' : ''
                  }`}
                  onClick={() => {
                    if (n.unread) markNotificationAsRead(n.id);
                    setSelectedNotification(n.id);
                  }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBg(n.type, n.unread)}`}
                  >
                    {getNotificationIcon(n.type, n.unread)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold truncate ${n.unread ? "text-gray-900" : "text-gray-500"}`}>
                            {n.title}
                          </span>
                          {n.unread && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm break-words mt-0.5">{n.body}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatTime(n.time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusBadgeColor(n.type)}`}>
                        {n.type}
                      </span>
                    </div>
                  </div>
                  {n.unread && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(n.id);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium flex-shrink-0 self-start mt-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Floating toolbar - optional */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-6 py-2.5 flex space-x-6 border border-gray-100/60">
            <button className="text-gray-500 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded-lg" title="Link">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </button>
            <button className="text-gray-500 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded-lg" title="Task">
              <ClipboardDocumentCheckIcon className="w-5 h-5" />
            </button>
            <button className="text-gray-500 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded-lg" title="Edit">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button className="text-gray-500 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded-lg" title="Comment">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}