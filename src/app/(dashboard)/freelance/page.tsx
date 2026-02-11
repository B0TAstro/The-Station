import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { Briefcase, DollarSign, FolderGit2 } from 'lucide-react';
import Link from 'next/link';
import { PROJECT_STATUS_LABELS } from '@/types';

export default function FreelancePage() {
    // Demo data
    const summary = {
        monthlyIncome: 4200,
        yearlyIncome: 28500,
        activeProjects: 3,
        completedSites: 12,
    };

    const recentProjects = [
        { id: '1', name: 'Site E-commerce', client: 'Client A', status: 'dev' as const },
        { id: '2', name: 'Refonte WordPress', client: 'Client B', status: 'prod' as const },
        { id: '3', name: 'Landing Page', client: 'Client C', status: 'relation' as const },
    ];

    return (
        <div>
            <Header title="Freelance" description="Gère ton activité freelance" variant="freelance">
                <a href="https://www.impots.gouv.fr" target="_blank" rel="noopener noreferrer">
                    <Button variant="freelance">Déclarer aux impôts</Button>
                </a>
            </Header>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card variant="freelance">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-freelance">Revenus</CardTitle>
                            <DollarSign className="h-5 w-5 text-freelance" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">€{summary.monthlyIncome.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-1">Ce mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>CA Annuel</CardTitle>
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">€{summary.yearlyIncome.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-1">2026</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Projets actifs</CardTitle>
                            <Briefcase className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{summary.activeProjects}</p>
                        <p className="text-sm text-muted-foreground mt-1">En cours</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Portfolio</CardTitle>
                            <FolderGit2 className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{summary.completedSites}</p>
                        <p className="text-sm text-muted-foreground mt-1">Sites livrés</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Navigation */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Link href="/freelance/portfolio">
                    <Card hover className="h-full">
                        <CardHeader>
                            <CardTitle>Portfolio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Tous les sites que tu as réalisés</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/freelance/income">
                    <Card hover className="h-full">
                        <CardHeader>
                            <CardTitle>Revenus</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Graphiques et historique des revenus</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/freelance/projects">
                    <Card hover className="h-full">
                        <CardHeader>
                            <CardTitle>Projets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Suivi des projets en cours</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Active Projects Preview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Projets en cours</CardTitle>
                        <Link
                            href="/freelance/projects"
                            className="text-sm text-freelance font-semibold hover:underline"
                        >
                            Voir tout →
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentProjects.map((project) => {
                            const statusInfo = PROJECT_STATUS_LABELS[project.status];
                            return (
                                <div
                                    key={project.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                >
                                    <div>
                                        <p className="font-bold">{project.name}</p>
                                        <p className="text-sm text-muted-foreground">{project.client}</p>
                                    </div>
                                    <Badge variant="outline">
                                        {statusInfo.emoji} {statusInfo.label}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
