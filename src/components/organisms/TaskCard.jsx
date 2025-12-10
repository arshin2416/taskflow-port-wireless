import { useState } from "react";
import { motion } from "framer-motion";
import { format, isToday, isPast, parseISO } from "date-fns";
import Checkbox from "@/components/atoms/Checkbox";
import TaskActions from "@/components/molecules/TaskActions";
import PriorityBadge from "@/components/molecules/PriorityBadge";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const TaskCard = ({ 
  task, 
  category,
  onToggleComplete,
  onEdit,
  onDelete,
  className 
}) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleToggleComplete = async () => {
    if (task.status === "active") {
      setIsCompleting(true);
      // Small delay for animation
      setTimeout(() => {
        onToggleComplete(task.Id);
      }, 300);
    } else {
      onToggleComplete(task.Id);
    }
  };

  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status === "active";
  const isDueToday = task.dueDate && isToday(parseISO(task.dueDate));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isCompleting ? 0.5 : 1, 
        y: 0,
        scale: isCompleting ? 0.98 : 1
      }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group",
        task.status === "completed" && "opacity-75",
        isOverdue && "border-l-4 border-l-red-500",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-1">
          <Checkbox
            checked={task.status === "completed"}
            onChange={handleToggleComplete}
            className={cn(
              "transition-all duration-300",
              isCompleting && "animate-pulse"
            )}
          />
        </div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={cn(
            "text-base font-semibold text-slate-800 mb-1 transition-all duration-300",
            task.status === "completed" && "line-through text-slate-500",
            isCompleting && "line-through text-slate-500"
          )}>
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className={cn(
              "text-sm text-slate-600 mb-3 line-clamp-2 transition-all duration-300",
              task.status === "completed" && "text-slate-400"
            )}>
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority */}
            <PriorityBadge priority={task.priority} size="sm" />

            {/* Category */}
            {category && (
              <Badge 
                variant="category"
                size="sm"
                className="flex items-center gap-1"
              >
                <ApperIcon name={category.icon} className="h-3 w-3" />
                {category.name}
              </Badge>
            )}

            {/* Due date */}
            {task.dueDate && (
              <Badge 
                variant={isOverdue ? "high" : isDueToday ? "medium" : "default"}
                size="sm"
                className="flex items-center gap-1"
              >
                <ApperIcon 
                  name={isOverdue ? "AlertTriangle" : "Calendar"} 
                  className="h-3 w-3" 
                />
                {isOverdue ? "Overdue" : 
                 isDueToday ? "Due Today" : 
                 format(parseISO(task.dueDate), "MMM d")}
              </Badge>
            )}

            {/* Completed date */}
            {task.status === "completed" && task.completedAt && (
              <Badge variant="success" size="sm" className="flex items-center gap-1">
                <ApperIcon name="Check" className="h-3 w-3" />
                {format(parseISO(task.completedAt), "MMM d")}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <TaskActions
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task.Id)}
            onToggleComplete={handleToggleComplete}
            isCompleted={task.status === "completed"}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;