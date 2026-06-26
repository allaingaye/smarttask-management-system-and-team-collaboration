import useTasks from "../../hooks/useTasks";

export default function TasksTable() {
  const { tasks, loading, error } = useTasks();

  if (loading) return <p className="text-gray-500">Loading tasks...</p>;
  if (error) return <p className="text-red-500">Failed to load tasks.</p>;

  // ✅ Sort tasks by due date (ascending)
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(a.due_date) - new Date(b.due_date)
  );

  return (
    <table className="w-full border rounded-lg">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-2">Task</th>
          <th className="p-2">Project</th>
          <th className="p-2">Status</th>
          <th className="p-2">Due Date</th>
        </tr>
      </thead>
      <tbody>
        {sortedTasks.map((task) => (
          <tr
            key={task.id}
            className={`border-t ${
              task.is_overdue ? "bg-red-50" : "bg-white"
            }`}
          >
            <td className="p-2">{task.title}</td>
            <td className="p-2">{task.project?.name || "—"}</td>
            <td className="p-2">
              {task.is_overdue ? (
                <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">
                  Overdue
                </span>
              ) : (
                <span className="capitalize">{task.status.replace("_", " ")}</span>
              )}
            </td>
            <td
              className={`p-2 ${
                task.is_overdue ? "text-red-600 font-semibold" : "text-gray-700"
              }`}
            >
              {task.due_date}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
