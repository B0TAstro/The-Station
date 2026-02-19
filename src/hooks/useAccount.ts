'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    updateProfile,
    updatePassword,
    getProfile,
    getBanks,
    deleteBank,
    type UserProfile,
    type Bank,
} from '@/lib/account';

export function useAccount() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [profileData, banksData] = await Promise.all([getProfile(), getBanks()]);
            setProfile(profileData);
            setBanks(banksData);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const saveProfile = async (data: { prenom?: string; nom?: string; pseudo?: string }) => {
        setSaving(true);
        setMessage(null);

        const result = await updateProfile(data);

        if (result.success) {
            setMessage({ type: 'success', text: 'Profil mis à jour !' });
            await fetchData();
        } else {
            setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' });
        }

        setSaving(false);
        return result.success;
    };

    const saveAvatar = async (avatar_url: string) => {
        setSaving(true);
        setMessage(null);

        const result = await updateProfile({ avatar_url });

        if (result.success) {
            setMessage({ type: 'success', text: 'Avatar mis à jour !' });
            await fetchData();
        } else {
            setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' });
        }

        setSaving(false);
        return result.success;
    };

    const removeBank = async (bankId: string) => {
        const result = await deleteBank(bankId);
        if (result.success) {
            await fetchData();
        }
        return result.success;
    };

    const changePassword = async (newPassword: string) => {
        setSaving(true);
        setMessage(null);

        const result = await updatePassword(newPassword);

        if (result.success) {
            setMessage({ type: 'success', text: 'Mot de passe mis à jour !' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' });
        }

        setSaving(false);
        return result.success;
    };

    return {
        profile,
        banks,
        loading,
        saving,
        message,
        setMessage,
        fetchData,
        saveProfile,
        saveAvatar,
        removeBank,
        changePassword,
    };
}
