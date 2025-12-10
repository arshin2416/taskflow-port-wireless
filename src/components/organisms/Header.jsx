import { useState } from "react";
import { useSelector } from "react-redux";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Header = ({ 
  title, 
  onAddTask, 
  onSearch, 
  onFilter,
  currentFilter,
  onToggleSidebar,
  onLogout,
  showMobileMenu = true,
  className 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const filterOptions = [
    { value: "all", label: "All Tasks" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" },
    { value: "today", label: "Due Today" },
    { value: "overdue", label: "Overdue" }
  ];

  const handleSearch = (query) => {
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  return (
    <header className={cn(
      "bg-white border-b border-slate-200 px-4 lg:px-6 py-4",
      className
    )}>
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Title and mobile menu */}
        <div className="flex items-center gap-3">
          {showMobileMenu && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden h-10 w-10 p-0"
            >
              <ApperIcon name="Menu" className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>

        {/* Center - Search */}
        <div className="hidden md:block flex-1 max-w-md">
          <SearchBar 
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={handleSearch}
          />
        </div>

        {/* Right side - Filter, Add button, and Logout */}
        <div className="flex items-center gap-2">
          {onFilter && (
            <FilterDropdown
              options={filterOptions}
              value={currentFilter}
              onChange={onFilter}
              className="hidden sm:block"
            />
          )}
          
          {onAddTask && (
            <Button 
              onClick={onAddTask}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" className="h-4 w-4" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          )}

          {/* Logout Button */}
          {isAuthenticated && onLogout && (
            <Button 
              variant="outline"
              onClick={onLogout}
              className="flex items-center gap-2"
              title={`Logout ${user?.firstName || 'User'}`}
            >
              <ApperIcon name="LogOut" className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden mt-4">
        <SearchBar 
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={handleSearchChange}
          onSearch={handleSearch}
        />
      </div>
    </header>
  );
};

export default Header;