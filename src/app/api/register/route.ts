import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const limiter = rateLimit(`register:${ip}`, {
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
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { prenom, nom, pseudo, email, password } = validation.data;

        const supabase = createAdminClient();
        const { data: existingUser } = await supabase.from('users').select('email').eq('email', email).single();

        if (existingUser) {
            return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const { error: insertError } = await supabase.from('users').insert([
            {
                prenom,
                nom,
                pseudo,
                email,
                password: hashedPassword,
                authorized: false,
            },
        ]);

        if (insertError) {
            console.error('Registration insert error:', insertError);
            return NextResponse.json({ error: "Une erreur est survenue lors de l'inscription." }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Registration error:', err);
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    }
}
