import { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const FilterDropdown = ({ 
  label = "Filter", 
  options = [], 
  value,
  onChange,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-colors"
      >
        <ApperIcon name="Filter" className="h-4 w-4" />
        {selectedOption ? selectedOption.label : label}
        <ApperIcon 
          name="ChevronDown" 
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors",
                value === option.value && "bg-primary-50 text-primary-600 font-medium"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;