import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/server/supabase-admin';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, category, date } = body;

        const supabase = createAdminClient();

        const { data: existing, error: fetchError } = await supabase
            .from('transactions')
            .select('id')
            .eq('id', id)
            .eq('user_id', session.user.id)
            .maybeSingle();

        if (fetchError || !existing) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        const updates: Record<string, unknown> = {};

        if (name !== undefined) updates.name = name;
        if (date !== undefined) updates.date = date;
        if (category !== undefined) {
            updates.category = category;
            updates.is_categorised = true;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const { data: updated, error: updateError } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating transaction:', updateError);
            return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
        }

        return NextResponse.json({ transaction: updated });
    } catch (err) {
        console.error('Error in PATCH /api/transactions/[id]:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
