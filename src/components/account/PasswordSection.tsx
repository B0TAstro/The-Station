'use client';

import { useState } from 'react';
import { Button, Input, Label } from '@/components/shared/ui';
import { Lock } from 'lucide-react';

interface PasswordSectionProps {
    onSave: (password: string) => Promise<boolean>;
    saving: boolean;
}

export function PasswordSection({ onSave, saving }: PasswordSectionProps) {
    const [showForm, setShowForm] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return;
        }
        if (password.length < 6) {
            return;
        }
        const success = await onSave(password);
        if (success) {
            setShowForm(false);
            setPassword('');
            setConfirmPassword('');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setPassword('');
        setConfirmPassword('');
    };

    if (!showForm) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Mot de passe</p>
                        <p className="text-xs text-muted-foreground">Modifier votre mot de passe de connexion</p>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowForm(true)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                        <Lock className="h-3.5 w-3.5 mr-1.5" />
                        Changer
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                        id="newPassword"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="confirmPassword">Confirmer</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={handleCancel} className="flex-1">
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving || password !== confirmPassword || password.length < 6}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                        {saving ? '...' : 'Confirmer'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
