import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import TaskList from "@/components/organisms/TaskList";
import TaskModal from "@/components/organisms/TaskModal";
import { useTasks } from "@/hooks/useTasks";
import categoryService from "@/services/api/categoryService";

const CategoryTasks = () => {
  const { categoryId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filterType = searchQuery ? "search" : "category";
  const filterValue = searchQuery || categoryId;

  const { tasks, loading, error, toggleTask, deleteTask, refreshTasks } = useTasks(filterType, filterValue);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && categoryId) {
const category = categories.find(cat => cat.Id === parseInt(categoryId));
      setCurrentCategory(category);
    }
  }, [categories, categoryId]);

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

  // Filter tasks by category if searching
  const filteredTasks = searchQuery 
? tasks.filter(task => task.category_id_c === parseInt(categoryId))
    : tasks;

  return (
    <div className="flex-1 flex flex-col h-full">
      <Header
title={currentCategory?.Name || "Category Tasks"}
        onAddTask={handleAddTask}
        onSearch={handleSearch}
        showMobileMenu={false}
      />

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <TaskList
          tasks={filteredTasks}
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
: `No ${currentCategory?.Name?.toLowerCase() || "category"} tasks`
          }
          emptyDescription={
            searchQuery 
              ? `No tasks match "${searchQuery}" in this category.`
: `No tasks in the ${currentCategory?.Name || "category"} category yet. Add one to get started!`
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

export default CategoryTasks;