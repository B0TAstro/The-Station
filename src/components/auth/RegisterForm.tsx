'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui';
import ImageUpload from '@/components/ui/ImageUpload';
import { Loader2, UserPlus, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { registerSchema } from '@/lib/schemas/auth';
import gsap from 'gsap';
import { useAuthAnimation } from '@/hooks/useAuthAnimation';
import { AuthSuccess } from './AuthSuccess';
import { RegisterStepper } from './RegisterStepper';

interface RegisterFormProps {
    onToggle: () => void;
    isVisible?: boolean;
}

const TOTAL_STEPS = 3;

export default function RegisterForm({ onToggle, isVisible = false }: RegisterFormProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        pseudo: '',
        nom: '',
        prenom: '',
        email: '',
        password: '',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const formContainerRef = useRef<HTMLFormElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useAuthAnimation(contentRef, isVisible);

    useEffect(() => {
        if (!formContainerRef.current) return;

        const elements = formContainerRef.current.querySelectorAll('.className-step > *');

        gsap.fromTo(
            elements,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
        );
    }, [step]);

    useEffect(() => {
        setError('');
    }, [step]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setTouched({ ...touched, [e.target.name]: true });
    };

    const nextStep = async () => {
        setError('');

        if (step === 1) {
            if (!formData.prenom.trim() || !formData.nom.trim()) {
                setError('Le prénom et le nom sont requis');
                return;
            }
        }

        if (step === 2) {
            if (!formData.pseudo.trim()) {
                setError('Le pseudo est requis');
                return;
            }

            setLoading(true);
            try {
                const res = await fetch('/api/auth/availability', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pseudo: formData.pseudo }),
                });

                const data = await res.json();

                if (!data.available && data.field === 'pseudo') {
                    setError('Ce pseudo est déjà pris');
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.error('Error checking pseudo:', err);
                setError('Erreur lors de la vérification du pseudo');
                setLoading(false);
                return;
            } finally {
                setLoading(false);
            }
        }

        setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    };

    const prevStep = () => {
        setError('');
        setStep((s) => Math.max(s - 1, 1));
    };

    const handleRegister = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const validation = registerSchema.safeParse(formData);
        if (!validation.success) {
            setError(validation.error.issues[0].message);
            setLoading(false);
            return;
        }

        try {
            const checkRes = await fetch('/api/auth/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });

            const checkData = await checkRes.json();

            if (!checkData.available && checkData.field === 'email') {
                setError('Cet email est déjà utilisé');
                setLoading(false);
                return;
            }
        } catch (err) {
            console.error('Error checking email:', err);
        }

        try {
            let avatarUrl = null;

            if (avatarFile) {
                const { supabase } = await import('@/lib/client/supabase');

                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { data, error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, avatarFile, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (uploadError) {
                    console.error('Avatar upload error:', uploadError);
                    setError("Erreur lors de l'upload de l'avatar");
                    setLoading(false);
                    return;
                }

                const {
                    data: { publicUrl },
                } = supabase.storage.from('avatars').getPublicUrl(data.path);

                avatarUrl = publicUrl;
            }

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...validation.data,
                    avatar_url: avatarUrl,
                }),
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
            <AuthSuccess
                title="Inscription réussie !"
                message="Ton compte a été créé. Il est en attente de validation par un administrateur. Tu pourras te connecter une fois autorisé."
                onAction={onToggle}
                actionLabel="Retour à la connexion"
            />
        );
    }

    return (
        <div
            className="w-full rounded-2xl border border-border p-6 sm:p-8 flex flex-col"
            style={{
                background: 'linear-gradient(145deg, var(--card) 0%, rgba(9,9,11,0.98) 100%)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
            ref={contentRef}
        >
            <div className="text-center mb-6">
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
                        style={{ background: 'linear-gradient(135deg, var(--freelance), var(--freelance-light))' }}
                    />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight anim-item">Créer un compte</h1>
                <p className="text-sm text-muted-foreground mt-1.5 anim-item">Rejoins The Station</p>
            </div>

            <RegisterStepper currentStep={step} steps={stepLabels} />

            <div className="h-4 mb-2" />

            {error && (
                <div className="mb-5 p-3 rounded-xl bg-freelance-muted border border-freelance/20 text-freelance-light text-sm anim-item">
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister} className="min-h-40 anim-item" ref={formContainerRef} noValidate>
                {step === 1 && (
                    <div className="space-y-4 className-step">
                        <Input
                            label="Prénom"
                            name="prenom"
                            value={formData.prenom}
                            onChange={handleChange}
                            placeholder="John"
                            required
                            variant="freelance"
                            className="border-white/10 focus:border-freelance focus:ring-freelance/20 bg-white/5"
                        />
                        <Input
                            label="Nom"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            placeholder="Doe"
                            required
                            variant="freelance"
                            className="border-white/10 focus:border-freelance focus:ring-freelance/20 bg-white/5"
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 className-step">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Photo de profil
                            </label>
                            <ImageUpload value={null} onChange={setAvatarFile} />
                        </div>
                        <Input
                            label="Pseudo"
                            name="pseudo"
                            value={formData.pseudo}
                            onChange={handleChange}
                            placeholder="johndoe"
                            autoFocus
                            required
                            variant="freelance"
                            className="border-white/10 focus:border-freelance focus:ring-freelance/20 bg-white/5"
                        />
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 className-step">
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            variant="freelance"
                            className="border-white/10 focus:border-freelance focus:ring-freelance/20 bg-white/5"
                        />
                        <Input
                            label="Mot de passe"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            autoFocus
                            required
                            variant="freelance"
                            className="border-white/10 focus:border-freelance focus:ring-freelance/20 bg-white/5"
                        />
                    </div>
                )}

                <div className="flex gap-3 mt-6 pt-2">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium border border-border bg-white/3 text-foreground hover:bg-white/6 transition-all duration-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour
                        </button>
                    )}

                    {step < TOTAL_STEPS ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold text-white shadow-[0_4px_12px_var(--freelance-muted)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                background: 'linear-gradient(135deg, var(--freelance) 0%, var(--freelance-dark) 100%)',
                            }}
                        >
                            Suivant
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold text-white shadow-[0_0_20px_var(--freelance-muted)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            style={{
                                background: 'linear-gradient(135deg, var(--freelance) 0%, var(--freelance-dark) 100%)',
                            }}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    Créer mon compte
                                </>
                            )}
                        </button>
                    )}
                </div>
            </form>

            <div className="pt-5 mt-5 border-t border-border text-center text-sm anim-item">
                <span className="text-muted-foreground/60">Déjà un compte ? </span>
                <button
                    onClick={onToggle}
                    className="font-medium transition-colors text-freelance hover:text-freelance-dark"
                >
                    Se connecter
                </button>
            </div>
        </div>
    );
}
