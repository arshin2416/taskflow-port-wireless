import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Button = forwardRef(({ children, variant = 'primary', size = 'md', className, disabled, ...props }, ref) => {
    const variants = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md hover:shadow-lg',
        secondary:
            'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white shadow-md hover:shadow-lg',
        outline: 'border-2 border-primary-300 hover:border-primary-500 text-primary-600 hover:bg-primary-50',
        ghost: 'text-slate-600 hover:text-slate-800 hover:bg-slate-100',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg'
    };

    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
