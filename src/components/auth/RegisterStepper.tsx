'use client';

import { Check } from 'lucide-react';

interface RegisterStepperProps {
    currentStep: number;
    steps: string[];
}

export function RegisterStepper({ currentStep, steps }: RegisterStepperProps) {
    return (
        <div className="flex items-center justify-between mb-8 anim-item w-full relative">
            {steps.map((label, i) => {
                const stepNum = i + 1;
                const isActive = stepNum === currentStep;
                const isDone = stepNum < currentStep;

                return (
                    <div key={label} className="contents">
                        {i > 0 && (
                            <div
                                className="h-px flex-1 mx-2 transition-colors duration-300"
                                style={{
                                    background: isDone
                                        ? 'linear-gradient(90deg, var(--freelance), var(--freelance-muted))'
                                        : 'var(--border)',
                                }}
                            />
                        )}

                        <div className="flex flex-col items-center gap-1.5 z-10">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0"
                                style={{
                                    background: isDone
                                        ? 'linear-gradient(135deg, var(--freelance), var(--freelance-dark))'
                                        : isActive
                                          ? 'linear-gradient(135deg, var(--freelance-muted), rgba(239,68,68,0.1))'
                                          : 'rgba(255,255,255,0.04)',
                                    color: isDone
                                        ? '#fff'
                                        : isActive
                                          ? 'var(--freelance-light)'
                                          : 'rgba(255,255,255,0.25)',
                                    boxShadow: isDone ? '0 0 12px var(--freelance-muted)' : 'none',
                                    border: isActive ? '1px solid var(--freelance-muted)' : '1px solid transparent',
                                }}
                            >
                                {isDone ? <Check className="h-3.5 w-3.5" /> : stepNum}
                            </div>
                            <span
                                className="text-[10px] font-medium transition-colors duration-300 whitespace-nowrap absolute -bottom-5"
                                style={{
                                    color: isDone || isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                                    transform: 'translateX(0)',
                                }}
                            >
                                {label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
