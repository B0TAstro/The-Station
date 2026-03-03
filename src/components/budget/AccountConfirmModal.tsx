'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/shared/ui';

export interface DetectedAccount {
    accountNumber: string | null;
    accountName: string;
    exists: boolean;
    id?: string;
}

interface AccountConfirmModalProps {
    accounts: DetectedAccount[];
    onConfirm: (confirmedAccounts: Array<{ accountNumber: string | null; accountName: string }>) => void;
    onCancel: () => void;
}

export function AccountConfirmModal({ accounts, onConfirm, onCancel }: AccountConfirmModalProps) {
    const [accountNames, setAccountNames] = useState<Record<number, string>>(() => {
        const initial: Record<number, string> = {};
        accounts.forEach((acc, idx) => {
            initial[idx] = acc.accountName;
        });
        return initial;
    });

    const newAccounts = accounts.filter((acc) => !acc.exists);

    const handleConfirm = () => {
        const confirmed = accounts.map((acc, idx) => ({
            accountNumber: acc.accountNumber,
            accountName: acc.exists ? acc.accountName : accountNames[idx],
        }));
        onConfirm(confirmed);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
            <div className="relative bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-semibold mb-4">Nouveau(x) compte(s) détecté(s)</h2>

                <div className="space-y-4 mb-6">
                    {newAccounts.map((acc, idx) => {
                        const originalIdx = accounts.indexOf(acc);
                        return (
                            <div key={idx} className="space-y-2">
                                <label className="text-sm text-muted-foreground">
                                    Compte {idx + 1} {acc.accountNumber && `(n° ${acc.accountNumber})`}
                                </label>
                                <Input
                                    value={accountNames[originalIdx] || ''}
                                    onChange={(e) =>
                                        setAccountNames((prev) => ({ ...prev, [originalIdx]: e.target.value }))
                                    }
                                    placeholder="Nom du compte"
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={onCancel}>
                        Annuler
                    </Button>
                    <Button variant="budget" onClick={handleConfirm}>
                        Confirmer
                    </Button>
                </div>
            </div>
        </div>
    );
}
