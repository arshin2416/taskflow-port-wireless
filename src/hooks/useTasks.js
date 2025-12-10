import { useState, useEffect } from "react";
import taskService from "@/services/api/taskService";

export const useTasks = (filterType = "all", filterValue = null) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTasks();
  }, [filterType, filterValue]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      let data = [];

      switch (filterType) {
        case "today":
          data = await taskService.getToday();
          break;
        case "upcoming":
          data = await taskService.getUpcoming();
          break;
        case "completed":
          data = await taskService.getByStatus("completed");
          break;
        case "category":
          data = await taskService.getByCategory(filterValue);
case "category":
          data = await taskService.getByCategory(filterValue);
          break;
        case "priority":
          const allTasks = await taskService.getAll();
data = allTasks.filter(task => task.priority_c === filterValue && task.status_c === "active");
        case "search":
          if (filterValue) {
            data = await taskService.search(filterValue);
          } else {
            data = await taskService.getAll();
          }
          break;
        case "active":
          data = await taskService.getByStatus("active");
          break;
        default:
          data = await taskService.getAll();
      }

      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId) => {
    try {
const task = tasks.find(t => t.Id === taskId);
      if (!task) return;

      const newStatus = task.status_c === "completed" ? "active" : "completed";
      const updatedTask = await taskService.update(taskId, { status: newStatus });
      
      // Update local state
// Update local state with updated task data
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.Id === taskId ? { ...t, ...updatedTask } : t
        )
      );

      // Reload tasks to ensure consistency with filter
      if (filterType === "completed" || filterType === "active") {
        setTimeout(loadTasks, 300); // Small delay for animation
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId);
      setTasks(prevTasks => prevTasks.filter(t => t.Id !== taskId));
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  const refreshTasks = () => {
    loadTasks();
  };

  return {
    tasks,
    loading,
    error,
    toggleTask,
    deleteTask,
    refreshTasks
  };
};