import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Checkbox = forwardRef(({ 
  className,
  checked = false,
  onChange,
  disabled,
  ...props 
}, ref) => {
  return (
    <button
      type="button"
      ref={ref}
      onClick={() => onChange && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "h-6 w-6 rounded-md border-2 border-slate-300 flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed",
        checked && "bg-gradient-to-r from-primary-500 to-secondary-500 border-transparent text-white shadow-md",
        !checked && "hover:border-primary-400 bg-white",
        className
      )}
      {...props}
    >
      {checked && (
        <ApperIcon 
          name="Check" 
          className="h-4 w-4 text-white" 
        />
      )}
    </button>
  );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;