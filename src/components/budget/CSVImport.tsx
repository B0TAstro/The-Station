'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/shared/ui';
import { Upload } from 'lucide-react';
import { AccountConfirmModal, type DetectedAccount } from './AccountConfirmModal';

interface CSVImportProps {
    onImport?: () => void;
}

export function CSVImport({ onImport }: CSVImportProps) {
    const [error, setError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [detectedAccounts, setDetectedAccounts] = useState<DetectedAccount[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setError(null);
        setImporting(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/transactions/csv', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erreur lors de l'import");
            }

            if (data.needsConfirmation) {
                setDetectedAccounts(data.accounts);
                setShowModal(true);
                setImporting(false);
                return;
            }

            onImport?.();
            setSelectedFile(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de l'import");
            setImporting(false);
        }
    };

    const handleConfirm = async (confirmedAccounts: Array<{ accountNumber: string | null; accountName: string }>) => {
        setShowModal(false);
        setImporting(true);

        try {
            if (!selectedFile) {
                throw new Error('No file selected');
            }

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('confirmedAccounts', JSON.stringify(confirmedAccounts));

            const res = await fetch('/api/transactions/csv', {
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
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <>
            <div className="flex flex-col gap-0">
                <label className="cursor-pointer">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        disabled={importing}
                        className="cursor-pointer pointer-events-none"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        {importing ? 'Import...' : 'Importer CSV'}
                    </Button>
                </label>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {showModal && (
                <AccountConfirmModal
                    accounts={detectedAccounts}
                    onConfirm={handleConfirm}
                    onCancel={() => {
                        setShowModal(false);
                        setSelectedFile(null);
                    }}
                />
            )}
        </>
    );
}
