import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/server/supabase-admin';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const uncategorisedOnly = searchParams.get('uncategorised') === 'true';

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('last_csv_import')
            .eq('id', session.user.id)
            .single();

        if (userError) {
            console.error('Error fetching user:', userError);
        }

        const { count: uncategorisedCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .or('is_categorised.eq.false,is_categorised.is.null');

        let query = supabase
            .from('transactions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: false });

        if (uncategorisedOnly) {
            query = query.or('is_categorised.eq.false,is_categorised.is.null');
        } else {
            query = query.limit(100);
        }

        const { data: transactions, error } = await query;

        if (error) {
            console.error('Error fetching transactions:', error);
            return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
        }

        return NextResponse.json({
            transactions: transactions || [],
            lastCsvImport: user?.last_csv_import || null,
            uncategorisedCount: uncategorisedCount || 0,
        });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
