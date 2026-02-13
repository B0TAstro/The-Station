'use client';

import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui';
import gsap from 'gsap';
import ForgotPasswordForm from './ForgotPasswordForm';
import { Github, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface LoginFormProps {
    onToggle: () => void;
    isVisible?: boolean;
}

export default function LoginForm({ onToggle, isVisible = true }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showForgot, setShowForgot] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Initial Stagger Animation
    useEffect(() => {
        if (!contentRef.current || !isVisible || showForgot) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            tl.fromTo('.anim-item',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.1 }
            );
        }, contentRef);

        return () => ctx.revert();
    }, [isVisible, showForgot]);

    // GSAP Animation for view switch (Login <-> Forgot)
    useEffect(() => {
        if (!containerRef.current) return;

        gsap.fromTo(containerRef.current,
            { opacity: 0, x: showForgot ? 20 : -20 },
            { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
        );
    }, [showForgot]);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error.includes('Trop de tentatives')) {
                    setError('Trop de tentatives. Réessayez dans quelques minutes.');
                } else {
                    setError('Email non autorisé ou mot de passe incorrect');
                }
            } else {
                window.location.href = '/';
            }
        } catch {
            setError('Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="w-full rounded-2xl border border-white/[0.06] p-6 sm:p-8"
            style={{
                background: 'linear-gradient(145deg, rgba(17,17,19,0.95) 0%, rgba(9,9,11,0.98) 100%)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
            ref={contentRef}
        >
            <div className="text-center mb-8">
                <div className="relative inline-block mb-4 anim-item">
                    <Image
                        src="/logo-the-station.jpg"
                        alt="The Station"
                        width={56}
                        height={56}
                        className="rounded-xl ring-2 ring-white/10"
                    />
                    <div
                        className="absolute -inset-2 rounded-2xl -z-10 blur-md opacity-40"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                    />
                </div>
                <h1 className="text-2xl font-bold tracking-tight anim-item">The Station</h1>
                <p className="text-sm text-muted-foreground mt-1.5 anim-item">
                    {showForgot ? 'Réinitialiser le mot de passe' : 'Connecte-toi pour accéder à ton espace'}
                </p>
            </div>

            <div ref={containerRef}>
                {showForgot ? (
                    <ForgotPasswordForm onBack={() => setShowForgot(false)} />
                ) : (
                    <div>
                        {error && (
                            <div className="mb-5 p-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm anim-item">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 mb-6 anim-item">
                            <button
                                onClick={() => signIn('google', { redirectTo: '/' })}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 h-11 rounded-xl border border-white/[0.06] bg-white/[0.03] text-sm font-medium text-foreground hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 disabled:opacity-50"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google
                            </button>

                            <button
                                onClick={() => signIn('github', { redirectTo: '/' })}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 h-11 rounded-xl border border-white/[0.06] bg-white/[0.03] text-sm font-medium text-foreground hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 disabled:opacity-50"
                            >
                                <Github className="h-4 w-4" />
                                GitHub
                            </button>
                        </div>

                        <div className="relative mb-6 anim-item">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.06]" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 text-muted-foreground/60" style={{ background: 'rgb(13,13,15)' }}>
                                    ou continue avec ton email
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleCredentialsLogin} className="space-y-4 mb-3">
                            <div className="anim-item">
                                <Input
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ton@email.com"
                                    required
                                />
                            </div>
                            <div className="anim-item">
                                <Input
                                    label="Mot de passe"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="flex justify-end anim-item">
                                <button
                                    type="button"
                                    onClick={() => setShowForgot(true)}
                                    className="text-xs text-accent hover:text-accent/80 transition-colors"
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 anim-item"
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    boxShadow: '0 0 20px rgba(59,130,246,0.25), 0 1px 3px rgba(0,0,0,0.3)',
                                }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Connexion...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">Se connecter</span>
                                )}
                            </button>
                        </form>

                        <div className="pt-5 border-t border-white/[0.04] text-center text-sm anim-item">
                            <span className="text-muted-foreground/60">Pas encore de compte ? </span>
                            <button
                                onClick={onToggle}
                                className="text-accent font-medium hover:text-accent/80 transition-colors"
                            >
                                S&apos;inscrire
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
