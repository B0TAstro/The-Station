'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';

interface TrueLayerLinkProps {
    onLinkSuccess?: () => void;
}

export function TrueLayerLink({ onLinkSuccess: _onLinkSuccess }: TrueLayerLinkProps) {
    const [authUrl, setAuthUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAuthUrl() {
            try {
                const response = await fetch('/api/true-layer/create-link-token', {
                    method: 'POST',
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to create auth URL');
                }

                setAuthUrl(data.authUrl);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize TrueLayer Link');
            } finally {
                setLoading(false);
            }
        }

        fetchAuthUrl();
    }, []);

    if (loading) {
        return (
            <Button disabled size="lg">
                Chargement...
            </Button>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col gap-2">
                <Button onClick={() => window.location.reload()} variant="budget" size="lg">
                    Réessayer
                </Button>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <a href={authUrl || '#'} target="_blank" rel="noopener noreferrer">
                <Button variant="budget" size="lg">
                    Connecter mon compte bancaire
                </Button>
            </a>
        </div>
    );
}
