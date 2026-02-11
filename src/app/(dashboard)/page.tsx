import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Wallet, Briefcase, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div>
            <Header title="Dashboard" description="Bienvenue sur The Station — ton espace perso" />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Budget Summary */}
                <Card variant="budget">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-budget">Budget</CardTitle>
                            <Wallet className="h-5 w-5 text-budget" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">€ 2,450.00</p>
                        <p className="text-sm text-muted-foreground mt-1">Solde actuel</p>
                    </CardContent>
                </Card>

                {/* Freelance Revenue */}
                <Card variant="freelance">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-freelance">Revenus</CardTitle>
                            <Briefcase className="h-5 w-5 text-freelance" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">€ 4,200.00</p>
                        <p className="text-sm text-muted-foreground mt-1">Ce mois</p>
                    </CardContent>
                </Card>

                {/* Monthly Expenses */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Dépenses</CardTitle>
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">€ 1,890.00</p>
                        <p className="text-sm text-muted-foreground mt-1">Ce mois</p>
                    </CardContent>
                </Card>

                {/* Active Projects */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Projets</CardTitle>
                            <Clock className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">3</p>
                        <p className="text-sm text-muted-foreground mt-1">En cours</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
                <Card hover>
                    <Link href="/budget" className="block">
                        <CardHeader>
                            <CardTitle className="text-budget">→ Gérer mon budget</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Transactions, abonnements, graphiques mensuels</p>
                        </CardContent>
                    </Link>
                </Card>

                <Card hover>
                    <Link href="/freelance" className="block">
                        <CardHeader>
                            <CardTitle className="text-freelance">→ Gérer ma freelance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Portfolio, revenus, suivi de projets</p>
                        </CardContent>
                    </Link>
                </Card>
            </div>
        </div>
    );
}
