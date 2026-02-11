'use client';

import { Header } from '@/components/layout';
import { Card, CardContent, Button, Badge, Input } from '@/components/ui';
import { RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

const categories = ['Tous', 'Abonnement', 'Courses', 'Revenu', 'Restaurant', 'Transport', 'Logement'];

export default function TransactionsPage() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const transactions: {
        id: string;
        description: string;
        amount: number;
        date: string;
        category: string;
        is_subscription: boolean;
    }[] = [];

    const filteredTransactions = transactions.filter((t) => {
        const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'Tous' || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div>
            <Header title="Transactions" description="Toutes tes transactions bancaires" variant="budget">
                <Button variant="budget">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Synchroniser
                </Button>
            </Header>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="Rechercher une transaction..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            selectedCategory === cat
                                ? 'bg-budget text-white'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <Card>
                <CardContent className="p-0">
                    {filteredTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <p className="text-lg font-medium">Aucune transaction</p>
                            <p className="text-sm mt-1">Connecte ta banque pour voir tes transactions</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filteredTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
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
                                            <p className="font-medium">{transaction.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(transaction.date)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-2">
                                            <Badge variant="outline">{transaction.category}</Badge>
                                            {transaction.is_subscription && <Badge variant="budget">Récurrent</Badge>}
                                        </div>
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
