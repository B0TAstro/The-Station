import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'budget' | 'freelance';
    hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-card rounded-xl border border-border p-5',
                    'transition-colors duration-200',

                    hover && 'hover:bg-card-hover hover:border-muted-foreground/20 cursor-pointer',

                    {
                        '': variant === 'default',
                        'border-budget/20 bg-budget-muted': variant === 'budget',
                        'border-freelance/20 bg-freelance-muted': variant === 'freelance',
                    },

                    className,
                )}
                {...props}
            >
                {children}
            </div>
        );
    },
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn('mb-3', className)} {...props}>
                {children}
            </div>
        );
    },
);

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <h3 ref={ref} className={cn('text-sm font-medium text-muted-foreground', className)} {...props}>
                {children}
            </h3>
        );
    },
);

CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn('', className)} {...props}>
                {children}
            </div>
        );
    },
);

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
