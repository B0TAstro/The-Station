'use client';

import { useState } from 'react';
import { Header } from '@/components/global';
import { Button, Input } from '@/components/ui';
import { RefreshCcw } from 'lucide-react';
import { TransactionList } from '@/components/budget/TransactionList';
import { CSVImport, type ParsedTransaction } from '@/components/budget/CSVImport';

const categories = ['Tous', 'Abonnement', 'Courses', 'Revenu', 'Restaurant', 'Transport', 'Logement'];

export default function TransactionsPage() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [forceRefresh, setForceRefresh] = useState(0);

    const handleSync = () => {
        setForceRefresh((prev) => prev + 1);
    };

    return (
        <div>
            <Header title="Transactions" description="Toutes tes transactions bancaires" variant="budget">
                <div className="flex gap-2">
                    <CSVImport onImport={handleSync} />
                    <Button variant="budget" onClick={handleSync}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Synchroniser
                    </Button>
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

            <TransactionList forceRefresh={forceRefresh > 0} />
        </div>
    );
}
