// Budget Types
export interface Transaction {
    id: string;
    plaid_id?: string;
    amount: number;
    date: string;
    description: string;
    category: string;
    is_recurring: boolean;
    is_subscription: boolean;
    user_id: string;
}

export interface Subscription {
    id: string;
    name: string;
    amount: number;
    billing_date: number; // day of month
    reminder_days: number;
    next_reminder: string;
    user_id: string;
}

export interface BudgetSummary {
    month: string;
    income: number;
    expenses: number;
    balance: number;
}
