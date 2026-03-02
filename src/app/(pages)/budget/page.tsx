'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/shared/global';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui';
import { TrendingUp, TrendingDown, PiggyBank, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface BudgetData {
    income: number;
    expenses: number;
    balance: number;
    subscriptions: number;
    connected: boolean;
}

export default function BudgetPage() {
    const [data, setData] = useState<BudgetData>({
        income: 0,
        expenses: 0,
        balance: 0,
        subscriptions: 0,
        connected: false,
    });

    useEffect(() => {
        async function checkConnection() {
            try {
                const res = await fetch('/api/transactions/true-layer/connected');
                const result = await res.json();
                setData((prev) => ({ ...prev, connected: result.connected }));
            } catch (error) {
                console.error('Error checking connection:', error);
            }
        }
        checkConnection();
    }, []);

    return (
        <div>
            <Header title="Budget" description="Gère ton budget personnel" variant="budget" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Revenus</CardTitle>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-green-600">{data.connected ? '—' : '—'}</p>
                        <p className="text-sm text-muted-foreground mt-1">Ce mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Dépenses</CardTitle>
                            <TrendingDown className="h-5 w-5 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-red-600">{data.connected ? '—' : '—'}</p>
                        <p className="text-sm text-muted-foreground mt-1">Ce mois</p>
                    </CardContent>
                </Card>

                <Card variant="budget">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-budget">Solde</CardTitle>
                            <PiggyBank className="h-5 w-5 text-budget" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{data.connected ? '—' : '—'}</p>
                        <p className="text-sm text-muted-foreground mt-1">Disponible</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Abonnements</CardTitle>
                            <CreditCard className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{data.subscriptions || '—'}</p>
                        <p className="text-sm text-muted-foreground mt-1">/ mois</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Link href="/budget/transactions">
                    <Card hover className="h-full">
                        <CardHeader>
                            <CardTitle>Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Voir et classifier toutes tes transactions</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/budget/subscriptions">
                    <Card hover className="h-full">
                        <CardHeader>
                            <CardTitle>Abonnements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Gérer tes abonnements et rappels</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/budget/graph">
                    <Card hover className="h-full">
                        <CardHeader>
                            <CardTitle>Graphiques</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Visualiser ton budget sur le temps</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
