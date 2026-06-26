import { useState, useEffect } from "react";
import api from "../services/api";

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("tasks/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err.response?.data || err);
      setError(err.response?.data || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const sanitizeTask = (task) => ({
    title: task.title?.trim(),
    description: task.description?.trim(),
    due_date: task.due_date || null, // ✅ allow null
    priority: task.priority,
    status: task.status,
    project: task.project ? parseInt(task.project) : null,
    assigned_to: task.assigned_to || null,
  });

  const createTask = async (taskData) => {
    try {
      const res = await api.post("tasks/", sanitizeTask(taskData));
      setTasks((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Error creating task:", err.response?.data || err);
      setError(err.response?.data || "Failed to create task");
      throw err;
    }
  };

  const updateTask = async (id, updatedData) => {
    try {
      const res = await api.patch(`tasks/${id}/`, sanitizeTask(updatedData)); // ✅ PATCH
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data : t))
      );
      return res.data;
    } catch (err) {
      console.error("Error updating task:", err.response?.data || err);
      setError(err.response?.data || "Failed to update task");
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`tasks/${id}/`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting task:", err.response?.data || err);
      setError(err.response?.data || "Failed to delete task");
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
