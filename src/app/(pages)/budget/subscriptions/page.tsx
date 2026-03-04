'use client';

import { Header } from '@/components/shared/global';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/shared/ui';
import { Bell, BellOff, Calendar, Plus, Trash2, Sparkles } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';
import { AddSubscriptionModal } from '@/components/budget/AddSubscriptionModal';

interface Subscription {
    id: string;
    name: string;
    amount: number;
    category: string | null;
    category_label: string | null;
    billing_day: number;
    active: boolean;
    is_detected: boolean;
}

interface DetectedSubscription {
    id: string;
    name: string;
    amount: number;
    category: string | null;
    category_label: string | null;
    billing_day: number;
    months: number;
    is_detected: true;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [detected, setDetected] = useState<DetectedSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [confirmInitialData, setConfirmInitialData] = useState<{
        name: string;
        amount: number;
        category: string | null;
        billing_day: number;
    } | null>(null);

    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/subscriptions');
            const data = await res.json();
            if (res.ok) {
                setSubscriptions(data.subscriptions || []);
                setDetected(data.detected || []);
            }
        } catch (err) {
            console.error('Error fetching subscriptions:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const toggleActive = async (id: string, currentActive: boolean) => {
        try {
            const res = await fetch(`/api/subscriptions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !currentActive }),
            });
            if (res.ok) {
                setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, active: !currentActive } : s)));
            }
        } catch (err) {
            console.error('Error toggling subscription:', err);
        }
    };

    const deleteSubscription = async (id: string) => {
        try {
            const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSubscriptions((prev) => prev.filter((s) => s.id !== id));
            }
        } catch (err) {
            console.error('Error deleting subscription:', err);
        }
    };

    const confirmDetected = (det: DetectedSubscription) => {
        setConfirmInitialData({
            name: det.name,
            amount: det.amount,
            category: det.category,
            billing_day: det.billing_day,
        });
        setShowAddModal(true);
    };

    const handleAddComplete = () => {
        setShowAddModal(false);
        setConfirmInitialData(null);
        fetchSubscriptions();
    };

    const handleAddClose = () => {
        setShowAddModal(false);
        setConfirmInitialData(null);
    };

    const getNextBillingDate = (day: number) => {
        const now = new Date();
        const next = new Date(now.getFullYear(), now.getMonth(), day);
        if (next <= now) next.setMonth(next.getMonth() + 1);
        return next;
    };

    const activeSubscriptions = subscriptions.filter((s) => s.active);
    const totalMonthly = activeSubscriptions.reduce((acc, s) => acc + s.amount, 0);

    // Find next upcoming
    const nextUpcoming =
        activeSubscriptions.length > 0
            ? activeSubscriptions.reduce((closest, sub) => {
                  const nextDate = getNextBillingDate(sub.billing_day);
                  const closestDate = getNextBillingDate(closest.billing_day);
                  return nextDate < closestDate ? sub : closest;
              })
            : null;

    const nextUpcomingDate = nextUpcoming ? getNextBillingDate(nextUpcoming.billing_day) : null;
    const daysUntilNext = nextUpcomingDate
        ? Math.ceil((nextUpcomingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div>
            <Header title="Abonnements" description="Gere tes abonnements et leurs rappels" variant="budget">
                <Button variant="budget" onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                </Button>
            </Header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
                <Card variant="budget">
                    <CardHeader>
                        <CardTitle className="text-budget">Total mensuel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{loading ? '—' : formatCurrency(totalMonthly)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Actifs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{loading ? '—' : activeSubscriptions.length}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Prochain</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {nextUpcoming && daysUntilNext !== null ? (
                            <div>
                                <p className="text-lg font-semibold">{nextUpcoming.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Dans {daysUntilNext} jour{daysUntilNext > 1 ? 's' : ''} -{' '}
                                    {formatCurrency(nextUpcoming.amount)}
                                </p>
                            </div>
                        ) : (
                            <p className="text-lg font-semibold text-muted-foreground">{loading ? '—' : 'Aucun'}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Manual subscriptions */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Mes abonnements</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-muted-foreground">
                            <p>Chargement...</p>
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Calendar className="h-10 w-10 mb-3 opacity-50" />
                            <p className="text-lg font-medium">Aucun abonnement</p>
                            <p className="text-sm mt-1">Ajoute tes abonnements pour les suivre</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {subscriptions.map((sub) => {
                                const nextDate = getNextBillingDate(sub.billing_day);
                                const daysUntil = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                const isUpcoming = daysUntil <= 3;

                                return (
                                    <div
                                        key={sub.id}
                                        className={`group flex items-center justify-between p-4 transition-colors ${
                                            !sub.active ? 'opacity-40' : ''
                                        } ${isUpcoming && sub.active ? 'bg-budget/5' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold">
                                                {sub.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{sub.name}</p>
                                                    {sub.category_label && (
                                                        <Badge variant="outline">{sub.category_label}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Le {sub.billing_day} de chaque mois
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {isUpcoming && sub.active && (
                                                <Badge variant="warning">Dans {daysUntil}j</Badge>
                                            )}
                                            <p className="font-semibold">{formatCurrency(sub.amount)}</p>
                                            <button
                                                onClick={() => toggleActive(sub.id, sub.active)}
                                                className={`p-2 rounded-lg transition-colors hover:bg-muted ${
                                                    sub.active ? 'text-foreground' : 'text-muted-foreground'
                                                }`}
                                                title={sub.active ? 'Desactiver' : 'Activer'}
                                            >
                                                {sub.active ? (
                                                    <Bell className="h-4 w-4" />
                                                ) : (
                                                    <BellOff className="h-4 w-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => deleteSubscription(sub.id)}
                                                className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Auto-detected recurring */}
            {!loading && detected.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-budget" />
                            <CardTitle>Abonnements detectes</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Transactions recurrentes detectees automatiquement
                        </p>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {detected.map((det) => (
                                <div
                                    key={det.id}
                                    className="flex items-center justify-between p-4 hover:bg-card-hover transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-budget/10 flex items-center justify-center text-sm font-semibold text-budget">
                                            {det.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{det.name}</p>
                                                <Badge variant="outline">Suggere</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Detecte sur {det.months} mois - Le {det.billing_day} du mois
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {det.category_label && <Badge variant="outline">{det.category_label}</Badge>}
                                        <p className="font-semibold">{formatCurrency(det.amount)}</p>
                                        <Button variant="budget" size="sm" onClick={() => confirmDetected(det)}>
                                            Confirmer
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {showAddModal && (
                <AddSubscriptionModal
                    onClose={handleAddClose}
                    onAdd={handleAddComplete}
                    initialData={confirmInitialData || undefined}
                />
            )}
        </div>
    );
}
