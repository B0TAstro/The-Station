'use client';

import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Demo income data
const monthlyIncome = [
    { month: 'Sep', amount: 2800 },
    { month: 'Oct', amount: 3200 },
    { month: 'Nov', amount: 4500 },
    { month: 'Dec', amount: 5200 },
    { month: 'Jan', amount: 3800 },
    { month: 'Fév', amount: 4200 },
];

const yearlyComparison = [
    { year: '2024', amount: 28500 },
    { year: '2025', amount: 42000 },
    { year: '2026', amount: 8200 },
];

export default function IncomePage() {
    const totalYear = monthlyIncome.reduce((acc, m) => acc + m.amount, 0);
    const avgMonthly = totalYear / monthlyIncome.length;

    return (
        <div>
            <Header title="Revenus" description="Historique et graphiques de tes revenus freelance" variant="freelance">
                <a
                    href="https://www.impots.gouv.fr/portail/particulier/declarer-mes-revenus"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button variant="freelance">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Déclarer aux impôts
                    </Button>
                </a>
            </Header>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card variant="freelance">
                    <CardHeader>
                        <CardTitle className="text-freelance-light">Total 2026</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{formatCurrency(totalYear)}</p>
                        <p className="text-sm text-muted-foreground mt-1">Depuis janvier</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Moyenne mensuelle</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{formatCurrency(avgMonthly)}</p>
                        <p className="text-sm text-muted-foreground mt-1">Sur {monthlyIncome.length} mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Meilleur mois</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const best = monthlyIncome.reduce((a, b) => (a.amount > b.amount ? a : b));
                            return (
                                <>
                                    <p className="text-3xl font-semibold">{formatCurrency(best.amount)}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{best.month} 2026</p>
                                </>
                            );
                        })()}
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Chart */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Revenus mensuels</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyIncome} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    name="Revenus"
                                    stroke="#ef4444"
                                    fill="rgba(239, 68, 68, 0.1)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Yearly Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle>Comparaison annuelle</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yearlyComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="year" stroke="#71717a" tick={{ fill: '#a1a1aa' }} />
                                <YAxis
                                    tickFormatter={(v) => `€${v / 1000}k`}
                                    stroke="#71717a"
                                    tick={{ fill: '#a1a1aa' }}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value as number)}
                                    contentStyle={{
                                        backgroundColor: '#18181b',
                                        border: '1px solid #27272a',
                                        borderRadius: '8px',
                                        color: '#fafafa',
                                    }}
                                />
                                <Bar dataKey="amount" name="CA annuel" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
