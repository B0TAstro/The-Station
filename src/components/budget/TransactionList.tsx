'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import { RefreshCcw } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Transaction {
    id: string;
    plaid_transaction_id: string;
    account_id: string;
    amount: number;
    date: string;
    name: string;
    merchant_name: string | null;
    category: string[] | null;
    plaid_item_id: string;
    user_id: string;
}

interface TransactionListProps {
    forceRefresh?: boolean;
}

export function TransactionList({ forceRefresh = false }: TransactionListProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const url = forceRefresh ? '/api/true-layer/transactions?force=true' : '/api/true-layer/transactions';

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch transactions');
            }

            setTransactions(data.transactions || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load transactions');
        } finally {
            setLoading(false);
        }
    }, [forceRefresh]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions, forceRefresh]);

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-16">
                    <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <p className="text-lg font-medium text-red-500">{error}</p>
                    <button onClick={fetchTransactions} className="mt-4 text-sm text-budget hover:underline">
                        Réessayer
                    </button>
                </CardContent>
            </Card>
        );
    }

    if (transactions.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <p className="text-lg font-medium">Aucune transaction</p>
                    <p className="text-sm mt-1">Connecte ta banque pour voir tes transactions</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.plaid_transaction_id}
                            className="flex items-center justify-between p-4 hover:bg-card-hover transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        transaction.amount > 0
                                            ? 'bg-green-500/10 text-green-400'
                                            : 'bg-red-500/10 text-red-400'
                                    }`}
                                >
                                    <span className="text-lg">{transaction.amount > 0 ? '↑' : '↓'}</span>
                                </div>
                                <div>
                                    <p className="font-medium">{transaction.merchant_name || transaction.name}</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {transaction.category && transaction.category.length > 0 && (
                                    <Badge variant="outline">{transaction.category[0]}</Badge>
                                )}
                                <p
                                    className={`font-semibold ${
                                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                                    }`}
                                >
                                    {transaction.amount > 0 ? '+' : ''}
                                    {formatCurrency(transaction.amount)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
