'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface AccountModalProps {
    title: string;
    children: ReactNode;
    actions?: ReactNode;
}

export function AccountModal({ title, children, actions }: AccountModalProps) {
    const router = useRouter();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur">
            <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-border mx-4">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <div className="flex items-center gap-2">
                        {actions}
                        <button
                            onClick={() => router.back()}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-64px)]">{children}</div>
            </div>
        </div>
    );
}
