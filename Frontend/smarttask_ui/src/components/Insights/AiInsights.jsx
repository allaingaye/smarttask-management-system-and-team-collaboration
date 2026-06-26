// src/components/Insights/AiInsights.jsx
import { LightBulbIcon } from "@heroicons/react/24/outline";

export default function AiInsights({ insights }) {
  return (
    <div className="bg-white rounded shadow p-6">
      {/* Header */}
      <div className="flex items-center mb-4">
        <LightBulbIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">AI Insights</h2>
      </div>

      {/* Insights list */}
      {insights && insights.length > 0 ? (
        <ul className="space-y-3">
          {insights.map((insight, i) => (
            <li
              key={i}
              className="p-4 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition"
            >
              <p className="text-sm text-gray-700">{insight.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No insights available yet.</p>
      )}
    </div>
  );
}
