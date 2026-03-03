'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/global';
import { Button, Input } from '@/components/shared/ui';
import { RefreshCcw } from 'lucide-react';
import { TransactionList } from '@/components/budget/TransactionList';
import { CSVImport } from '@/components/budget/CSVImport';

const categories = ['Tous', 'Abonnement', 'Courses', 'Revenu', 'Restaurant', 'Transport', 'Logement'];

export default function TransactionsPage() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [refreshKey, setRefreshKey] = useState(0);
    const [lastCsvImport, setLastCsvImport] = useState<string | null>(null);

    const fetchLastImport = async () => {
        try {
            const res = await fetch('/api/transactions');
            const data = await res.json();
            setLastCsvImport(data.lastCsvImport || null);
        } catch (err) {
            console.error('Failed to fetch last import date:', err);
        }
    };

    useEffect(() => {
        fetchLastImport();
    }, [refreshKey]);

    const handleSync = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div>
            <Header title="Transactions" description="Toutes tes transactions bancaires" variant="budget">
                <div className="flex items-center gap-3">
                    {lastCsvImport && (
                        <span className="text-xs text-muted-foreground mr-2">
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

            <TransactionList key={refreshKey} />
        </div>
    );
}
