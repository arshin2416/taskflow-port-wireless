import { useState } from 'react';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';

const SearchBar = ({ placeholder = 'Search tasks...', onSearch, className, value = '', onChange }) => {
    const [focused, setFocused] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(value);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn('relative', className)}>
            <div className={cn('relative flex items-center transition-all duration-200', focused && 'scale-[1.02]')}>
                <ApperIcon name="Search" className="absolute left-3 h-4 w-4 text-slate-500" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange && onChange('')}
                        className="absolute right-3 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <ApperIcon name="X" className="h-4 w-4" />
                    </button>
                )}
            </div>
        </form>
    );
};

export default SearchBar;
