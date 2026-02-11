'use client';

import { cn } from '@/lib/utils';

interface HeaderProps {
    title: string;
    description?: string;
    variant?: 'default' | 'budget' | 'freelance';
    children?: React.ReactNode;
}

export function Header({ title, description, variant = 'default', children }: HeaderProps) {
    return (
        <header className="mb-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                <div>
                    <h1
                        className={cn(
                            'text-2xl font-semibold tracking-tight',
                            variant === 'budget' && 'text-budget-light',
                            variant === 'freelance' && 'text-freelance-light',
                        )}
                    >
                        {title}
                    </h1>
                    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                </div>
                {children && <div className="flex items-center gap-3">{children}</div>}
            </div>
        </header>
    );
}
