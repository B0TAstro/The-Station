import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Wallet, Briefcase, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
    return (
        <div>
            <Header title="Dashboard" description="Bienvenue sur The Station — ton espace perso" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card variant="budget">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-budget">Budget</CardTitle>
                            <Wallet className="h-5 w-5 text-budget" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">—</p>
                        <p className="text-sm text-muted-foreground mt-1">Connecte ta banque</p>
                    </CardContent>
                </Card>

                <Card variant="freelance">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-freelance">Revenus</CardTitle>
                            <Briefcase className="h-5 w-5 text-freelance" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">—</p>
                        <p className="text-sm text-muted-foreground mt-1">Aucun revenu</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Dépenses</CardTitle>
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">—</p>
                        <p className="text-sm text-muted-foreground mt-1">Ce mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Projets</CardTitle>
                            <Clock className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">0</p>
                        <p className="text-sm text-muted-foreground mt-1">En cours</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
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
