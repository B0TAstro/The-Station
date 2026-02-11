import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { Briefcase, DollarSign, FolderGit2 } from 'lucide-react';
import Link from 'next/link';

export default function FreelancePage() {
    return (
        <div>
            <Header title="Freelance" description="Gère ton activité freelance" variant="freelance">
                <a href="https://music.music" target="_blank" rel="noopener noreferrer">
                    <Button variant="freelance">Mon portfolio ↗</Button>
                </a>
            </Header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card variant="freelance">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-freelance">Revenus</CardTitle>
                            <DollarSign className="h-5 w-5 text-freelance" />
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
                            <CardTitle>Annuel</CardTitle>
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">—</p>
                        <p className="text-sm text-muted-foreground mt-1">Total {new Date().getFullYear()}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Projets</CardTitle>
                            <Briefcase className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">0</p>
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
                        <p className="text-3xl font-semibold">0</p>
                        <p className="text-sm text-muted-foreground mt-1">Sites</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
                <Link href="/freelance/portfolio">
                    <Card hover className="h-full">
                        <CardHeader>
                            <CardTitle>Portfolio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Gérer ton portfolio de sites</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/freelance/projects">
                    <Card hover className="h-full">
                        <CardHeader>
                            <CardTitle>Projets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Suivi de tes projets en cours</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/freelance/income">
                    <Card hover className="h-full">
                        <CardHeader>
                            <CardTitle>Revenus</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Analyse de tes revenus freelance</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Projets actifs</CardTitle>
                        <Link href="/freelance/projects">
                            <Badge variant="freelance">Voir tout →</Badge>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Briefcase className="h-10 w-10 mb-3 opacity-50" />
                        <p className="text-lg font-medium">Aucun projet actif</p>
                        <p className="text-sm mt-1">Ajoute ton premier projet depuis le Kanban</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
