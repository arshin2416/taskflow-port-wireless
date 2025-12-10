import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const PriorityBadge = ({ priority, size = "md", showIcon = true }) => {
  const priorityConfig = {
    high: {
      variant: "high",
      icon: "AlertCircle",
      label: "High"
    },
    medium: {
      variant: "medium", 
      icon: "Circle",
      label: "Medium"
    },
    low: {
      variant: "low",
      icon: "Minus",
      label: "Low"
    }
  };

  const config = priorityConfig[priority] || priorityConfig.low;

  return (
    <Badge variant={config.variant} size={size}>
      {showIcon && (
        <ApperIcon 
          name={config.icon} 
          className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} 
        />
      )}
      {config.label}
    </Badge>
  );
};

export default PriorityBadge;