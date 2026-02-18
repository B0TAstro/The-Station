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

        const { data: banks, error } = await supabase
            .from('plaid_items')
            .select('id, institution_name, status, created_at')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching banks:', error);
            return NextResponse.json({ error: 'Failed to fetch banks' }, { status: 500 });
        }

        return NextResponse.json({ banks: banks || [] });
    } catch (err) {
        console.error('Error in GET banks:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Bank ID required' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { error } = await supabase.from('plaid_items').delete().eq('id', id).eq('user_id', session.user.id);

        if (error) {
            console.error('Error deleting bank:', error);
            return NextResponse.json({ error: 'Failed to delete bank' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error in DELETE banks:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
