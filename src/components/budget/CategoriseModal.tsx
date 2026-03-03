'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/shared/ui';
import { X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Transaction {
    id: string;
    amount: number;
    date: string;
    description: string;
    name: string | null;
    category: string | null;
}

interface CategoriseModalProps {
    transactions: Transaction[];
    onClose: () => void;
    onComplete: () => void;
}

const CATEGORIES = [
    { value: 'income', label: 'Salaire / Aide' },
    { value: 'savings', label: 'Épargne / Crypto / Etc' },
    { value: 'rent', label: 'Loyer' },
    { value: 'food', label: 'Courses' },
    { value: 'transport', label: 'Transport' },
    { value: 'subscription', label: 'Abonnement' },
    { value: 'activities', label: 'Loisir' },
    { value: 'professional', label: 'Pro' },
    { value: 'healthcare', label: 'Santé' },
    { value: 'extra', label: 'Extra' },
    { value: 'other', label: 'Autre' },
];

const KNOWN_SLUGS = new Set(CATEGORIES.filter((c) => c.value !== 'other').map((c) => c.value));

function getInitialCategory(category: string | null): { category: string; customCategory: string } {
    if (!category) return { category: '', customCategory: '' };
    if (KNOWN_SLUGS.has(category)) return { category, customCategory: '' };
    return { category: 'other', customCategory: category };
}

export function CategoriseModal({ transactions, onClose, onComplete }: CategoriseModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [saving, setSaving] = useState(false);

    const currentTransaction = transactions[currentStep];
    const isLast = currentStep === transactions.length - 1;
    const isSingle = transactions.length === 1;

    const initial = getInitialCategory(currentTransaction?.category ?? null);

    const [name, setName] = useState(currentTransaction?.name || currentTransaction?.description || '');
    const [category, setCategory] = useState(initial.category);
    const [customCategory, setCustomCategory] = useState(initial.customCategory);
    const [date, setDate] = useState(currentTransaction?.date || '');

    const getFinalCategory = () => {
        if (category === 'other' && customCategory.trim()) {
            return customCategory.trim();
        }
        return category;
    };

    const handleNext = async () => {
        if (!category) return;

        setSaving(true);

        try {
            const res = await fetch(`/api/transactions/${currentTransaction.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim() || currentTransaction.description,
                    category: getFinalCategory(),
                    date,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update transaction');
            }

            if (isLast) {
                onComplete();
            } else {
                const next = transactions[currentStep + 1];
                const nextInitial = getInitialCategory(next?.category ?? null);
                setCurrentStep((prev) => prev + 1);
                setName(next?.name || next?.description || '');
                setCategory(nextInitial.category);
                setCustomCategory(nextInitial.customCategory);
                setDate(next?.date || '');
            }
        } catch (err) {
            console.error('Error categorising transaction:', err);
        } finally {
            setSaving(false);
        }
    };

    if (!currentTransaction) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-lg font-semibold mb-1">
                    {isSingle ? 'Modifier la transaction' : 'Catégoriser la transaction'}
                </h2>
                {!isSingle && (
                    <p className="text-sm text-muted-foreground mb-5">
                        {currentStep + 1} / {transactions.length}
                    </p>
                )}
                {isSingle && <div className="mb-5" />}

                {/* Read-only info */}
                <div className="flex items-center justify-between mb-5 p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground truncate mr-4">{currentTransaction.description}</p>
                    <p
                        className={`font-semibold text-sm whitespace-nowrap ${
                            currentTransaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                    >
                        {currentTransaction.amount > 0 ? '+' : ''}
                        {formatCurrency(currentTransaction.amount)}
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Nom</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nom de la transaction"
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 bg-muted text-foreground border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-budget"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Catégorie</label>
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                if (e.target.value !== 'other') {
                                    setCustomCategory('');
                                }
                            }}
                            className="w-full px-3 py-2 bg-muted text-foreground border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-budget"
                        >
                            <option value="" disabled>
                                Sélectionner une catégorie
                            </option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Custom category */}
                    {category === 'other' && (
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Nom de la catégorie</label>
                            <Input
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                placeholder="Ex: Vacances, Cadeaux..."
                            />
                        </div>
                    )}
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={onClose}>
                        Fermer
                    </Button>
                    <Button
                        variant="budget"
                        onClick={handleNext}
                        disabled={!category || saving || (category === 'other' && !customCategory.trim())}
                    >
                        {saving ? 'Sauvegarde...' : isSingle ? 'Enregistrer' : isLast ? 'Terminer' : 'Suivant'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
