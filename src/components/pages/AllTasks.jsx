import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '@/components/organisms/Header';
import TaskList from '@/components/organisms/TaskList';
import TaskModal from '@/components/organisms/TaskModal';
import { useTasks } from '@/hooks/useTasks';
import categoryService from '@/services/api/categoryService';

const AllTasks = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [categories, setCategories] = useState([]);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Determine filter type and value based on current filter and search
    let filterType = 'all';
    let filterValue = null;

    if (searchQuery) {
        filterType = 'search';
        filterValue = searchQuery;
    } else if (currentFilter !== 'all') {
        if (['high', 'medium', 'low'].includes(currentFilter)) {
            filterType = 'priority';
            filterValue = currentFilter;
        } else if (['active', 'completed', 'today', 'overdue'].includes(currentFilter)) {
            filterType = currentFilter;
        }
    }

    const { tasks, loading, error, toggleTask, deleteTask, refreshTasks } = useTasks(filterType, filterValue);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleAddTask = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = () => {
        refreshTasks();
        loadCategories(); // Refresh categories in case task counts changed
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
            toast.success('Task deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const handleFilter = (filter) => {
        setCurrentFilter(filter);
        setSearchQuery(''); // Clear search when filtering
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query) {
            setCurrentFilter('all'); // Reset filter when searching
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <Header
                title="All Tasks"
                onAddTask={handleAddTask}
                onSearch={handleSearch}
                onFilter={handleFilter}
                currentFilter={currentFilter}
                showMobileMenu={false}
            />

            <div className="flex-1 overflow-auto p-4 lg:p-6">
                <TaskList
                    tasks={tasks}
                    categories={categories}
                    loading={loading}
                    error={error}
                    onTaskToggle={toggleTask}
                    onTaskEdit={handleEditTask}
                    onTaskDelete={handleDeleteTask}
                    onAddTask={handleAddTask}
                    emptyTitle={searchQuery ? 'No tasks found' : currentFilter === 'all' ? 'No tasks yet' : `No ${currentFilter} tasks`}
                    emptyDescription={
                        searchQuery
                            ? `No tasks match "${searchQuery}". Try a different search term.`
                            : currentFilter === 'all'
                              ? 'Get started by creating your first task. Stay organized and productive!'
                              : `No tasks found for the ${currentFilter} filter.`
                    }
                />
            </div>

            <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} task={editingTask} onSave={handleSaveTask} />
        </div>
    );
};

export default AllTasks;
