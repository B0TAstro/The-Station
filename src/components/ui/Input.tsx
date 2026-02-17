import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    required?: boolean;
    variant?: 'default' | 'budget' | 'freelance';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, required, variant = 'default', id, ...props }, ref) => {
        const asteriskColor =
            variant === 'freelance' ? 'text-freelance' : variant === 'budget' ? 'text-budget' : 'text-red-400';

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-muted-foreground mb-1.5">
                        {label}
                        {required && <span className={cn('ml-0.5', asteriskColor)}>*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    className={cn(
                        'w-full px-3.5 py-2.5 rounded-lg',
                        'bg-muted text-foreground',
                        'border border-border',
                        'placeholder:text-muted-foreground/50',
                        'focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25',
                        'transition-colors duration-200',

                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/25',

                        className,
                    )}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
            </div>
        );
    },
);

Input.displayName = 'Input';

export { Input };
