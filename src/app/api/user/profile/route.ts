import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/server/supabase-admin';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();

        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, prenom, nom, pseudo, avatar_url, created_at')
            .eq('id', session.user.id)
            .single();

        if (error) {
            console.error('Error fetching user:', error);
            return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
        }

        return NextResponse.json(user);
    } catch (err) {
        console.error('Error in GET user:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { prenom, nom, pseudo, avatar_url } = body;

        const supabase = createAdminClient();

        const { data: user, error } = await supabase
            .from('users')
            .update({
                prenom: prenom ?? null,
                nom: nom ?? null,
                pseudo: pseudo ?? null,
                avatar_url: avatar_url ?? null,
            })
            .eq('id', session.user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating user:', error);
            return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }

        return NextResponse.json(user);
    } catch (err) {
        console.error('Error in POST user:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
