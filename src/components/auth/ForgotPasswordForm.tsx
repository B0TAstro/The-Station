'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Mail, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { forgotPasswordSchema } from '@/lib/validations/auth';

interface ForgotPasswordFormProps {
    onBack: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const validation = forgotPasswordSchema.safeParse({ email });
        if (!validation.success) {
            setError(validation.error.issues[0].message);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Une erreur est survenue.');
                return;
            }

            setSuccess(true);
        } catch {
            setError('Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center space-y-5">
                <div
                    className="mx-auto w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
                    }}
                >
                    <Mail className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.
                </p>
                <Button variant="secondary" className="w-full" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour à la connexion
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {error && (
                <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    required
                    autoFocus
                />
                <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <KeyRound className="h-4 w-4 mr-2" />
                    )}
                    Envoyer le lien
                </Button>
            </form>
            <button
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour
            </button>
        </div>
    );
}
