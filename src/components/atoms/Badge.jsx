import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  children,
  variant = "default",
  size = "md",
  className,
  ...props 
}, ref) => {
  const variants = {
    default: "bg-slate-100 text-slate-800",
    high: "bg-gradient-to-r from-accent-500 to-accent-600 text-white",
    medium: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white",
    low: "bg-gradient-to-r from-blue-400 to-blue-500 text-white",
    success: "bg-gradient-to-r from-green-400 to-green-500 text-white",
    category: "bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700"
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center font-medium rounded-full transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;