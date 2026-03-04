import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/server/supabase-admin';
import { CATEGORY_LABELS } from '@/types/budget';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();

        // Fetch manual subscriptions
        const { data: subscriptions, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching subscriptions:', error);
            return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
        }

        // Auto-detect recurring transactions
        // Look for transactions with the same description + similar amount appearing in 2+ different months
        const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('description, amount, date, category')
            .eq('user_id', session.user.id)
            .lt('amount', 0)
            .order('date', { ascending: false });

        if (txError) {
            console.error('Error fetching transactions for detection:', txError);
        }

        const detected: Array<{
            id: string;
            name: string;
            amount: number;
            category: string | null;
            billing_day: number;
            months: number;
            is_detected: true;
        }> = [];

        if (transactions && transactions.length > 0) {
            // Group by description + rounded amount
            const groups: Record<string, { dates: string[]; amount: number; category: string | null }> = {};

            for (const t of transactions) {
                const key = `${t.description.toLowerCase().trim()}|${Math.round(Math.abs(t.amount) * 100)}`;
                if (!groups[key]) {
                    groups[key] = { dates: [], amount: Math.abs(t.amount), category: t.category };
                }
                groups[key].dates.push(t.date);
            }

            // Filter: must appear in at least 2 distinct months
            const existingNames = new Set(
                (subscriptions || []).map((s: { name: string }) => s.name.toLowerCase().trim()),
            );

            for (const [key, group] of Object.entries(groups)) {
                const months = new Set(group.dates.map((d) => d.substring(0, 7)));
                if (months.size >= 2) {
                    const name = key.split('|')[0];
                    // Skip if user already has a manual subscription with this name
                    if (existingNames.has(name)) continue;

                    // Determine billing day from the most recent transaction
                    const sortedDates = group.dates.sort().reverse();
                    const billingDay = new Date(sortedDates[0]).getDate();

                    detected.push({
                        id: `detected_${key}`,
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        amount: Math.round(group.amount * 100) / 100,
                        category: group.category,
                        billing_day: billingDay,
                        months: months.size,
                        is_detected: true,
                    });
                }
            }

            // Sort detected by amount descending
            detected.sort((a, b) => b.amount - a.amount);
        }

        // Add labels to categories
        const enriched = (subscriptions || []).map((s: Record<string, unknown>) => ({
            ...s,
            category_label: typeof s.category === 'string' ? CATEGORY_LABELS[s.category] || s.category : null,
            is_detected: false,
        }));

        const detectedWithLabels = detected.map((d) => ({
            ...d,
            category_label: d.category ? CATEGORY_LABELS[d.category] || d.category : null,
        }));

        return NextResponse.json({
            subscriptions: enriched,
            detected: detectedWithLabels,
        });
    } catch (err) {
        console.error('Error in GET /api/subscriptions:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();
        const body = await request.json();
        const { name, amount, category, billing_day } = body;

        if (!name || amount === undefined || !billing_day) {
            return NextResponse.json({ error: 'name, amount, and billing_day are required' }, { status: 400 });
        }

        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: session.user.id,
                name: name.trim(),
                amount: Math.abs(amount),
                category: category || null,
                billing_day: parseInt(billing_day),
                active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating subscription:', error);
            return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
        }

        return NextResponse.json({ subscription }, { status: 201 });
    } catch (err) {
        console.error('Error in POST /api/subscriptions:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
