'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/components/ui';
import { User, Lock, Building, Upload, Save, Trash2, Plus, X } from 'lucide-react';
import Image from 'next/image';

interface UserProfile {
    id: string;
    email: string;
    prenom?: string;
    nom?: string;
    pseudo?: string;
    avatar_url?: string;
}

interface Bank {
    id: string;
    institution_name: string;
    status: string;
    created_at: string;
}

export default function AccountPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        pseudo: '',
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, banksRes] = await Promise.all([fetch('/api/user/profile'), fetch('/api/user/banks')]);

            const profileData = await profileRes.json();
            const banksData = await banksRes.json();

            if (profileData) {
                setProfile(profileData);
                // Initialise depuis l'API (source de vérité), pas le JWT potentiellement stale
                setFormData({
                    prenom: profileData.prenom || '',
                    nom: profileData.nom || '',
                    pseudo: profileData.pseudo || '',
                });
            }

            setBanks(banksData.banks || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to update profile');

            setMessage({ type: 'success', text: 'Profil mis à jour!' });
            await update();
            fetchData();
        } catch {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Le mot de passe doit faire au moins 6 caractères' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to update password');

            setMessage({ type: 'success', text: 'Mot de passe mis à jour!' });
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;

            setSaving(true);
            try {
                const res = await fetch('/api/user/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ avatar_url: base64 }),
                });

                if (!res.ok) throw new Error('Failed to update avatar');

                setMessage({ type: 'success', text: 'Avatar mis à jour!' });
                await update();
                fetchData();
            } catch {
                setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
            } finally {
                setSaving(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteBank = async (bankId: string) => {
        if (!confirm('Voulez-vous vraiment déconnecter cette banque?')) return;

        try {
            const res = await fetch('/api/user/banks', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: bankId }),
            });

            if (!res.ok) throw new Error('Failed to delete bank');

            fetchData();
        } catch (err) {
            console.error('Error deleting bank:', err);
        }
    };

    const handleConnectBank = async () => {
        try {
            const res = await fetch('/api/true-layer/create-link-token', { method: 'POST' });
            const data = await res.json();
            if (data.authUrl) {
                window.open(data.authUrl, '_blank');
            }
            setTimeout(fetchData, 3000);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-budget" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur">
            <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-border mx-4">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Mon Compte</h2>
                    <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {message && (
                        <div
                            className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Profil
                            </h3>
                            <form onSubmit={handleProfileSubmit} className="space-y-3">
                                <div className="flex flex-col items-center gap-3 mb-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-border bg-muted flex items-center justify-center">
                                            {session?.user?.avatar_url ? (
                                                <Image
                                                    src={session.user.avatar_url}
                                                    alt="Avatar"
                                                    width={96}
                                                    height={96}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <User className="h-10 w-10 text-muted-foreground" />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0.5 right-0.5 bg-budget text-white p-1.5 rounded-full hover:bg-budget-dark shadow-md"
                                        >
                                            <Upload className="h-3.5 w-3.5" />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="text-center">
                                        {(formData.prenom || formData.nom) && (
                                            <p className="font-semibold text-base">
                                                {[formData.prenom, formData.nom].filter(Boolean).join(' ')}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground">{profile?.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="prenom">Prénom</Label>
                                        <Input
                                            id="prenom"
                                            value={formData.prenom}
                                            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                            placeholder="Prénom"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="nom">Nom</Label>
                                        <Input
                                            id="nom"
                                            value={formData.nom}
                                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                            placeholder="Nom"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="pseudo">Pseudo</Label>
                                    <Input
                                        id="pseudo"
                                        value={formData.pseudo}
                                        onChange={(e) => setFormData({ ...formData, pseudo: e.target.value })}
                                        placeholder="Pseudo"
                                    />
                                </div>

                                <Button type="submit" variant="budget" disabled={saving} className="w-full">
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? '...' : 'Enregistrer'}
                                </Button>
                            </form>
                        </section>

                        <section>
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Banques
                            </h3>
                            <div className="space-y-2">
                                {banks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-2">Aucune banque connectée</p>
                                ) : (
                                    banks.map((bank) => (
                                        <div
                                            key={bank.id}
                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Building className="h-4 w-4 text-budget" />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {bank.institution_name || 'Banque'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(bank.created_at).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteBank(bank.id)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}

                                <Button variant="secondary" onClick={handleConnectBank} className="w-full mt-2">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Connecter une banque
                                </Button>
                            </div>
                        </section>

                        <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                            <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Sécurité
                            </h3>
                            {!showPasswordForm ? (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Mot de passe</p>
                                        <p className="text-xs text-muted-foreground">Modifier votre mot de passe de connexion</p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowPasswordForm(true)}
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                        <Lock className="h-3.5 w-3.5 mr-1.5" />
                                        Changer
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                                    <div>
                                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) =>
                                                setPasswordData({ ...passwordData, newPassword: e.target.value })
                                            }
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="confirmPassword">Confirmer</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                            }
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => {
                                                setShowPasswordForm(false);
                                                setPasswordData({ newPassword: '', confirmPassword: '' });
                                                setMessage(null);
                                            }}
                                            className="flex-1"
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                                        >
                                            {saving ? '...' : 'Confirmer'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
