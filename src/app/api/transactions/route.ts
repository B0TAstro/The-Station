import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/server/supabase-admin';

export async function GET(_request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('last_csv_import')
            .eq('id', session.user.id)
            .single();

        if (userError) {
            console.error('Error fetching user:', userError);
        }

        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching transactions:', error);
            return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
        }

        return NextResponse.json({
            transactions: transactions || [],
            lastCsvImport: user?.last_csv_import || null,
        });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
