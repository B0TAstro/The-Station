import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'budget' | 'freelance' | 'success' | 'warning' | 'danger' | 'outline';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = 'default', children, ...props }, ref) => {
    return (
        <span
            ref={ref}
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full',

                {
                    'bg-foreground/10 text-foreground': variant === 'default',
                    'bg-budget/15 text-budget-light': variant === 'budget',
                    'bg-freelance/15 text-freelance-light': variant === 'freelance',
                    'bg-green-500/15 text-green-400': variant === 'success',
                    'bg-yellow-500/15 text-yellow-400': variant === 'warning',
                    'bg-red-500/15 text-red-400': variant === 'danger',
                    'border border-border text-muted-foreground': variant === 'outline',
                },

                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
});

Badge.displayName = 'Badge';

export { Badge };
