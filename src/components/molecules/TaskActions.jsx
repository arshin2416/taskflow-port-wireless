import { useState } from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const TaskActions = ({ 
  onEdit, 
  onDelete, 
  onToggleComplete, 
  isCompleted = false,
  className 
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    if (showConfirm) {
      onDelete();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleComplete}
        className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
        title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
      >
        <ApperIcon 
          name={isCompleted ? "RotateCcw" : "Check"} 
          className="h-4 w-4" 
        />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
        title="Edit task"
      >
        <ApperIcon name="Edit" className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        className={cn(
          "h-8 w-8 p-0 transition-colors",
          showConfirm 
            ? "bg-red-100 text-red-600 hover:bg-red-200" 
            : "hover:bg-red-100 hover:text-red-600"
        )}
        title={showConfirm ? "Click again to confirm" : "Delete task"}
      >
        <ApperIcon name="Trash2" className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TaskActions;