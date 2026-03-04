'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/shared/global';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui';
import { BarChart3 } from 'lucide-react';
import { PeriodSelector } from '@/components/budget/PeriodSelector';
import { formatCurrency } from '@/lib/utils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface MonthlyData {
    month: string;
    label: string;
    income: number;
    expenses: number;
}

interface CategoryData {
    category: string;
    label: string;
    total: number;
}

const PIE_COLORS = [
    '#6366f1', // indigo
    '#f43f5e', // rose
    '#22c55e', // green
    '#f59e0b', // amber
    '#3b82f6', // blue
    '#a855f7', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#ef4444', // red
    '#84cc16', // lime
    '#06b6d4', // cyan
    '#f97316', // orange
];

export default function GraphPage() {
    const now = new Date();
    const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
    const [date, setDate] = useState(defaultDate);
    const [monthly, setMonthly] = useState<MonthlyData[]>([]);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/transactions/stats?period=${period}&date=${date}`);
            const result = await res.json();
            if (res.ok) {
                setMonthly(result.monthly || []);
                setCategories(result.categories || []);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    }, [period, date]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handlePeriodChange = (newPeriod: 'month' | 'quarter' | 'year', newDate: string) => {
        setPeriod(newPeriod);
        setDate(newDate);
    };

    const totalIncome = monthly.reduce((acc, m) => acc + m.income, 0);
    const totalExpenses = monthly.reduce((acc, m) => acc + m.expenses, 0);
    const savings = totalIncome - totalExpenses;
    const hasMonthlyData = monthly.some((m) => m.income > 0 || m.expenses > 0);
    const hasCategoryData = categories.length > 0;

    const CustomTooltip = ({
        active,
        payload,
        label,
    }: {
        active?: boolean;
        payload?: Array<{ value: number; name: string; color: string }>;
        label?: string;
    }) => {
        if (!active || !payload) return null;
        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                <p className="text-sm font-medium mb-1">{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    };

    const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryData }> }) => {
        if (!active || !payload || !payload[0]) return null;
        const data = payload[0].payload;
        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                <p className="text-sm font-medium">{data.label}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(data.total)}</p>
            </div>
        );
    };

    return (
        <div>
            <Header title="Graphiques" description="Visualise ton budget sur le temps" variant="budget">
                <PeriodSelector period={period} date={date} onChange={handlePeriodChange} />
            </Header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenus</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-green-400">
                            {loading ? '—' : formatCurrency(totalIncome)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Depenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-red-400">
                            {loading ? '—' : formatCurrency(totalExpenses)}
                        </p>
                    </CardContent>
                </Card>

                <Card variant="budget">
                    <CardHeader>
                        <CardTitle className="text-budget">Epargne</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-3xl font-semibold ${savings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {loading ? '—' : formatCurrency(savings)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Revenus vs Depenses</CardTitle>
                </CardHeader>
                <CardContent>
                    {!loading && hasMonthlyData ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={monthly} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickFormatter={(v) => `${v}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                                />
                                <Bar dataKey="income" name="Revenus" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="Depenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <BarChart3 className="h-10 w-10 mb-3 opacity-50" />
                            <p className="text-lg font-medium">{loading ? 'Chargement...' : 'Aucune donnee'}</p>
                            {!loading && (
                                <p className="text-sm mt-1">Importe tes transactions pour voir les graphiques</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Repartition par categorie</CardTitle>
                </CardHeader>
                <CardContent>
                    {!loading && hasCategoryData ? (
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={categories}
                                        dataKey="total"
                                        nameKey="label"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={130}
                                        innerRadius={60}
                                        paddingAngle={2}
                                    >
                                        {categories.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="w-full lg:w-auto lg:min-w-[200px] space-y-2">
                                {categories.map((cat, i) => (
                                    <div key={cat.category} className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                                            />
                                            <span className="text-sm">{cat.label}</span>
                                        </div>
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {formatCurrency(cat.total)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <BarChart3 className="h-10 w-10 mb-3 opacity-50" />
                            <p className="text-lg font-medium">{loading ? 'Chargement...' : 'Aucune donnee'}</p>
                            {!loading && <p className="text-sm mt-1">Les categories apparaitront ici</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
