import { Link } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-slate-100 flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                {/* 404 Icon */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-full p-8 mx-auto w-32 h-32 flex items-center justify-center">
                    <ApperIcon name="FileQuestion" className="h-16 w-16 text-slate-400" />
                </div>

                {/* Error Message */}
                <div className="space-y-3">
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">404</h1>
                    <h2 className="text-2xl font-semibold text-slate-800">Page Not Found</h2>
                    <p className="text-slate-600">
                        Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild>
                        <Link to="/" className="inline-flex items-center gap-2">
                            <ApperIcon name="Home" className="h-4 w-4" />
                            Go to Home
                        </Link>
                    </Button>

                    <Button variant="outline" onClick={() => window.history.back()} className="inline-flex items-center gap-2">
                        <ApperIcon name="ArrowLeft" className="h-4 w-4" />
                        Go Back
                    </Button>
                </div>

                {/* Help Links */}
                <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500 mb-3">Need help? Try these:</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link to="/" className="text-primary-600 hover:text-primary-700 transition-colors">
                            All Tasks
                        </Link>
                        <Link to="/today" className="text-primary-600 hover:text-primary-700 transition-colors">
                            Today's Tasks
                        </Link>
                        <Link to="/completed" className="text-primary-600 hover:text-primary-700 transition-colors">
                            Completed Tasks
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
