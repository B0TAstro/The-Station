'use client';

import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { BarChart3 } from 'lucide-react';

export default function GraphPage() {
    return (
        <div>
            <Header title="Graphiques" description="Visualise ton budget sur le temps" variant="budget" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenus</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-green-400">—</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dépenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-red-400">—</p>
                    </CardContent>
                </Card>

                <Card variant="budget">
                    <CardHeader>
                        <CardTitle className="text-budget">Épargne</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">—</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Revenus vs Dépenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <BarChart3 className="h-10 w-10 mb-3 opacity-50" />
                        <p className="text-lg font-medium">Aucune donnée</p>
                        <p className="text-sm mt-1">Connecte ta banque pour voir tes graphiques</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Répartition par catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <BarChart3 className="h-10 w-10 mb-3 opacity-50" />
                        <p className="text-lg font-medium">Aucune donnée</p>
                        <p className="text-sm mt-1">Les catégories apparaîtront ici</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
