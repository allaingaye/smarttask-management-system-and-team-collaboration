// src/components/Topbar/Topbar.jsx
import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Topbar({ notifications = [], unreadCount = 0 }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center flex-1">
        {/* Page title - can be dynamic */}
        <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className={`relative transition-all duration-300 ${isSearchOpen ? "w-64" : "w-8"}`}>
          <input
            type="text"
            placeholder="Search..."
            className={`w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              isSearchOpen ? "opacity-100" : "opacity-0 w-0"
            }`}
            onBlur={() => setIsSearchOpen(false)}
          />
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="absolute left-2 top-2 text-gray-400 hover:text-gray-600"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Notification Bell with Badge */}
        <div className="relative group">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <BellIcon className="h-6 w-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white animate-bounce">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          
          {/* Quick dropdown preview */}
          {unreadCount > 0 && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border py-2 hidden group-hover:block">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-semibold text-gray-700">
                  {unreadCount} new notification{unreadCount > 1 ? "s" : ""}
                </p>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.filter(n => n.unread).slice(0, 3).map((n) => (
                  <div key={n.id} className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm font-medium text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 truncate">{n.body}</p>
                  </div>
                ))}
                {unreadCount > 3 && (
                  <div className="px-4 py-2 text-center text-sm text-blue-600 hover:bg-blue-50 cursor-pointer">
                    View all {unreadCount} notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
          {localStorage.getItem("username")?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}