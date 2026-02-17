'use client';

import { useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';

interface AuthParticlesProps {
    isFlipped: boolean;
}

export function AuthParticles({ isFlipped }: AuthParticlesProps) {
    const particlesContainerRef = useRef<HTMLDivElement>(null);

    const particles = useMemo(() => {
        return Array.from({ length: 25 }).map((_, i) => ({
            top: (i * 17) % 100,
            left: (i * 23) % 100,
            size: (i % 3) + 1,
            opacity: 0.3 + (i % 5) / 10,
        }));
    }, []);

    useEffect(() => {
        if (!particlesContainerRef.current) return;

        const ctx = gsap.context(() => {
            const particleElements = particlesContainerRef.current?.children;
            if (particleElements) {
                Array.from(particleElements).forEach((particle) => {
                    gsap.to(particle, {
                        y: 'random(-30, 30)',
                        x: 'random(-30, 30)',
                        opacity: 'random(0.2, 0.8)',
                        duration: 'random(3, 8)',
                        repeat: -1,
                        yoyo: true,
                        ease: 'sine.inOut',
                        delay: 'random(0, 5)',
                    });
                });
            }
        }, particlesContainerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className="absolute -inset-32 z-0 pointer-events-none" ref={particlesContainerRef}>
            {particles.map((p, i) => (
                <div
                    key={i}
                    className={`absolute rounded-full transition-colors duration-1000 ${
                        isFlipped
                            ? 'bg-(--freelance) shadow-(0_0_8px_var(--freelance))'
                            : 'bg-(--budget) shadow-(0_0_8px_var(--budget))'
                    }`}
                    style={{
                        top: `${p.top}%`,
                        left: `${p.left}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        opacity: p.opacity,
                    }}
                />
            ))}
        </div>
    );
}
