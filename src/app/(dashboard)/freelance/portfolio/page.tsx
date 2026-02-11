'use client';

import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, Button, Badge } from '@/components/ui';
import { Github, ExternalLink, Plus, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { SiteType, PortfolioSite } from '@/types';

// Demo portfolio
const demoPortfolio: PortfolioSite[] = [
    {
        id: '1',
        name: 'E-commerce Mode',
        type: 'nextjs',
        github_url: 'https://github.com/user/project1',
        live_url: 'https://example-ecommerce.com',
        delivery_date: '2026-01-15',
        client: 'Fashion Brand',
        user_id: '1',
    },
    {
        id: '2',
        name: 'Blog Photographe',
        type: 'wordpress',
        github_url: undefined,
        live_url: 'https://photo-blog.com',
        delivery_date: '2025-12-20',
        client: 'Studio Photo',
        user_id: '1',
    },
    {
        id: '3',
        name: 'Dashboard SaaS',
        type: 'react',
        github_url: 'https://github.com/user/project3',
        live_url: 'https://saas-app.com',
        delivery_date: '2025-11-10',
        client: 'Tech Startup',
        user_id: '1',
    },
    {
        id: '4',
        name: 'Site Vitrine Restaurant',
        type: 'custom',
        github_url: 'https://github.com/user/project4',
        live_url: 'https://restaurant-vitrine.com',
        delivery_date: '2025-10-05',
        client: 'Le Bistrot',
        user_id: '1',
    },
];

const typeLabels: Record<SiteType, { label: string; color: string }> = {
    wordpress: { label: 'WordPress', color: 'bg-blue-500/15 text-blue-400' },
    custom: { label: 'Custom', color: 'bg-purple-500/15 text-purple-400' },
    react: { label: 'React', color: 'bg-cyan-500/15 text-cyan-400' },
    nextjs: { label: 'Next.js', color: 'bg-white/10 text-white' },
    vue: { label: 'Vue.js', color: 'bg-green-500/15 text-green-400' },
    other: { label: 'Autre', color: 'bg-zinc-500/15 text-zinc-400' },
};

export default function PortfolioPage() {
    return (
        <div>
            <Header title="Portfolio" description="Tous les sites que tu as réalisés" variant="freelance">
                <Button variant="freelance">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un site
                </Button>
            </Header>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
                {Object.entries(typeLabels).map(([key, value]) => {
                    const count = demoPortfolio.filter((p) => p.type === key).length;
                    if (count === 0) return null;
                    return (
                        <Card key={key}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{value.label}</span>
                                    <span className="text-2xl font-semibold">{count}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Portfolio Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {demoPortfolio.map((site) => {
                    const typeInfo = typeLabels[site.type];

                    return (
                        <Card key={site.id} hover>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium text-foreground">{site.name}</h3>
                                        <p className="text-sm text-muted-foreground">{site.client}</p>
                                    </div>
                                    <Badge className={`${typeInfo.color} border-transparent`}>{typeInfo.label}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(site.delivery_date)}
                                </div>

                                <div className="flex gap-2">
                                    {site.github_url && (
                                        <a
                                            href={site.github_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Github className="h-4 w-4" />
                                            GitHub
                                        </a>
                                    )}
                                    {site.live_url && (
                                        <a
                                            href={site.live_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-freelance/10 text-freelance-light hover:bg-freelance/20 transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Voir le site
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
