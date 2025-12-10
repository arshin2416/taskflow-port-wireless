import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import taskService from "@/services/api/taskService";
import categoryService from "@/services/api/categoryService";

const TaskModal = ({ 
  isOpen, 
  onClose, 
  task = null, 
  onSave,
  className 
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    categoryId: "",
    dueDate: ""
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        categoryId: task.categoryId || "",
        dueDate: task.dueDate || ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        categoryId: "",
        dueDate: ""
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
      
      // Set default category if creating new task
      if (!task && data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: data[0].Id.toString() }));
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      let savedTask;
      
      if (task) {
        // Update existing task
        savedTask = await taskService.update(task.Id, formData);
        toast.success("Task updated successfully!");
      } else {
        // Create new task
        savedTask = await taskService.create(formData);
        toast.success("Task created successfully!");
      }
      
      onSave(savedTask);
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
      toast.error("Failed to save task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              {task ? "Edit Task" : "Add New Task"}
            </h2>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ApperIcon name="X" className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <FormField
              label="Title"
              type="input"
              required
              value={formData.title}
              onChange={handleChange("title")}
              error={errors.title}
              placeholder="Enter task title..."
            />

            <FormField
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={handleChange("description")}
              placeholder="Add a description (optional)..."
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Priority"
                type="select"
                value={formData.priority}
                onChange={handleChange("priority")}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </FormField>

              <FormField
                label="Category"
                type="select"
                required
                value={formData.categoryId}
                onChange={handleChange("categoryId")}
                error={errors.categoryId}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.Id} value={category.Id.toString()}>
                    {category.name}
                  </option>
                ))}
              </FormField>
            </div>

            <FormField
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={handleChange("dueDate")}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Save" className="h-4 w-4" />
                    {task ? "Update" : "Create"} Task
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskModal;