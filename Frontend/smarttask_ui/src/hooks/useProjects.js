import { useState, useEffect } from "react";
import api from "../services/api";

export default function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("projects/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.response?.data?.detail || "Failed to load projects");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const res = await api.post("projects/", projectData);
      setProjects((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err.response?.data?.detail || "Failed to create project");
      throw err;
    }
  };

  const updateProject = async (id, updatedData) => {
    try {
      const res = await api.put(`projects/${id}/`, updatedData);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? res.data : p))
      );
      return res.data;
    } catch (err) {
      console.error("Error updating project:", err);
      setError(err.response?.data?.detail || "Failed to update project");
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.delete(`projects/${id}/`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting project:", err);
      setError(err.response?.data?.detail || "Failed to delete project");
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
