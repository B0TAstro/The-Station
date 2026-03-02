'use client';

import { Input, Label, Button } from '@/components/shared/ui';
import { Check, X } from 'lucide-react';

interface ProfileFormProps {
    formData: { prenom: string; nom: string; pseudo: string };
    onChange: (data: { prenom: string; nom: string; pseudo: string }) => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
    isDirty: boolean;
}

export function ProfileForm({ formData, onChange, onSave, onCancel, saving, isDirty }: ProfileFormProps) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) => onChange({ ...formData, prenom: e.target.value })}
                        placeholder="Prénom"
                    />
                </div>
                <div>
                    <Label htmlFor="nom">Nom</Label>
                    <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => onChange({ ...formData, nom: e.target.value })}
                        placeholder="Nom"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="pseudo">Pseudo</Label>
                <Input
                    id="pseudo"
                    value={formData.pseudo}
                    onChange={(e) => onChange({ ...formData, pseudo: e.target.value })}
                    placeholder="Pseudo"
                />
            </div>

            {isDirty && (
                <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={onCancel} className="flex-1">
                        <X className="h-3.5 w-3.5 mr-1" />
                        Annuler
                    </Button>
                    <Button type="button" size="sm" onClick={onSave} disabled={saving} className="flex-1">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        {saving ? '...' : 'Enregistrer'}
                    </Button>
                </div>
            )}
        </div>
    );
}
