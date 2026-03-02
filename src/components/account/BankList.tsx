'use client';

import { Button } from '@/components/shared/ui';
import { Building, Trash2, Plus } from 'lucide-react';
import type { Bank } from '@/lib/account';

interface BankListProps {
    banks: Bank[];
    onConnect: () => void;
    onDelete: (id: string) => void;
}

export function BankList({ banks, onConnect, onDelete }: BankListProps) {
    return (
        <div className="space-y-2">
            {banks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-1">Aucune banque connectée</p>
            ) : (
                banks.map((bank) => (
                    <div key={bank.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Building className="h-4 w-4 text-budget" />
                            <div>
                                <p className="text-sm font-medium">{bank.provider_name || 'Banque'}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(bank.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(bank.id)}
                            className="text-red-500 hover:text-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))
            )}
            <Button variant="secondary" onClick={onConnect} className="w-full mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Connecter une banque
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
                Se déclarer en auto-entreprise pour avoir le live transactions fetching
            </p>
        </div>
    );
}
