'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Lock, Building } from 'lucide-react';
import { Avatar, ProfileForm, BankList, PasswordSection, AccountModal } from '@/components/account';
import { useAccount } from '@/hooks/useAccount';

export default function AccountPage() {
    const { data: session, update } = useSession();
    const {
        profile,
        banks,
        loading,
        saving,
        message,
        setMessage,
        saveProfile,
        saveAvatar,
        removeBank,
        changePassword,
    } = useAccount();

    const [formData, setFormData] = useState({ prenom: '', nom: '', pseudo: '' });
    const [initialData, setInitialData] = useState({ prenom: '', nom: '', pseudo: '' });

    const isDirty =
        formData.prenom !== initialData.prenom ||
        formData.nom !== initialData.nom ||
        formData.pseudo !== initialData.pseudo;

    useEffect(() => {
        if (profile) {
            const data = {
                prenom: profile.prenom || '',
                nom: profile.nom || '',
                pseudo: profile.pseudo || '',
            };
            setInitialData(data);
            setFormData(data);
        }
    }, [profile]);

    const handleAvatarChange = async (file: File) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            const success = await saveAvatar(base64);
            if (success) {
                await update();
            }
        };
        reader.readAsDataURL(file);
    };

    const handleProfileSave = async () => {
        const success = await saveProfile(formData);
        if (success) {
            await update();
        }
    };

    const handleProfileCancel = () => {
        setFormData(initialData);
        setMessage(null);
    };

    const handleConnectBank = async () => {
        try {
            const res = await fetch('/api/true-layer/create-link-token', { method: 'POST' });
            const data = await res.json();
            if (data.authUrl) {
                window.open(data.authUrl, '_blank');
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleDeleteBank = async (bankId: string) => {
        if (!confirm('Voulez-vous vraiment déconnecter cette banque?')) return;
        await removeBank(bankId);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur">
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
                        <p className="text-sm text-muted-foreground">{profile?.email}</p>
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
