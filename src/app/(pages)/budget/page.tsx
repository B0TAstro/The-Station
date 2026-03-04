'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/shared/global';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui';
import { TrendingUp, TrendingDown, PiggyBank, CreditCard } from 'lucide-react';
import { PeriodSelector } from '@/components/budget/PeriodSelector';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface SummaryData {
    income: number;
    expenses: number;
    balance: number;
    subscriptionTotal: number;
}

export default function BudgetPage() {
    const now = new Date();
    const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
    const [date, setDate] = useState(defaultDate);
    const [data, setData] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/transactions/summary?period=${period}&date=${date}`);
            const result = await res.json();
            if (res.ok) {
                setData(result);
            }
        } catch (err) {
            console.error('Error fetching summary:', err);
        } finally {
            setLoading(false);
        }
    }, [period, date]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const handlePeriodChange = (newPeriod: 'month' | 'quarter' | 'year', newDate: string) => {
        setPeriod(newPeriod);
        setDate(newDate);
    };

    const displayValue = (value: number | undefined, color?: string) => {
        if (loading || value === undefined) return '—';
        return <span className={color || ''}>{formatCurrency(value)}</span>;
    };

    return (
        <div>
            <Header title="Budget" description="Gere ton budget personnel" variant="budget">
                <PeriodSelector period={period} date={date} onChange={handlePeriodChange} />
            </Header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Revenus</CardTitle>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-green-600">{displayValue(data?.income)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Depenses</CardTitle>
                            <TrendingDown className="h-5 w-5 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-red-600">{displayValue(data?.expenses)}</p>
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
                        <p
                            className={`text-3xl font-semibold ${data && data.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                            {displayValue(data?.balance)}
                        </p>
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
                        <p className="text-3xl font-semibold">{displayValue(data?.subscriptionTotal)}</p>
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
                            <p className="text-muted-foreground">Gerer tes abonnements et rappels</p>
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
