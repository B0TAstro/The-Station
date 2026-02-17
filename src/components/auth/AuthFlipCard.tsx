'use client';

import { useState, useRef, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import gsap from 'gsap';
import { AuthParticles } from './AuthParticles';

interface AuthFlipCardProps {
    initialView?: 'login' | 'register';
}

export default function AuthFlipCard({ initialView = 'login' }: AuthFlipCardProps) {
    const [isFlipped, setIsFlipped] = useState(initialView === 'register');
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cardRef.current) return;

        const rotation = isFlipped ? 180 : 0;

        gsap.to(cardRef.current, {
            rotationY: rotation,
            duration: 0.5,
            ease: 'power2.inOut',
        });
    }, [isFlipped]);

    const toggleView = () => {
        const newFlippedState = !isFlipped;
        setIsFlipped(newFlippedState);

        const newView = newFlippedState ? 'register' : 'login';
        window.history.replaceState(null, '', `/auth?view=${newView}`);
    };

    return (
        <div
            className="relative w-full max-w-95 sm:max-w-120 z-10"
            style={{ perspective: '1200px' }}
            ref={containerRef}
        >
            <AuthParticles isFlipped={isFlipped} />

            <div
                ref={cardRef}
                className="relative w-full transition-all duration-300"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
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
    );
}
