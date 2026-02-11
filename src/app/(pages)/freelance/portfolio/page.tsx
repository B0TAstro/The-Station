'use client';

import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, Button, Badge } from '@/components/ui';
import { Github, ExternalLink, Plus, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { SiteType, PortfolioSite } from '@/types';

const typeLabels: Record<SiteType, { label: string; color: string }> = {
    wordpress: { label: 'WordPress', color: 'bg-blue-500/10 text-blue-400' },
    custom: { label: 'Custom', color: 'bg-green-500/10 text-green-400' },
    react: { label: 'React', color: 'bg-cyan-500/10 text-cyan-400' },
    nextjs: { label: 'Next.js', color: 'bg-purple-500/10 text-purple-400' },
    vue: { label: 'Vue', color: 'bg-emerald-500/10 text-emerald-400' },
    other: { label: 'Autre', color: 'bg-orange-500/10 text-orange-400' },
};

export default function PortfolioPage() {
    const portfolio: PortfolioSite[] = [];

    return (
        <div>
            <Header title="Portfolio" description="Ton portfolio de sites clients" variant="freelance">
                <Button variant="freelance">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un site
                </Button>
            </Header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
                {Object.entries(typeLabels).map(([key, value]) => {
                    const count = portfolio.filter((p) => p.type === key).length;
                    return (
                        <Card key={key}>
                            <CardContent className="pt-6">
                                <p className="text-2xl font-semibold">{count}</p>
                                <p className="text-sm text-muted-foreground">{value.label}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {portfolio.length === 0 ? (
                <Card>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <ExternalLink className="h-10 w-10 mb-3 opacity-50" />
                            <p className="text-lg font-medium">Aucun site dans le portfolio</p>
                            <p className="text-sm mt-1">Ajoute tes réalisations ici</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {portfolio.map((site) => {
                        const typeInfo = typeLabels[site.type];
                        return (
                            <Card key={site.id} hover>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-lg">{site.name}</p>
                                            <p className="text-sm text-muted-foreground">{site.client}</p>
                                        </div>
                                        <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(site.delivery_date)}
                                        </div>
                                        <div className="flex gap-2">
                                            {site.github_url && (
                                                <a href={site.github_url} target="_blank" rel="noopener noreferrer">
                                                    <Github className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                </a>
                                            )}
                                            {site.live_url && (
                                                <a href={site.live_url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
