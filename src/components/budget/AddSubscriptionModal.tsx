'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/shared/ui';
import { X } from 'lucide-react';

interface AddSubscriptionModalProps {
    onClose: () => void;
    onAdd: () => void;
    initialData?: {
        name: string;
        amount: number;
        category: string | null;
        billing_day: number;
    };
}

const CATEGORIES = [
    { value: 'subscription', label: 'Abonnement' },
    { value: 'rent', label: 'Loyer' },
    { value: 'transport', label: 'Transport' },
    { value: 'healthcare', label: 'Sante' },
    { value: 'professional', label: 'Pro' },
    { value: 'activities', label: 'Loisir' },
    { value: 'extra', label: 'Extra' },
];

export function AddSubscriptionModal({ onClose, onAdd, initialData }: AddSubscriptionModalProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
    const [category, setCategory] = useState(initialData?.category || 'subscription');
    const [billingDay, setBillingDay] = useState(initialData?.billing_day?.toString() || '1');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name.trim() || !amount || !billingDay) {
            setError('Tous les champs sont obligatoires');
            return;
        }

        const parsedAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Montant invalide');
            return;
        }

        const parsedDay = parseInt(billingDay);
        if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
            setError('Jour de prelevement invalide (1-31)');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const res = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    amount: parsedAmount,
                    category,
                    billing_day: parsedDay,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur lors de la creation');
            }

            onAdd();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setSaving(false);
        }
    };

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

                <h2 className="text-lg font-semibold mb-5">Ajouter un abonnement</h2>

                <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Nom</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Netflix, Spotify..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Montant mensuel</label>
                        <Input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ex: 13.99"
                            type="text"
                            inputMode="decimal"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Categorie</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-muted text-foreground border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-budget"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Jour de prelevement</label>
                        <Input
                            value={billingDay}
                            onChange={(e) => setBillingDay(e.target.value)}
                            placeholder="Ex: 15"
                            type="number"
                            min="1"
                            max="31"
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

                <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button variant="budget" onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Ajout...' : 'Ajouter'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
