'use client';

import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { Bell, BellOff, Calendar, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

// Demo subscriptions
const demoSubscriptions = [
    { id: '1', name: 'Spotify', amount: 9.99, billing_date: 8, reminder_days: 3, active: true },
    { id: '2', name: 'Netflix', amount: 15.99, billing_date: 15, reminder_days: 5, active: true },
    { id: '3', name: 'Amazon Prime', amount: 6.99, billing_date: 1, reminder_days: 3, active: true },
    { id: '4', name: 'Adobe CC', amount: 59.99, billing_date: 20, reminder_days: 7, active: true },
    { id: '5', name: 'GitHub Pro', amount: 4.00, billing_date: 10, reminder_days: 3, active: true },
    { id: '6', name: 'Gym', amount: 29.90, billing_date: 5, reminder_days: 7, active: false },
];

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState(demoSubscriptions);

    const totalMonthly = subscriptions
        .filter((s) => s.active)
        .reduce((acc, s) => acc + s.amount, 0);

    const toggleReminder = (id: string) => {
        setSubscriptions((subs) =>
            subs.map((s) =>
                s.id === id ? { ...s, active: !s.active } : s
            )
        );
    };

    const getNextBillingDate = (day: number) => {
        const today = new Date();
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), day);
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, day);
        return today <= thisMonth ? thisMonth : nextMonth;
    };

    const getDaysUntil = (day: number) => {
        const next = getNextBillingDate(day);
        const today = new Date();
        const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <div>
            <Header title="Abonnements" description="Gère tes abonnements et rappels" variant="budget">
                <Button variant="budget">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                </Button>
            </Header>

            {/* Summary */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card variant="budget">
                    <CardHeader>
                        <CardTitle className="text-budget-light">Total mensuel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{formatCurrency(totalMonthly)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {subscriptions.filter((s) => s.active).length} abonnements actifs
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Prochain paiement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {subscriptions
                            .filter((s) => s.active)
                            .sort((a, b) => getDaysUntil(a.billing_date) - getDaysUntil(b.billing_date))
                            .slice(0, 1)
                            .map((s) => (
                                <div key={s.id}>
                                    <p className="text-xl font-semibold">{s.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Dans {getDaysUntil(s.billing_date)} jours • {formatCurrency(s.amount)}
                                    </p>
                                </div>
                            ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Annuel estimé</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{formatCurrency(totalMonthly * 12)}</p>
                        <p className="text-sm text-muted-foreground mt-1">Par an</p>
                    </CardContent>
                </Card>
            </div>

            {/* Subscriptions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Tous les abonnements</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {subscriptions.map((sub) => {
                            const daysUntil = getDaysUntil(sub.billing_date);
                            const isUpcoming = daysUntil <= sub.reminder_days;

                            return (
                                <div
                                    key={sub.id}
                                    className={`flex items-center justify-between p-4 transition-colors ${!sub.active ? 'opacity-40' : ''
                                        } ${isUpcoming && sub.active ? 'bg-budget-muted' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold">
                                            {sub.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{sub.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                <Calendar className="inline h-3 w-3 mr-1" />
                                                Le {sub.billing_date} de chaque mois
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {isUpcoming && sub.active && (
                                            <Badge variant="warning">
                                                Dans {daysUntil} jours
                                            </Badge>
                                        )}
                                        <p className="font-semibold">{formatCurrency(sub.amount)}</p>
                                        <button
                                            onClick={() => toggleReminder(sub.id)}
                                            className={`p-2 rounded-lg transition-colors hover:bg-muted ${sub.active ? 'text-foreground' : 'text-muted-foreground'
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
                </CardContent>
            </Card>
        </div>
    );
}
