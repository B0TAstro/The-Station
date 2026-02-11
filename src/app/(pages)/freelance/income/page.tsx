'use client';

import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ExternalLink, BarChart3 } from 'lucide-react';

export default function IncomePage() {
    return (
        <div>
            <Header title="Revenus" description="Analyse de tes revenus freelance" variant="freelance">
                <a href="https://music.music" target="_blank" rel="noopener noreferrer">
                    <span className="inline-flex items-center gap-2 text-sm text-freelance hover:underline">
                        Malt <ExternalLink className="h-4 w-4" />
                    </span>
                </a>
            </Header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
                <Card variant="freelance">
                    <CardHeader>
                        <CardTitle className="text-freelance">Ce mois</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">—</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total annuel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">—</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Moyenne mensuelle</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">—</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Revenus mensuels</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <BarChart3 className="h-10 w-10 mb-3 opacity-50" />
                        <p className="text-lg font-medium">Aucune donnée</p>
                        <p className="text-sm mt-1">Les revenus apparaîtront ici</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Comparaison annuelle</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <BarChart3 className="h-10 w-10 mb-3 opacity-50" />
                        <p className="text-lg font-medium">Aucune donnée</p>
                        <p className="text-sm mt-1">Compare tes revenus par année</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
