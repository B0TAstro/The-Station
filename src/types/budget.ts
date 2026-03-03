export interface Transaction {
    id: string;
    source_id: string;
    source_type: string;
    truelayer_account_id: string | null;
    truelayer_token_id: string | null;
    account_id: string | null;
    amount: number;
    date: string;
    description: string;
    name: string | null;
    category: string | null;
    is_categorised: boolean | null;
    user_id: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
    income: 'Salaire / Aide',
    savings: 'Épargne',
    rent: 'Loyer',
    food: 'Courses',
    transport: 'Transport',
    subscription: 'Abonnement',
    activities: 'Loisir',
    professional: 'Pro',
    healthcare: 'Santé',
    extra: 'Extra',
};

/**
 * Returns the French display label for a category.
 * If the category is a known DB slug, returns the mapped label.
 * Otherwise returns the raw value (for custom "Autre" categories).
 */
export function getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category] || category;
}

/**
 * Returns the DB slug for a given French display label.
 * Returns null if no match (i.e. it's a custom category).
 */
export function getCategorySlug(label: string): string | null {
    const entry = Object.entries(CATEGORY_LABELS).find(([, v]) => v === label);
    return entry ? entry[0] : null;
}
