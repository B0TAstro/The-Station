'use client';

import { Check } from 'lucide-react';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface AuthSuccessProps {
    title: string;
    message: string;
    onAction: () => void;
    actionLabel: string;
}

export function AuthSuccess({ title, message, onAction, actionLabel }: AuthSuccessProps) {
    const successRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (successRef.current) {
            gsap.fromTo(
                successRef.current,
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
            );
        }
    }, []);

    return (
        <div
            className="w-full rounded-2xl border border-border p-6 sm:p-8 text-center flex flex-col justify-center"
            style={{
                background: 'linear-gradient(145deg, var(--card) 0%, rgba(9,9,11,0.98) 100%)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
        >
            <div ref={successRef} className="space-y-5 flex flex-col items-center justify-center">
                <div
                    className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--freelance-muted), rgba(239,68,68,0.05))' }}
                >
                    <Check className="h-8 w-8 text-freelance" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{message}</p>
                </div>
                <button
                    onClick={onAction}
                    className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                    style={{
                        background: 'linear-gradient(135deg, var(--freelance) 0%, var(--freelance-dark) 100%)',
                        boxShadow: '0 0 20px var(--freelance-muted), 0 1px 3px rgba(0,0,0,0.3)',
                    }}
                >
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}
