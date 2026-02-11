'use client';

import { Header } from '@/components/layout';
import { Card, CardContent, Button } from '@/components/ui';
import { Plus, GripVertical, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { PROJECT_STATUS_LABELS, type Project, type ProjectStatus } from '@/types';

const statusOrder: ProjectStatus[] = ['relation', 'dev', 'prod', 'relance', 'done', 'feedback'];

export default function ProjectsPage() {
    const [projects] = useState<Project[]>([]);

    const projectsByStatus = statusOrder.reduce(
        (acc, status) => {
            acc[status] = projects.filter((p) => p.status === status);
            return acc;
        },
        {} as Record<ProjectStatus, Project[]>,
    );

    const totalPipeline = projects
        .filter((p) => !['done', 'feedback'].includes(p.status))
        .reduce((acc, p) => acc + p.amount, 0);

    return (
        <div>
            <Header title="Projets" description="Suivi de tes projets freelance" variant="freelance">
                <Button variant="freelance">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau projet
                </Button>
            </Header>

            <Card variant="freelance" className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Valeur du pipeline</p>
                            <p className="text-3xl font-semibold">{formatCurrency(totalPipeline)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Projets en cours</p>
                            <p className="text-3xl font-semibold">{projects.length}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {projects.length === 0 ? (
                <Card>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Briefcase className="h-10 w-10 mb-3 opacity-50" />
                            <p className="text-lg font-medium">Aucun projet</p>
                            <p className="text-sm mt-1">Crée ton premier projet pour commencer le suivi</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {statusOrder.map((status) => {
                        const statusInfo = PROJECT_STATUS_LABELS[status];
                        const statusProjects = projectsByStatus[status];

                        return (
                            <div key={status}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: statusInfo.color }}
                                    />
                                    <p className="text-sm font-medium">{statusInfo.label}</p>
                                    <span className="text-xs text-muted-foreground">({statusProjects.length})</span>
                                </div>

                                <div className="space-y-2">
                                    {statusProjects.map((project) => (
                                        <Card key={project.id} hover className="cursor-grab active:cursor-grabbing">
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-2">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm truncate">{project.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {project.client}
                                                        </p>
                                                        <p className="text-xs font-semibold text-freelance mt-1">
                                                            {formatCurrency(project.amount)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
