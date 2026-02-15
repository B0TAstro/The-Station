'use client';

import AuthFlipCard from '@/components/auth/AuthFlipCard';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            <AuthFlipCard key="login" initialView="login" />
        </div>
    );
}
