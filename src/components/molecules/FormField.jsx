import Label from '@/components/atoms/Label';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import { cn } from '@/utils/cn';

const FormField = ({ label, type = 'input', error, required, className, children, ...props }) => {
    const renderField = () => {
        if (type === 'select') {
            return (
                <Select error={error} {...props}>
                    {children}
                </Select>
            );
        }

        if (type === 'textarea') {
            return (
                <textarea
                    className={cn(
                        'flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    )}
                    {...props}
                />
            );
        }

        return <Input error={error} {...props} />;
    };

    return (
        <div className={cn('space-y-2', className)}>
            {label && <Label required={required}>{label}</Label>}
            {renderField()}
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    );
};

export default FormField;
