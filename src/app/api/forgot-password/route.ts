import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const limiter = rateLimit(`forgot-password:${ip}`, {
            maxAttempts: 3,
            windowMs: 5 * 60 * 1000,
        });

        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
                { status: 429 },
            );
        }

        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email requis.' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data: user } = await supabase.from('users').select('id, email').eq('email', email).single();

        if (!user) {
            return NextResponse.json({ success: true });
        }

        const resetToken = randomUUID();
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

        const { error: updateError } = await supabase
            .from('users')
            .update({
                reset_token: resetToken,
                reset_token_expiry: resetExpiry.toISOString(),
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Failed to store reset token:', updateError);
            return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
        }

        // TODO: Send email with Resend
        const resetUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        console.log(`🔑 Password reset link for ${email}: ${resetUrl}`);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Forgot password error:', err);
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    }
}
