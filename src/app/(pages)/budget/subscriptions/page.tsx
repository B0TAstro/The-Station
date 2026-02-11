'use client';

import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { Bell, BellOff, Calendar, Plus } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface Subscription {
    id: string;
    name: string;
    amount: number;
    billing_date: number;
    reminder_days: number;
    active: boolean;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [now] = useState(() => Date.now());

    const totalMonthly = subscriptions.filter((s) => s.active).reduce((acc, s) => acc + s.amount, 0);

    const toggleReminder = (id: string) => {
        setSubscriptions((subs) => subs.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
    };

    const getNextBillingDate = (day: number) => {
        const nowDate = new Date();
        const next = new Date(nowDate.getFullYear(), nowDate.getMonth(), day);
        if (next <= nowDate) next.setMonth(next.getMonth() + 1);
        return next;
    };

    return (
        <div>
            <Header title="Abonnements" description="Gère tes abonnements et leurs rappels" variant="budget">
                <Button variant="budget">
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
                        <p className="text-3xl font-semibold">{formatCurrency(totalMonthly)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Actifs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{subscriptions.filter((s) => s.active).length}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Prochain</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold text-muted-foreground">—</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tous les abonnements</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {subscriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Calendar className="h-10 w-10 mb-3 opacity-50" />
                            <p className="text-lg font-medium">Aucun abonnement</p>
                            <p className="text-sm mt-1">Ajoute tes abonnements pour recevoir des rappels</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {subscriptions.map((sub) => {
                                const nextDate = getNextBillingDate(sub.billing_date);
                                const daysUntil = Math.ceil((nextDate.getTime() - now) / (1000 * 60 * 60 * 24));
                                const isUpcoming = daysUntil <= sub.reminder_days;

                                return (
                                    <div
                                        key={sub.id}
                                        className={`flex items-center justify-between p-4 transition-colors ${
                                            !sub.active ? 'opacity-40' : ''
                                        } ${isUpcoming && sub.active ? 'bg-budget-muted' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold">
                                                {sub.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{sub.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Le {sub.billing_date} de chaque mois
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {isUpcoming && sub.active && (
                                                <Badge variant="warning">Dans {daysUntil} jours</Badge>
                                            )}
                                            <p className="font-semibold">{formatCurrency(sub.amount)}</p>
                                            <button
                                                onClick={() => toggleReminder(sub.id)}
                                                className={`p-2 rounded-lg transition-colors hover:bg-muted ${
                                                    sub.active ? 'text-foreground' : 'text-muted-foreground'
                                                }`}
                                                title={sub.active ? 'Désactiver rappel' : 'Activer rappel'}
                                            >
                                                {sub.active ? (
                                                    <Bell className="h-4 w-4" />
                                                ) : (
                                                    <BellOff className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
