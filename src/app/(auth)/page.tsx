'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import gsap from 'gsap';
import { AuthParticles } from '@/components/auth/AuthParticles';

export default function AuthPage() {
    const pathname = usePathname();
    const [isFlipped, setIsFlipped] = useState(pathname === '/register');
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cardRef.current) return;

        const rotation = isFlipped ? 180 : 0;

        gsap.to(cardRef.current, {
            rotationY: rotation,
            duration: 0.6,
            ease: 'power2.inOut',
        });
    }, [isFlipped]);

    const toggleView = () => {
        const newFlippedState = !isFlipped;
        setIsFlipped(newFlippedState);

        const newPath = newFlippedState ? '/register' : '/login';
        window.history.pushState(null, '', newPath);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            <div
                className="relative w-full max-w-95 sm:max-w-120 z-10"
                style={{ perspective: '1200px' }}
                ref={containerRef}
            >
                <AuthParticles isFlipped={isFlipped} />

                <div
                    ref={cardRef}
                    className="relative w-full"
                    style={{
                        transformStyle: 'preserve-3d',
                    }}
                >
                    <div className="relative w-full backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                        <div className={isFlipped ? 'pointer-events-none' : ''}>
                            <LoginForm onToggle={toggleView} isVisible={!isFlipped} />
                        </div>
                    </div>

                    <div
                        className="absolute inset-0 w-full h-full backface-hidden"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <div className={!isFlipped ? 'pointer-events-none' : ''}>
                            <RegisterForm onToggle={toggleView} isVisible={isFlipped} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
