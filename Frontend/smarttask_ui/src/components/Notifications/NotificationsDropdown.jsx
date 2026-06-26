// src/components/Notifications/NotificationsDropdown.jsx
import { BellIcon } from "@heroicons/react/24/outline";

export default function NotificationsDropdown({ notifications }) {
  return (
    <div className="relative">
      {/* Bell button */}
      <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <BellIcon className="h-6 w-6 text-gray-700" />
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm">No new notifications</div>
        ) : (
          <ul>
            {notifications.map((n, i) => (
              <li
                key={i}
                className="p-4 border-b last:border-none hover:bg-gray-50 transition"
              >
                <p className="text-sm text-gray-800">{n.message}</p>
                <span className="text-xs text-gray-400">{n.time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
