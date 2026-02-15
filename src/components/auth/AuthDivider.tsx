'use client';

interface AuthDividerProps {
    label?: string;
}

export function AuthDivider({ label = 'ou continue avec ton email' }: AuthDividerProps) {
    return (
        <div className="relative mb-4 anim-item">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-(--border)" />
            </div>
            <div className="relative flex justify-center text-xs">
                <span className="px-3 text-muted-foreground/60" style={{ background: 'var(--card)' }}>
                    {label}
                </span>
            </div>
        </div>
    );
}
