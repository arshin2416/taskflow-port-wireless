import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import TaskCard from "@/components/organisms/TaskCard";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { cn } from "@/utils/cn";

const TaskList = ({ 
  tasks = [],
  categories = [],
  loading = false,
  error = null,
  onTaskToggle,
  onTaskEdit,
  onTaskDelete,
  onAddTask,
  emptyTitle = "No tasks found",
  emptyDescription = "Get started by adding your first task",
  className
}) => {
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState("desc");

  // Get category lookup for tasks
  const categoryLookup = useMemo(() => {
    const lookup = {};
    categories.forEach(category => {
      lookup[category.Id] = category;
    });
    return lookup;
  }, [categories]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    if (!tasks.length) return [];

    const sorted = [...tasks].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 1;
          bValue = priorityOrder[b.priority] || 1;
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "created":
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [tasks, sortBy, sortOrder]);

  if (loading) {
    return <Loading className={className} />;
  }

  if (error) {
    return (
      <ErrorView 
        error={error}
        className={className}
      />
    );
  }

  if (sortedTasks.length === 0) {
    return (
      <Empty
        title={emptyTitle}
        description={emptyDescription}
        onAction={onAddTask}
        actionLabel="Add Task"
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Sort controls */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-600">Sort by:</span>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="created">Date Created</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
        
        <span className="text-slate-500 text-sm">
          {sortedTasks.length} task{sortedTasks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Task cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.Id}
              task={task}
              category={categoryLookup[task.categoryId]}
              onToggleComplete={onTaskToggle}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskList;