'use client';

import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui';
import gsap from 'gsap';
import ForgotPasswordForm from './ForgotPasswordForm';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuthAnimation } from '@/hooks/useAuthAnimation';

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

    useAuthAnimation(contentRef, isVisible && !showForgot);

    useEffect(() => {
        if (!containerRef.current) return;

        gsap.fromTo(
            containerRef.current,
            { opacity: 0, x: showForgot ? 20 : -20 },
            { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' },
        );
    }, [showForgot]);

    const handleCredentialsLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
            className="w-full rounded-2xl border border-border p-6 sm:p-8 flex flex-col"
            style={{
                background: 'linear-gradient(145deg, var(--card) 0%, rgba(9,9,11,0.98) 100%)',
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
                        style={{ background: 'linear-gradient(135deg, var(--budget), var(--budget-dark))' }}
                    />
                </div>
                <h1 className="text-2xl font-bold tracking-tight anim-item">The Station</h1>
                <p className="text-sm text-muted-foreground mt-1.5 anim-item">
                    {showForgot ? 'Réinitialiser le mot de passe' : 'Connecte-toi pour accéder à ton espace'}
                </p>
            </div>

            <div className="flex-1 flex flex-col justify-center" ref={containerRef}>
                {showForgot ? (
                    <ForgotPasswordForm onBack={() => setShowForgot(false)} />
                ) : (
                    <div>
                        {error && (
                            <div className="mb-5 p-3 rounded-xl bg-budget-muted border border-budget/20 text-budget-light text-sm anim-item">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCredentialsLogin} className="space-y-4 mb-2">
                            <div className="anim-item">
                                <Input
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ton@email.com"
                                    required
                                    className="border-white/10 focus:border-budget focus:ring-budget/20 bg-white/5"
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
                                    className="border-white/10 focus:border-budget focus:ring-budget/20 bg-white/5"
                                />
                            </div>
                            <div className="flex justify-end anim-item">
                                <button
                                    type="button"
                                    onClick={() => setShowForgot(true)}
                                    className="text-xs font-medium text-muted-foreground hover:text-budget transition-colors"
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 rounded-xl text-sm font-semibold text-white shadow-[0_0_20px_var(--budget-muted)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none anim-item flex items-center justify-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, var(--budget) 0%, var(--budget-dark) 100%)',
                                }}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Se connecter'}
                            </button>
                        </form>

                        <div className="pt-5 mt-5 border-t border-border text-center text-sm anim-item">
                            <span className="text-muted-foreground/60">Pas encore de compte ? </span>
                            <button
                                onClick={onToggle}
                                className="font-medium transition-colors text-budget hover:text-budget-dark"
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
