'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBanks, deleteBank, type Bank } from '@/lib/account';

export function useBanks() {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBanks = useCallback(async () => {
        try {
            const banksData = await getBanks();
            setBanks(banksData);
        } catch (err) {
            console.error('Error fetching banks:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanks();
    }, [fetchBanks]);

    const removeBank = async (bankId: string) => {
        const result = await deleteBank(bankId);
        if (result.success) {
            await fetchBanks();
        }
        return result.success;
    };

    return {
        banks,
        loading,
        removeBank,
        refetch: fetchBanks,
    };
}
