'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import gsap from 'gsap';

interface AuthFlipCardProps {
    initialView?: 'login' | 'register';
}

export default function AuthFlipCard({ initialView = 'login' }: AuthFlipCardProps) {
    const [isFlipped, setIsFlipped] = useState(initialView === 'register');
    const particlesContainerRef = useRef<HTMLDivElement>(null);

    const toggleView = () => {
        const newView = !isFlipped ? 'register' : 'login';
        setIsFlipped(!isFlipped);
        window.history.pushState(null, '', `/${newView}`);
    };

    useEffect(() => {
        if (!particlesContainerRef.current) return;

        const ctx = gsap.context(() => {
            const particles = particlesContainerRef.current?.querySelectorAll('.particle');

            if (particles) {
                particles.forEach((particle, i) => {
                    gsap.to(particle, {
                        y: `random(-20, 20)`,
                        x: `random(-10, 10)`,
                        duration: `random(3, 5)`,
                        repeat: -1,
                        yoyo: true,
                        ease: 'sine.inOut',
                        delay: i * 0.2,
                    });
                });
            }
        }, particlesContainerRef);

        return () => ctx.revert();
    }, []);

    const themeColor = isFlipped ? '--budget' : '--freelance';

    return (
        <>
            <div
                ref={particlesContainerRef}
                className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-700"
                style={{
                    background: isFlipped
                        ? 'radial-gradient(ellipse at 20% 50%, rgba(239,68,68,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(239,68,68,0.03) 0%, transparent 50%)'
                        : 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(59,130,246,0.03) 0%, transparent 50%)',
                }}
            >
                <div className="absolute inset-0">
                    <div
                        className="particle absolute w-1 h-1 rounded-full transition-colors duration-700"
                        style={{
                            top: '15%',
                            left: '20%',
                            background: isFlipped ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)',
                        }}
                    />
                    <div
                        className="particle absolute w-1.5 h-1.5 rounded-full transition-colors duration-700"
                        style={{
                            top: '25%',
                            right: '25%',
                            background: isFlipped ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
                        }}
                    />
                    <div
                        className="particle absolute w-1 h-1 rounded-full transition-colors duration-700"
                        style={{
                            bottom: '30%',
                            left: '15%',
                            background: isFlipped ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)',
                        }}
                    />
                    <div
                        className="particle absolute w-2 h-2 rounded-full transition-colors duration-700"
                        style={{
                            bottom: '20%',
                            right: '20%',
                            background: isFlipped ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                        }}
                    />
                    <div
                        className="particle absolute w-1 h-1 rounded-full transition-colors duration-700"
                        style={{
                            top: '60%',
                            left: '35%',
                            background: isFlipped ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
                        }}
                    />
                    <div
                        className="particle absolute w-1.5 h-1.5 rounded-full transition-colors duration-700"
                        style={{
                            top: '40%',
                            right: '10%',
                            background: isFlipped ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                        }}
                    />
                </div>
            </div>

            <div className="relative w-full max-w-[380px] sm:max-w-[480px] z-10" style={{ perspective: '1200px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isFlipped ? 'red' : 'blue'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute -inset-4 rounded-3xl blur-3xl pointer-events-none"
                        style={{
                            background: isFlipped
                                ? 'radial-gradient(ellipse at center, rgba(239,68,68,0.4) 0%, transparent 70%)'
                                : 'radial-gradient(ellipse at center, rgba(59,130,246,0.4) 0%, transparent 70%)',
                        }}
                    />
                </AnimatePresence>

                <motion.div
                    className="w-full relative"
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.7, type: 'spring', stiffness: 200, damping: 25 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div
                        className={`w-full ${isFlipped ? 'absolute inset-0' : 'relative'}`}
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <LoginForm onToggle={toggleView} />
                    </div>

                    <div
                        className={`w-full ${isFlipped ? 'relative' : 'absolute inset-0'}`}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <RegisterForm onToggle={toggleView} />
                    </div>
                </motion.div>
            </div>
        </>
    );
}
