'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Lock, Building } from 'lucide-react';
import { Avatar, ProfileForm, BankList, PasswordSection, AccountModal } from '@/components/account';
import { useBanks } from '@/hooks/useAccount';

export default function AccountPage() {
    const { data: session, update } = useSession();
    const { banks, removeBank } = useBanks();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({ prenom: '', nom: '', pseudo: '' });
    const [initialData, setInitialData] = useState({ prenom: '', nom: '', pseudo: '' });

    const isDirty =
        formData.prenom !== initialData.prenom ||
        formData.nom !== initialData.nom ||
        formData.pseudo !== initialData.pseudo;

    useEffect(() => {
        if (session?.user) {
            const data = {
                prenom: session.user.prenom || '',
                nom: session.user.nom || '',
                pseudo: session.user.pseudo || '',
            };
            setInitialData(data);
            setFormData(data);
        }
        setLoading(false);
    }, [session]);

    const saveProfile = async (data: { prenom?: string; nom?: string; pseudo?: string }) => {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (result.success) {
                setMessage({ type: 'success', text: 'Profil mis à jour !' });
                await update();
            } else {
                setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
        }

        setSaving(false);
    };

    const saveAvatar = async (base64: string) => {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar_url: base64 }),
            });

            const result = await res.json();

            if (result.success) {
                setMessage({ type: 'success', text: 'Avatar mis à jour !' });
                await update();
                return true;
            } else {
                setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
        }

        setSaving(false);
        return false;
    };

    const changePassword = async (newPassword: string): Promise<boolean> => {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword }),
            });

            const result = await res.json();

            if (result.success) {
                setMessage({ type: 'success', text: 'Mot de passe mis à jour !' });
                setSaving(false);
                return true;
            } else {
                setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
        }

        setSaving(false);
        return false;
    };

    const handleAvatarChange = async (file: File) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            await saveAvatar(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleProfileSave = async () => {
        await saveProfile(formData);
    };

    const handleProfileCancel = () => {
        setFormData(initialData);
        setMessage(null);
    };

    const handleConnectBank = async () => {
        try {
            const res = await fetch('/api/transactions/true-layer/create-link-token', { method: 'POST' });
            const data = await res.json();
            if (data.authUrl) {
                window.open(data.authUrl, '_blank');
            }
        } catch (_err) {
            console.error('Error:', _err);
        }
    };

    const handleDeleteBank = async (bankId: string) => {
        if (!confirm('Voulez-vous vraiment déconnecter cette banque?')) return;
        await removeBank(bankId);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-budget" />
            </div>
        );
    }

    return (
        <AccountModal title="Mon Compte">
            {message && (
                <div
                    className={`mb-4 p-3 rounded-lg text-sm ${
                        message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                <section>
                    <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profil
                    </h3>

                    <div className="flex flex-col items-center gap-2 mb-5">
                        <Avatar src={session?.user?.avatar_url} onChange={handleAvatarChange} loading={saving} />
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-base">
                                {formData.pseudo || initialData.pseudo || 'Pseudo'}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                    </div>

                    <ProfileForm
                        formData={formData}
                        onChange={setFormData}
                        onSave={handleProfileSave}
                        onCancel={handleProfileCancel}
                        saving={saving}
                        isDirty={isDirty}
                    />
                </section>

                <div className="border-t border-border" />

                <section>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Banques
                    </h3>
                    <BankList banks={banks} onConnect={handleConnectBank} onDelete={handleDeleteBank} />
                </section>

                <div className="border-t border-border" />

                <section>
                    <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Sécurité
                    </h3>
                    <PasswordSection onSave={changePassword} saving={saving} />
                </section>
            </div>
        </AccountModal>
    );
}
