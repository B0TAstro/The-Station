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
    onConfirm: (
        confirmedAccounts: Array<{ accountNumber: string | null; accountName: string; accountType: string }>,
    ) => void;
    onCancel: () => void;
}

const ACCOUNT_TYPES = [
    { value: 'courant', label: 'Courant' },
    { value: 'epargne', label: 'Épargne' },
    { value: 'depot', label: 'Dépôt' },
    { value: 'autre', label: 'Autre' },
];

export function AccountConfirmModal({ accounts, onConfirm, onCancel }: AccountConfirmModalProps) {
    const newAccounts = accounts.filter((acc) => !acc.exists);
    const isSingleNewAccount = newAccounts.length === 1;

    const [currentStep, setCurrentStep] = useState(0);
    const [currentName, setCurrentName] = useState(() => {
        if (newAccounts.length > 0) {
            return newAccounts[0].accountName;
        }
        return '';
    });
    const [currentType, setCurrentType] = useState('courant');
    const [customTypeName, setCustomTypeName] = useState('');

    const currentNewAccount = newAccounts[currentStep];
    const isLastNewAccount = currentStep === newAccounts.length - 1;

    const getDisplayLabel = (account: DetectedAccount) => {
        if (account.accountNumber) {
            return `Compte (n° ${account.accountNumber})`;
        }
        return `Compte ${currentStep + 1}`;
    };

    const getFinalType = () => {
        if (currentType === 'autre' && customTypeName.trim()) {
            return customTypeName.trim();
        }
        return currentType;
    };

    const handleNext = () => {
        const confirmedData = {
            accountNumber: currentNewAccount.accountNumber,
            accountName: currentName,
            accountType: getFinalType(),
        };

        if (isLastNewAccount) {
            const existingData = accounts
                .filter((acc) => acc.exists)
                .map((acc) => ({
                    accountNumber: acc.accountNumber,
                    accountName: acc.accountName,
                    accountType: 'courant',
                }));

            const result = [...existingData, confirmedData];
            onConfirm(result);
        } else {
            setCurrentStep((prev) => prev + 1);
            if (newAccounts[currentStep + 1]) {
                setCurrentName(newAccounts[currentStep + 1].accountName);
                setCurrentType('courant');
                setCustomTypeName('');
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
                    accountType: 'courant',
                }));
            onConfirm(result);
        } else {
            setCurrentStep((prev) => prev + 1);
            if (newAccounts[currentStep + 1]) {
                setCurrentName(newAccounts[currentStep + 1].accountName);
                setCurrentType('courant');
                setCustomTypeName('');
            }
        }
    };

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

                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Type de compte</label>
                        <select
                            value={currentType}
                            onChange={(e) => {
                                setCurrentType(e.target.value);
                                if (e.target.value !== 'autre') {
                                    setCustomTypeName('');
                                }
                            }}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-budget"
                        >
                            {ACCOUNT_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {currentType === 'autre' && (
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Nom du type</label>
                            <Input
                                value={customTypeName}
                                onChange={(e) => setCustomTypeName(e.target.value)}
                                placeholder="Autre type..."
                            />
                        </div>
                    )}
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
