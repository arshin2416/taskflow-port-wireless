import { cn } from '@/utils/cn';

const Loading = ({ className }) => {
    return (
        <div className={cn('space-y-4 p-6', className)}>
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Task cards skeleton */}
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-4 shadow-sm border border-slate-100"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-start gap-3">
                            {/* Checkbox skeleton */}
                            <div className="h-6 w-6 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-md animate-pulse mt-1"></div>

                            <div className="flex-1 space-y-2">
                                {/* Title skeleton */}
                                <div
                                    className="h-5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"
                                    style={{ width: `${Math.random() * 40 + 50}%` }}
                                ></div>

                                {/* Description skeleton */}
                                <div
                                    className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"
                                    style={{ width: `${Math.random() * 30 + 60}%` }}
                                ></div>

                                {/* Tags skeleton */}
                                <div className="flex items-center gap-2 pt-1">
                                    <div className="h-6 w-16 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-full animate-pulse"></div>
                                    <div className="h-6 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-full animate-pulse"></div>
                                </div>
                            </div>

                            {/* Actions skeleton */}
                            <div className="flex gap-1">
                                <div className="h-8 w-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
                                <div className="h-8 w-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Loading;
