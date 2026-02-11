'use client';

import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '@/components/ui';
import { Search, Filter, Tag, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

// Demo transactions
const demoTransactions = [
    { id: '1', description: 'Spotify', amount: -9.99, date: '2026-02-08', category: 'Abonnement', is_subscription: true },
    { id: '2', description: 'Netflix', amount: -15.99, date: '2026-02-07', category: 'Abonnement', is_subscription: true },
    { id: '3', description: 'Carrefour', amount: -67.50, date: '2026-02-06', category: 'Courses', is_subscription: false },
    { id: '4', description: 'Salaire', amount: 3500.00, date: '2026-02-05', category: 'Revenu', is_subscription: false },
    { id: '5', description: 'Amazon Prime', amount: -6.99, date: '2026-02-04', category: 'Abonnement', is_subscription: true },
    { id: '6', description: 'Restaurant', amount: -45.00, date: '2026-02-03', category: 'Restaurant', is_subscription: false },
    { id: '7', description: 'Uber', amount: -18.50, date: '2026-02-02', category: 'Transport', is_subscription: false },
    { id: '8', description: 'Loyer', amount: -850.00, date: '2026-02-01', category: 'Logement', is_subscription: true },
];

const categories = ['Tous', 'Abonnement', 'Courses', 'Revenu', 'Restaurant', 'Transport', 'Logement'];

export default function TransactionsPage() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');

    const filteredTransactions = demoTransactions.filter((t) => {
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

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="Rechercher une transaction..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedCategory === cat
                                ? 'bg-budget text-white'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions List */}
            <Card>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {filteredTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-4 hover:bg-card-hover transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.amount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                        <span className="text-lg">
                                            {transaction.amount > 0 ? '↑' : '↓'}
                                        </span>
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
                                        {transaction.is_subscription && (
                                            <Badge variant="budget">Récurrent</Badge>
                                        )}
                                    </div>
                                    <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
