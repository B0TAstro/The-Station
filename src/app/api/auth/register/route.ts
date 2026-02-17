import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/server/supabase-admin';
import { rateLimit } from '@/lib/middleware/rate-limit';
import { registerSchema } from '@/lib/schemas/auth';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const limiter = rateLimit(`register:${ip}`, {
            maxAttempts: 5,
            windowMs: 5 * 60 * 1000,
        });

        if (!limiter.success) {
            return NextResponse.json({ error: '❌ Trop de tentatives, réessayez plus tard !' }, { status: 429 });
        }

        const body = await request.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { prenom, nom, pseudo, email, password, avatar_url } = body;

        const supabase = createAdminClient();
        const { data: existingUser } = await supabase.from('users').select('email').eq('email', email).single();

        if (existingUser) {
            return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 });
        }

        const { data: existingPseudo } = await supabase.from('users').select('pseudo').eq('pseudo', pseudo).single();

        if (existingPseudo) {
            return NextResponse.json({ error: 'Ce pseudo est déjà utilisé.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const { error: insertError } = await supabase.from('users').insert([
            {
                prenom,
                nom,
                pseudo,
                email,
                password: hashedPassword,
                avatar_url: avatar_url || null,
                authorized: false,
            },
        ]);

        if (insertError) {
            console.error('❌ Registration insert error:', insertError);
            return NextResponse.json({ error: "Erreur serveur à l'inscription." }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('❌ Registration error:', err);
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    }
}
