'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui';
import { Upload } from 'lucide-react';

interface CSVImportProps {
    onImport?: (transactions: ParsedTransaction[]) => void;
}

export interface ParsedTransaction {
    date: string;
    description: string;
    amount: number;
    category?: string;
}

export function CSVImport({ onImport }: CSVImportProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const parseCSV = (content: string): ParsedTransaction[] => {
        const lines = content.trim().split('\n');
        const transactions: ParsedTransaction[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));

            if (parts.length >= 3) {
                transactions.push({
                    date: parts[0],
                    description: parts[1],
                    amount: parseFloat(parts[2].replace(/[^0-9.-]/g, '')),
                    category: parts[3] || undefined,
                });
            }
        }

        return transactions;
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const content = await file.text();
            const transactions = parseCSV(content);

            if (transactions.length === 0) {
                throw new Error('Aucune transaction trouvée dans le fichier');
            }

            onImport?.(transactions);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de l'import");
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-import"
            />

            <label htmlFor="csv-import">
                <Button variant="secondary" size="sm" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Importer CSV
                </Button>
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
