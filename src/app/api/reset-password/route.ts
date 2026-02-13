import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const limiter = rateLimit(`reset-password:${ip}`, {
            maxAttempts: 5,
            windowMs: 5 * 60 * 1000,
        });

        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
                { status: 429 },
            );
        }

        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json({ error: 'Token et mot de passe requis.' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 6 caractères.' },
                { status: 400 },
            );
        }

        const supabase = createAdminClient();
        const { data: user } = await supabase
            .from('users')
            .select('id, reset_token_expiry')
            .eq('reset_token', token)
            .single();

        if (!user) {
            return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 400 });
        }

        if (new Date(user.reset_token_expiry) < new Date()) {
            return NextResponse.json({ error: 'Ce lien a expiré. Demandez un nouveau lien.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const { error: updateError } = await supabase
            .from('users')
            .update({
                password: hashedPassword,
                reset_token: null,
                reset_token_expiry: null,
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Failed to reset password:', updateError);
            return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Reset password error:', err);
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    }
}
