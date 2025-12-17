import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';

const ErrorView = ({ error = 'Something went wrong', onRetry, className }) => {
    return (
        <div className={cn('flex flex-col items-center justify-center min-h-[400px] p-8 text-center', className)}>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-full p-6 mb-6">
                <ApperIcon name="AlertTriangle" className="h-12 w-12 text-red-500" />
            </div>

            <h3 className="text-xl font-semibold text-slate-800 mb-2">Oops! Something went wrong</h3>

            <p className="text-slate-600 mb-6 max-w-md">{error}</p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                    <ApperIcon name="RefreshCw" className="h-4 w-4" />
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorView;
