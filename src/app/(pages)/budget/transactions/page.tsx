'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/global';
import { Button, Input } from '@/components/shared/ui';
import { RefreshCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { TransactionList } from '@/components/budget/TransactionList';
import { CSVImport } from '@/components/budget/CSVImport';
import { CategoriseModal } from '@/components/budget/CategoriseModal';
import { CATEGORY_LABELS, Transaction } from '@/types/budget';

interface UncategorisedTransaction {
    id: string;
    amount: number;
    date: string;
    description: string;
    name: string | null;
    category: string | null;
}

export default function TransactionsPage() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [refreshKey, setRefreshKey] = useState(0);
    const [lastCsvImport, setLastCsvImport] = useState<string | null>(null);
    const [uncategorisedCount, setUncategorisedCount] = useState(0);
    const [showCategoriseModal, setShowCategoriseModal] = useState(false);
    const [uncategorisedTransactions, setUncategorisedTransactions] = useState<UncategorisedTransaction[]>([]);
    const [loadingUncategorised, setLoadingUncategorised] = useState(false);
    const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/transactions');
            const data = await res.json();
            setLastCsvImport(data.lastCsvImport || null);
            setUncategorisedCount(data.uncategorisedCount || 0);
        } catch (err) {
            console.error('Failed to fetch transaction data:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshKey]);

    const handleSync = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const handleOpenCategorise = async () => {
        setLoadingUncategorised(true);
        try {
            const res = await fetch('/api/transactions?uncategorised=true');
            const data = await res.json();
            setUncategorisedTransactions(data.transactions || []);
            setShowCategoriseModal(true);
        } catch (err) {
            console.error('Failed to fetch uncategorised transactions:', err);
        } finally {
            setLoadingUncategorised(false);
        }
    };

    const handleCategoriseComplete = () => {
        setShowCategoriseModal(false);
        setUncategorisedTransactions([]);
        handleSync();
    };

    const handleCategoriseClose = () => {
        setShowCategoriseModal(false);
        setUncategorisedTransactions([]);
        handleSync();
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setEditTransaction(transaction);
    };

    const handleEditComplete = () => {
        setEditTransaction(null);
        handleSync();
    };

    const handleEditClose = () => {
        setEditTransaction(null);
    };

    const categoryFilters = ['Tous', ...Object.values(CATEGORY_LABELS)];

    return (
        <div>
            <Header title="Transactions" description="Toutes tes transactions bancaires" variant="budget">
                <div className="flex items-center gap-3">
                    {uncategorisedCount > 0 ? (
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={handleOpenCategorise}
                            disabled={loadingUncategorised}
                        >
                            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
                            {loadingUncategorised
                                ? 'Chargement...'
                                : `${uncategorisedCount} non catégorisée${uncategorisedCount > 1 ? 's' : ''}`}
                        </Button>
                    ) : (
                        <Button variant="secondary" size="md" disabled>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                            Aucune à catégoriser
                        </Button>
                    )}
                    {lastCsvImport && (
                        <span className="text-xs text-muted-foreground">
                            Dernier import:{' '}
                            {new Date(lastCsvImport).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    )}
                    <div className="flex items-center border-l border-border pl-3 gap-2">
                        <CSVImport onImport={handleSync} />
                        <Button variant="budget" onClick={handleSync}>
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Synchroniser
                        </Button>
                    </div>
                </div>
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
                {categoryFilters.map((cat) => (
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

            <TransactionList
                key={refreshKey}
                search={search}
                selectedCategory={selectedCategory}
                onEdit={handleEditTransaction}
            />

            {showCategoriseModal && uncategorisedTransactions.length > 0 && (
                <CategoriseModal
                    transactions={uncategorisedTransactions}
                    onClose={handleCategoriseClose}
                    onComplete={handleCategoriseComplete}
                />
            )}

            {editTransaction && (
                <CategoriseModal
                    transactions={[editTransaction]}
                    onClose={handleEditClose}
                    onComplete={handleEditComplete}
                />
            )}
        </div>
    );
}
