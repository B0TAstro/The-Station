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
    const newAccounts = accounts.filter((acc) => !acc.exists);
    const existingAccounts = accounts.filter((acc) => acc.exists);
    const isSingleNewAccount = newAccounts.length === 1;

    const [currentStep, setCurrentStep] = useState(0);
    const [confirmedNames, setConfirmedNames] = useState<Record<number, string>>(() => {
        const initial: Record<number, string> = {};
        newAccounts.forEach((acc, idx) => {
            initial[idx] = acc.accountName;
        });
        return initial;
    });

    const currentNewAccount = newAccounts[currentStep];
    const isLastNewAccount = currentStep === newAccounts.length - 1;

    const getDisplayLabel = (account: DetectedAccount) => {
        if (account.accountNumber) {
            return `Compte (n° ${account.accountNumber})`;
        }
        return `Compte ${currentStep + 1}`;
    };

    const handleNext = () => {
        const updatedNames = { ...confirmedNames, [currentStep]: currentName };

        if (isLastNewAccount) {
            const result = accounts.map((acc, idx) => {
                if (acc.exists) {
                    return { accountNumber: acc.accountNumber, accountName: acc.accountName };
                }
                const newIdx = newAccounts.indexOf(acc);
                return { accountNumber: acc.accountNumber, accountName: updatedNames[newIdx] || acc.accountName };
            });
            onConfirm(result);
        } else {
            setConfirmedNames(updatedNames);
            setCurrentStep((prev) => prev + 1);
            if (newAccounts[currentStep + 1]) {
                setCurrentName(newAccounts[currentStep + 1].accountName);
            }
        }
    };

    const handleSkip = () => {
        if (isLastNewAccount) {
            const result = accounts
                .filter((acc) => acc.exists)
                .map((acc) => ({
                    accountNumber: acc.accountNumber,
                    accountName: acc.accountName,
                }));
            onConfirm(result);
        } else {
            setCurrentStep((prev) => prev + 1);
            if (newAccounts[currentStep + 1]) {
                setCurrentName(newAccounts[currentStep + 1].accountName);
            }
        }
    };

    const [currentName, setCurrentName] = useState(() => {
        if (newAccounts.length > 0) {
            return confirmedNames[currentStep] || newAccounts[0].accountName;
        }
        return '';
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
            <div className="relative bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-semibold mb-4">
                    {isSingleNewAccount
                        ? 'Nouveau compte détecté'
                        : `Nouveaux comptes détectés (${currentStep + 1}/${newAccounts.length})`}
                </h2>

                <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">{getDisplayLabel(currentNewAccount)}</label>
                        <Input
                            value={currentName}
                            onChange={(e) => setCurrentName(e.target.value)}
                            placeholder="Nom du compte"
                        />
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={onCancel}>
                        Annuler
                    </Button>
                    {!isSingleNewAccount && (
                        <Button variant="ghost" onClick={handleSkip}>
                            Ignorer
                        </Button>
                    )}
                    <Button variant="budget" onClick={handleNext}>
                        {isLastNewAccount ? 'Confirmer' : 'Suivant'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
