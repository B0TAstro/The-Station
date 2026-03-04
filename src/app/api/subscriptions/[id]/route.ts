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
        const supabase = createAdminClient();
        const body = await request.json();

        const { data: existing, error: fetchError } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('id', id)
            .eq('user_id', session.user.id)
            .maybeSingle();

        if (fetchError || !existing) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        const updates: Record<string, unknown> = {};
        if (body.name !== undefined) updates.name = body.name;
        if (body.amount !== undefined) updates.amount = Math.abs(body.amount);
        if (body.category !== undefined) updates.category = body.category;
        if (body.billing_day !== undefined) updates.billing_day = parseInt(body.billing_day);
        if (body.active !== undefined) updates.active = body.active;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const { data: updated, error: updateError } = await supabase
            .from('subscriptions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating subscription:', updateError);
            return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
        }

        return NextResponse.json({ subscription: updated });
    } catch (err) {
        console.error('Error in PATCH /api/subscriptions/[id]:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const supabase = createAdminClient();

        const { error } = await supabase.from('subscriptions').delete().eq('id', id).eq('user_id', session.user.id);

        if (error) {
            console.error('Error deleting subscription:', error);
            return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error in DELETE /api/subscriptions/[id]:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
