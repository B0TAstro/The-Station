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

        const { data: plaidItems, error } = await supabase
            .from('plaid_items')
            .select('id')
            .eq('user_id', session.user.id)
            .limit(1);

        if (error) {
            console.error('Error fetching true layer items:', error);
            return NextResponse.json({ error: 'Failed to check connection status' }, { status: 500 });
        }

        const connected = plaidItems && plaidItems.length > 0;

        return NextResponse.json({ connected });
    } catch (err) {
        console.error('Error checking connection status:', err);
        return NextResponse.json({ error: 'Failed to check connection status' }, { status: 500 });
    }
}
