'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui';
import { Loader2, UserPlus, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';

interface RegisterFormProps {
    onToggle: () => void;
}

const TOTAL_STEPS = 3;

const fadeVariants = {
    enter: { opacity: 0, x: 0 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 0 },
};

export default function RegisterForm({ onToggle }: RegisterFormProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        pseudo: '',
        nom: '',
        prenom: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        setError('');
        setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    };

    const prevStep = () => {
        setError('');
        setStep((s) => Math.max(s - 1, 1));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Une erreur est survenue lors de l'inscription.");
                return;
            }

            setSuccess(true);
        } catch (err) {
            console.error('Registration error:', err);
            setError("Une erreur est survenue lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    const stepLabels = ['Identité', 'Pseudo', 'Sécurité'];

    if (success) {
        return (
            <div
                className="w-full rounded-2xl border border-white/[0.06] p-6 sm:p-8 text-center"
                style={{
                    background: 'linear-gradient(145deg, rgba(17,17,19,0.95) 0%, rgba(9,9,11,0.98) 100%)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 25px 50px -12px rgba(0,0,0,0.5)',
                }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, type: 'spring' }}
                    className="space-y-5 flex flex-col items-center justify-center h-full"
                >
                    <div
                        className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))' }}
                    >
                        <Check className="h-8 w-8 text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Inscription réussie !</h1>
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                            Ton compte a été créé. Il est en attente de validation par un administrateur. Tu pourras te
                            connecter une fois autorisé.
                        </p>
                    </div>
                    <button
                        onClick={onToggle}
                        className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                        style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            boxShadow: '0 0 20px rgba(239,68,68,0.25), 0 1px 3px rgba(0,0,0,0.3)',
                        }}
                    >
                        Retour à la connexion
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            className="w-full rounded-2xl border border-white/[0.06] p-6 sm:p-8"
            style={{
                background: 'linear-gradient(145deg, rgba(17,17,19,0.95) 0%, rgba(9,9,11,0.98) 100%)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
        >
            <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                    <Image
                        src="/logo-the-station.jpg"
                        alt="The Station"
                        width={56}
                        height={56}
                        className="rounded-xl ring-2 ring-white/10"
                    />
                    <div
                        className="absolute -inset-2 rounded-2xl -z-10 blur-md opacity-40"
                        style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
                    />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Créer un compte</h1>
                <p className="text-sm text-muted-foreground mt-1.5">Rejoins The Station</p>
            </div>

            <div className="flex items-center mb-8">
                {stepLabels.map((label, i) => {
                    const stepNum = i + 1;
                    const isActive = stepNum === step;
                    const isDone = stepNum < step;

                    return (
                        <div key={label} className="flex items-center flex-1">
                            {i > 0 && (
                                <div
                                    className="h-px flex-1 transition-colors duration-300"
                                    style={{
                                        background: isDone
                                            ? 'linear-gradient(90deg, #ef4444, rgba(239,68,68,0.3))'
                                            : 'rgba(255,255,255,0.06)',
                                    }}
                                />
                            )}
                            <div className="flex flex-col items-center gap-1.5">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0"
                                    style={{
                                        background: isDone
                                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                            : isActive
                                              ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1))'
                                              : 'rgba(255,255,255,0.04)',
                                        color: isDone ? '#fff' : isActive ? '#f87171' : 'rgba(255,255,255,0.25)',
                                        boxShadow: isDone ? '0 0 12px rgba(239,68,68,0.3)' : 'none',
                                    }}
                                >
                                    {isDone ? <Check className="h-3.5 w-3.5" /> : stepNum}
                                </div>
                                <span
                                    className="text-[10px] font-medium transition-colors duration-300 whitespace-nowrap"
                                    style={{
                                        color: isDone || isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                                    }}
                                >
                                    {label}
                                </span>
                            </div>
                            {i < stepLabels.length - 1 && (
                                <div
                                    className="h-px flex-1 transition-colors duration-300"
                                    style={{
                                        background: isDone
                                            ? 'linear-gradient(90deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1))'
                                            : 'rgba(255,255,255,0.06)',
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister}>
                <div className="relative overflow-hidden min-h-[160px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={fadeVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="space-y-4"
                            >
                                <Input
                                    label="Prénom"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    placeholder="Jean"
                                    required
                                    autoFocus
                                    className="focus:border-red-500 focus:ring-red-500/20"
                                />
                                <Input
                                    label="Nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    placeholder="Dupont"
                                    required
                                    className="focus:border-red-500 focus:ring-red-500/20"
                                />
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={fadeVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="space-y-3"
                            >
                                <Input
                                    label="Pseudo"
                                    name="pseudo"
                                    value={formData.pseudo}
                                    onChange={handleChange}
                                    placeholder="jdupont"
                                    required
                                    autoFocus
                                    className="focus:border-red-500 focus:ring-red-500/20"
                                />
                                <p className="text-xs text-muted-foreground/60 pl-0.5">
                                    Ce pseudo sera visible par les autres membres.
                                </p>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                variants={fadeVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="space-y-4"
                            >
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="jean.dupont@example.com"
                                    required
                                    autoFocus
                                    className="focus:border-red-500 focus:ring-red-500/20"
                                />
                                <Input
                                    label="Mot de passe"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="focus:border-red-500 focus:ring-red-500/20"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex gap-3 mt-6">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium border border-white/[0.06] bg-white/[0.03] text-foreground hover:bg-white/[0.06] transition-all duration-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour
                        </button>
                    )}

                    {step < TOTAL_STEPS ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={
                                (step === 1 && (!formData.prenom || !formData.nom)) || (step === 2 && !formData.pseudo)
                            }
                            className="flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                boxShadow: '0 0 20px rgba(239,68,68,0.2), 0 1px 3px rgba(0,0,0,0.3)',
                            }}
                        >
                            Suivant
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
                            style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                boxShadow: '0 0 20px rgba(239,68,68,0.25), 0 1px 3px rgba(0,0,0,0.3)',
                            }}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    S&apos;inscrire
                                </>
                            )}
                        </button>
                    )}
                </div>
            </form>

            <div className="pt-5 mt-5 border-t border-white/[0.04] text-center text-sm">
                <span className="text-muted-foreground/60">Déjà un compte ? </span>
                <button onClick={onToggle} className="font-medium transition-colors" style={{ color: '#f87171' }}>
                    Se connecter
                </button>
            </div>
        </div>
    );
}
