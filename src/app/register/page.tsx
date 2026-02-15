'use client';

import AuthFlipCard from '@/components/auth/AuthFlipCard';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            <AuthFlipCard key="register" initialView="register" />
        </div>
    );
}
