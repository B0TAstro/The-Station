'use client';

import { Header } from '@/components/layout';
import { Card, CardContent, Button } from '@/components/ui';
import { Plus, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PROJECT_STATUS_LABELS, type Project, type ProjectStatus } from '@/types';

// Demo projects
const demoProjects: Project[] = [
    {
        id: '1',
        name: 'Application Mobile Fitness',
        client: 'GymTech',
        status: 'relation',
        amount: 5000,
        created_at: '2026-02-05',
        user_id: '1',
    },
    {
        id: '2',
        name: 'Site E-commerce Bijoux',
        client: 'Precious Stones',
        status: 'dev',
        amount: 3500,
        created_at: '2026-01-20',
        user_id: '1',
    },
    {
        id: '3',
        name: 'Dashboard Analytics',
        client: 'DataCorp',
        status: 'dev',
        amount: 4200,
        created_at: '2026-01-10',
        user_id: '1',
    },
    {
        id: '4',
        name: 'Refonte Blog',
        client: 'InnoPress',
        status: 'prod',
        amount: 1800,
        created_at: '2025-12-15',
        user_id: '1',
    },
    {
        id: '5',
        name: 'Landing Page Produit',
        client: 'StartupXYZ',
        status: 'relance',
        amount: 800,
        created_at: '2025-11-20',
        user_id: '1',
    },
    {
        id: '6',
        name: 'Site Vitrine Avocat',
        client: 'Cabinet Legal',
        status: 'done',
        amount: 2200,
        created_at: '2025-10-05',
        user_id: '1',
    },
    {
        id: '7',
        name: 'Portfolio Artiste',
        client: 'Creative Mind',
        status: 'feedback',
        amount: 1500,
        created_at: '2025-09-15',
        user_id: '1',
    },
];

const statusOrder: ProjectStatus[] = ['relation', 'dev', 'prod', 'relance', 'feedback', 'done'];

export default function ProjectsPage() {
    const [projects, setProjects] = useState(demoProjects);

    const _updateStatus = (id: string, newStatus: ProjectStatus) => {
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
    };

    const projectsByStatus = statusOrder.reduce(
        (acc, status) => {
            acc[status] = projects.filter((p) => p.status === status);
            return acc;
        },
        {} as Record<ProjectStatus, Project[]>,
    );

    const totalPipeline = projects.filter((p) => p.status !== 'done').reduce((acc, p) => acc + p.amount, 0);

    return (
        <div>
            <Header title="Projets" description="Suivi de tes projets freelance" variant="freelance">
                <Button variant="freelance">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau projet
                </Button>
            </Header>

            {/* Pipeline Value */}
            <Card variant="freelance" className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-freelance-light">Pipeline total</p>
                            <p className="text-3xl font-semibold mt-1">{formatCurrency(totalPipeline)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                                {projects.filter((p) => p.status !== 'done').length} projets en cours
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Kanban Board */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {statusOrder.map((status) => {
                    const statusInfo = PROJECT_STATUS_LABELS[status];
                    const statusProjects = projectsByStatus[status];

                    return (
                        <div key={status} className="min-h-96">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                                <span className="text-lg">{statusInfo.emoji}</span>
                                <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
                                    {statusInfo.label}
                                </h3>
                                <span className="ml-auto text-xs font-medium bg-muted rounded-full px-2 py-0.5">
                                    {statusProjects.length}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {statusProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="p-3 bg-card rounded-lg border border-border hover:border-muted-foreground/30 transition-colors cursor-grab"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                                        </div>
                                        <p className="font-medium text-sm leading-tight">{project.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{project.client}</p>
                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(project.created_at)}
                                            </span>
                                            <span className="font-semibold text-sm text-freelance-light">
                                                {formatCurrency(project.amount)}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {statusProjects.length === 0 && (
                                    <div className="p-4 border border-dashed border-border rounded-lg text-center text-sm text-muted-foreground">
                                        Aucun projet
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
