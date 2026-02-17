import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server/supabase-admin';

export async function POST(request: NextRequest) {
    try {
        const { pseudo, email } = await request.json();
        const supabase = createAdminClient();

        if (pseudo) {
            const { data: existingPseudo } = await supabase
                .from('users')
                .select('pseudo')
                .eq('pseudo', pseudo)
                .single();

            if (existingPseudo) {
                return NextResponse.json({ available: false, field: 'pseudo' });
            }
        }

        if (email) {
            const { data: existingEmail } = await supabase.from('users').select('email').eq('email', email).single();

            if (existingEmail) {
                return NextResponse.json({ available: false, field: 'email' });
            }
        }

        return NextResponse.json({ available: true });
    } catch (err) {
        console.error('Check availability error:', err);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
