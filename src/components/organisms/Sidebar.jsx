import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import taskService from "@/services/api/taskService";
import categoryService from "@/services/api/categoryService";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose, className }) => {
  const [categories, setCategories] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const { categoryId } = useParams();

  useEffect(() => {
    loadCategories();
    loadTaskCounts();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskCounts = async () => {
    try {
      const allTasks = await taskService.getAll();
      const activeTasks = allTasks.filter(task => task.status === "active");
      const completedTasks = allTasks.filter(task => task.status === "completed");
      const todayTasks = await taskService.getToday();
      const upcomingTasks = await taskService.getUpcoming();

      // Count tasks by category
      const categoryCountsObj = {};
      categories.forEach(category => {
categoryCountsObj[category.Id] = activeTasks.filter(task => task.category_id_c === category.Id).length;
      });

      setTaskCounts({
        all: activeTasks.length,
        today: todayTasks.length,
        upcoming: upcomingTasks.length,
        completed: completedTasks.length,
        categories: categoryCountsObj
      });
    } catch (error) {
      console.error("Failed to load task counts:", error);
    }
  };

  // Reload counts when categories change
  useEffect(() => {
    if (categories.length > 0) {
      loadTaskCounts();
    }
  }, [categories]);

  const navItems = [
    {
      href: "/",
      icon: "List",
      label: "All Tasks",
      count: taskCounts.all || 0
    },
    {
      href: "/today",
      icon: "Calendar",
      label: "Today",
      count: taskCounts.today || 0
    },
    {
      href: "/upcoming",
      icon: "Clock",
      label: "Upcoming", 
      count: taskCounts.upcoming || 0
    }
  ];

  const NavItem = ({ href, icon, label, count, isCategory = false, color }) => (
    <NavLink
      to={href}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-100",
          isActive 
            ? "bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 shadow-sm" 
            : "text-slate-600 hover:text-slate-800"
        )
      }
    >
      <div className="flex items-center gap-3">
{isCategory && color ? (
          <div className="h-4 w-1 rounded-full" style={{ backgroundColor: color }} />
        ) : (
          <ApperIcon name={icon} className="h-4 w-4" />
        )}
        <span>{label}</span>
      </div>
      {count > 0 && (
        <span className={cn(
          "px-2 py-0.5 text-xs rounded-full font-medium",
          isCategory 
            ? "bg-slate-200 text-slate-600"
            : "bg-primary-100 text-primary-600"
        )}>
          {count}
        </span>
      )}
    </NavLink>
  );

  // Mobile overlay
  if (isOpen) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
        
        {/* Mobile sidebar */}
        <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 lg:hidden transform translate-x-0 transition-transform duration-300">
          <SidebarContent 
            navItems={navItems}
            categories={categories}
            taskCounts={taskCounts}
            loading={loading}
            onClose={onClose}
            NavItem={NavItem}
            categoryId={categoryId}
          />
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className={cn(
      "hidden lg:block w-64 bg-white border-r border-slate-200 h-full",
      className
    )}>
      <SidebarContent 
        navItems={navItems}
        categories={categories}
        taskCounts={taskCounts}
        loading={loading}
        onClose={onClose}
        NavItem={NavItem}
        categoryId={categoryId}
      />
    </aside>
  );
};

const SidebarContent = ({ navItems, categories, taskCounts, loading, onClose, NavItem, categoryId }) => (
  <div className="flex flex-col h-full">
    {/* Logo/Header */}
    <div className="p-6 border-b border-slate-200">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
          <ApperIcon name="CheckSquare" className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          TaskFlow
        </span>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
      {/* Main navigation */}
      <div className="space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            count={item.count}
          />
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-3">
          Categories
        </h3>
        <div className="space-y-1">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-slate-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            categories.map((category) => (
              <NavItem
                key={category.Id}
                href={`/category/${category.Id}`}
href={`/category/${category.Id}`}
                icon={category.icon_c}
                label={category.Name}
                count={taskCounts.categories?.[category.Id] || 0}
                isCategory={true}
color={category.color_c}
            ))
          )}
        </div>
      </div>

      {/* Completed tasks */}
      <div className="border-t border-slate-200 pt-4">
        <NavItem
          href="/completed"
          icon="CheckCheck"
          label="Completed"
          count={taskCounts.completed || 0}
        />
      </div>
    </nav>
  </div>
);

export default Sidebar;