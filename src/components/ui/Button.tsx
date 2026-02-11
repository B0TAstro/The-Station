import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'budget' | 'freelance' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center font-medium rounded-lg',
                    'transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'active:scale-[0.98]',

                    // Sizes
                    {
                        'px-3 py-1.5 text-xs': size === 'sm',
                        'px-4 py-2 text-sm': size === 'md',
                        'px-5 py-2.5 text-base': size === 'lg',
                    },

                    // Variants
                    {
                        'bg-foreground text-background hover:bg-foreground/90': variant === 'primary',
                        'bg-muted text-foreground border border-border hover:bg-card-hover': variant === 'secondary',
                        'bg-budget text-white hover:bg-budget-dark': variant === 'budget',
                        'bg-freelance text-white hover:bg-freelance-dark': variant === 'freelance',
                        'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted':
                            variant === 'ghost',
                        'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
                    },

                    className,
                )}
                {...props}
            >
                {children}
            </button>
        );
    },
);

Button.displayName = 'Button';

export { Button };
