'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, Badge } from '@/components/shared/ui';
import { RefreshCcw, Pencil } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Transaction, getCategoryLabel, getCategorySlug } from '@/types/budget';
import { Pagination } from '@/components/budget/Pagination';

interface TransactionListProps {
    search?: string;
    selectedCategory?: string;
    onEdit?: (transaction: Transaction) => void;
}

export function TransactionList({ search = '', selectedCategory = 'Tous', onEdit }: TransactionListProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/transactions');
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
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedCategory]);

    // Client-side filtering
    const filteredTransactions = transactions.filter((t) => {
        if (search) {
            const q = search.toLowerCase();
            const nameMatch = t.name?.toLowerCase().includes(q) ?? false;
            const descMatch = t.description.toLowerCase().includes(q);
            const categoryLabel = t.category ? getCategoryLabel(t.category).toLowerCase() : '';
            const catMatch = categoryLabel.includes(q);
            if (!nameMatch && !descMatch && !catMatch) return false;
        }

        if (selectedCategory && selectedCategory !== 'Tous') {
            if (!t.category) return false;
            const slug = getCategorySlug(selectedCategory);
            if (slug) {
                if (t.category !== slug) return false;
            } else {
                if (getCategoryLabel(t.category) !== selectedCategory) return false;
            }
        }

        return true;
    });

    // Pagination
    const totalItems = filteredTransactions.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + pageSize);

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

    if (filteredTransactions.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <p className="text-lg font-medium">Aucun résultat</p>
                    <p className="text-sm mt-1">Aucune transaction ne correspond aux filtres</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {paginatedTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="group flex items-center justify-between p-4 hover:bg-card-hover transition-colors"
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
                                    <p className="font-medium">{transaction.name || transaction.description}</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {transaction.category && (
                                    <Badge variant="outline">{getCategoryLabel(transaction.category)}</Badge>
                                )}
                                <p
                                    className={`font-semibold ${
                                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                                    }`}
                                >
                                    {transaction.amount > 0 ? '+' : ''}
                                    {formatCurrency(transaction.amount)}
                                </p>
                                {onEdit && (
                                    <button
                                        onClick={() => onEdit(transaction)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <Pagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
            </CardContent>
        </Card>
    );
}
