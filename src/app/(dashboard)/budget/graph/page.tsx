'use client';

import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
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

// Demo data for charts
const monthlyData = [
    { month: 'Sep', income: 3200, expenses: 2400 },
    { month: 'Oct', income: 3500, expenses: 2100 },
    { month: 'Nov', income: 3800, expenses: 2800 },
    { month: 'Dec', income: 4200, expenses: 3100 },
    { month: 'Jan', income: 3500, expenses: 2300 },
    { month: 'Fév', income: 3700, expenses: 2100 },
];

const categoryData = [
    { name: 'Logement', value: 850, color: '#3b82f6' },
    { name: 'Courses', value: 450, color: '#60a5fa' },
    { name: 'Transport', value: 200, color: '#818cf8' },
    { name: 'Abonnements', value: 150, color: '#a78bfa' },
    { name: 'Restaurant', value: 250, color: '#c084fc' },
    { name: 'Autres', value: 200, color: '#6366f1' },
];

export default function BudgetGraphPage() {
    const totalIncome = monthlyData.reduce((acc, m) => acc + m.income, 0);
    const totalExpenses = monthlyData.reduce((acc, m) => acc + m.expenses, 0);
    const savings = totalIncome - totalExpenses;

    return (
        <div>
            <Header title="Graphiques" description="Visualise ton budget sur le temps" variant="budget" />

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenus (6 mois)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-green-400">+{formatCurrency(totalIncome)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dépenses (6 mois)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-red-400">-{formatCurrency(totalExpenses)}</p>
                    </CardContent>
                </Card>

                <Card variant="budget">
                    <CardHeader>
                        <CardTitle className="text-budget-light">Épargne</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{formatCurrency(savings)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Chart */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Revenus vs Dépenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="month" stroke="#71717a" tick={{ fill: '#a1a1aa' }} />
                                <YAxis tickFormatter={(v) => `€${v}`} stroke="#71717a" tick={{ fill: '#a1a1aa' }} />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value as number)}
                                    contentStyle={{
                                        backgroundColor: '#18181b',
                                        border: '1px solid #27272a',
                                        borderRadius: '8px',
                                        color: '#fafafa',
                                    }}
                                />
                                <Legend wrapperStyle={{ color: '#a1a1aa' }} />
                                <Bar dataKey="income" name="Revenus" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Répartition par catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#09090b" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value as number)}
                                        contentStyle={{
                                            backgroundColor: '#18181b',
                                            border: '1px solid #27272a',
                                            borderRadius: '8px',
                                            color: '#fafafa',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2">
                            {categoryData.map((cat) => (
                                <div key={cat.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className="text-sm">{cat.name}</span>
                                    </div>
                                    <span className="font-medium">{formatCurrency(cat.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
