import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { TrendingUp, TrendingDown, CreditCard, PiggyBank } from 'lucide-react';
import Link from 'next/link';

export default function BudgetPage() {
    // Demo data - will be replaced with Plaid data
    const summary = {
        income: 3500,
        expenses: 2100,
        balance: 2450,
        subscriptions: 340,
    };

    return (
        <div className="theme-budget">
            <Header title="Budget" description="Gère ton budget personnel" variant="budget">
                <Button variant="budget">Connecter ma banque</Button>
            </Header>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Revenus</CardTitle>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-green-600">+€{summary.income.toLocaleString()}</p>
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
                        <p className="text-3xl font-semibold text-red-600">-€{summary.expenses.toLocaleString()}</p>
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
                        <p className="text-3xl font-semibold">€{summary.balance.toLocaleString()}</p>
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
                        <p className="text-3xl font-semibold">€{summary.subscriptions}</p>
                        <p className="text-sm text-muted-foreground mt-1">/ mois</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Navigation */}
            <div className="grid gap-6 md:grid-cols-3">
                <Link href="/budget/transactions">
                    <Card hover className="h-full">
                        <CardHeader>
                            <CardTitle>Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Voir et classifier toutes tes transactions
                            </p>
                            <Badge variant="budget" className="mt-4">12 nouvelles</Badge>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/budget/subscriptions">
                    <Card hover className="h-full">
                        <CardHeader>
                            <CardTitle>Abonnements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Gérer tes abonnements et rappels
                            </p>
                            <Badge variant="warning" className="mt-4">1 à renouveler</Badge>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/budget/graph">
                    <Card hover className="h-full">
                        <CardHeader>
                            <CardTitle>Graphiques</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Visualiser ton budget sur le temps
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
