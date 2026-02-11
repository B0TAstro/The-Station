// Freelance Types
export type ProjectStatus =
    | 'relation'    // Mise en relation
    | 'dev'         // En développement
    | 'prod'        // En production
    | 'relance'     // Relance
    | 'done'        // Terminé
    | 'feedback';   // Retours

export type SiteType =
    | 'wordpress'
    | 'custom'
    | 'react'
    | 'nextjs'
    | 'vue'
    | 'other';

export interface PortfolioSite {
    id: string;
    name: string;
    type: SiteType;
    github_url?: string;
    live_url?: string;
    delivery_date: string;
    client?: string;
    user_id: string;
}

export interface Project {
    id: string;
    name: string;
    client: string;
    status: ProjectStatus;
    amount: number;
    created_at: string;
    user_id: string;
}

export interface IncomeEntry {
    id: string;
    project_id?: string;
    amount: number;
    date: string;
    description: string;
    user_id: string;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, { label: string; emoji: string; color: string }> = {
    relation: { label: 'Mise en relation', emoji: '🔵', color: 'blue' },
    dev: { label: 'En développement', emoji: '🟡', color: 'yellow' },
    prod: { label: 'En production', emoji: '🟢', color: 'green' },
    relance: { label: 'Relance', emoji: '🟠', color: 'orange' },
    done: { label: 'Terminé', emoji: '✅', color: 'emerald' },
    feedback: { label: 'Retours', emoji: '🔄', color: 'purple' },
};
