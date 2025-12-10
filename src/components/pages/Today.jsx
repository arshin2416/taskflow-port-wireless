import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import TaskList from "@/components/organisms/TaskList";
import TaskModal from "@/components/organisms/TaskModal";
import { useTasks } from "@/hooks/useTasks";
import categoryService from "@/services/api/categoryService";

const Today = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filterType = searchQuery ? "search" : "today";
  const filterValue = searchQuery || null;

  const { tasks, loading, error, toggleTask, deleteTask, refreshTasks } = useTasks(filterType, filterValue);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    refreshTasks();
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <Header
        title="Today"
        onAddTask={handleAddTask}
        onSearch={handleSearch}
        showMobileMenu={false}
      />

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <TaskList
          tasks={tasks}
          categories={categories}
          loading={loading}
          error={error}
          onTaskToggle={toggleTask}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
          onAddTask={handleAddTask}
          emptyTitle={
            searchQuery 
              ? "No tasks found" 
              : "No tasks due today"
          }
          emptyDescription={
            searchQuery 
              ? `No tasks match "${searchQuery}". Try a different search term.`
              : "You're all caught up for today! Add a task or check your upcoming work."
          }
        />
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default Today;