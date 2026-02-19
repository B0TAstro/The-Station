'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui';
import { Upload } from 'lucide-react';

interface CSVImportProps {
    onImport?: () => void;
}

export function CSVImport({ onImport }: CSVImportProps) {
    const [error, setError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);
        setImporting(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/import/csv', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erreur lors de l'import");
            }

            onImport?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de l'import");
        } finally {
            setImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="cursor-pointer"
            >
                <Upload className="h-4 w-4 mr-2" />
                {importing ? 'Import...' : 'Importer CSV'}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
