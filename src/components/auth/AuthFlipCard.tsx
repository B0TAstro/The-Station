'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import gsap from 'gsap';

interface AuthFlipCardProps {
    initialView?: 'login' | 'register';
}

export default function AuthFlipCard({ initialView = 'login' }: AuthFlipCardProps) {
    const [isFlipped, setIsFlipped] = useState(initialView === 'register');
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const particlesContainerRef = useRef<HTMLDivElement>(null);

    // Dynamic particles data - Fix impurity by using simple deterministic math based on index
    const particles = useMemo(() => {
        return Array.from({ length: 25 }).map((_, i) => ({
            top: ((i * 17) % 100), // Deterministic pseudo-random
            left: ((i * 23) % 100),
            size: ((i % 3) + 1),
            opacity: 0.3 + ((i % 5) / 10),
        }));
    }, []);

    // Particles animation
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

    // Flip animation
    useEffect(() => {
        if (!cardRef.current) return;

        const rotation = isFlipped ? 180 : 0;

        gsap.to(cardRef.current, {
            rotationY: rotation,
            duration: 0.3,
            ease: 'power2.inOut',
        });
    }, [isFlipped]);

    const toggleView = () => setIsFlipped(!isFlipped);

    return (
        <div
            className="relative w-full max-w-[380px] sm:max-w-[480px] z-10"
            style={{ perspective: '1200px' }}
            ref={containerRef}
        >
            {/* Particles Container */}
            <div className="absolute -inset-32 z-0 pointer-events-none" ref={particlesContainerRef}>
                {particles.map((p, i) => (
                    <div
                        key={i}
                        className={`absolute rounded-full transition-colors duration-1000 ${isFlipped
                                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                                : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
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

            <div
                ref={cardRef}
                className="relative w-full transition-all duration-300"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${isFlipped ? 180 : 0}deg)`
                }}
            >
                {/* Front: Login */}
                <div
                    className="relative w-full backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className={isFlipped ? 'pointer-events-none' : ''}>
                        <LoginForm onToggle={toggleView} isVisible={!isFlipped} />
                    </div>
                </div>

                {/* Back: Register */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    <div className={!isFlipped ? 'pointer-events-none' : ''}>
                        <RegisterForm onToggle={toggleView} isVisible={isFlipped} />
                    </div>
                </div>
            </div>
        </div>
    );
}
