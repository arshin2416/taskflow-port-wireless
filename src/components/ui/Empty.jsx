import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';

const Empty = ({
    title = 'No tasks found',
    description = 'Get started by adding your first task',
    actionLabel = 'Add Task',
    onAction,
    icon = 'CheckSquare',
    className
}) => {
    return (
        <div className={cn('flex flex-col items-center justify-center min-h-[400px] p-8 text-center', className)}>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-full p-8 mb-6">
                <ApperIcon name={icon} className="h-16 w-16 text-slate-400" />
            </div>

            <h3 className="text-2xl font-semibold text-slate-800 mb-3">{title}</h3>

            <p className="text-slate-600 mb-8 max-w-md">{description}</p>

            {onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                    <ApperIcon name="Plus" className="h-5 w-5" />
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default Empty;
