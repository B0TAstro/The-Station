import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/server/supabase-admin';

function getPeriodRange(period: string, date: string): { start: string; end: string } {
    const [yearStr, monthStr] = date.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    if (period === 'quarter') {
        const quarterStart = Math.floor((month - 1) / 3) * 3;
        const start = new Date(year, quarterStart, 1);
        const end = new Date(year, quarterStart + 3, 0);
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
        };
    }

    if (period === 'year') {
        return {
            start: `${year}-01-01`,
            end: `${year}-12-31`,
        };
    }

    // Default: month
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
    };
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'month';
        const now = new Date();
        const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const date = searchParams.get('date') || defaultDate;

        const { start, end } = getPeriodRange(period, date);

        // Fetch all transactions in the period
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('amount, category')
            .eq('user_id', session.user.id)
            .gte('date', start)
            .lte('date', end);

        if (error) {
            console.error('Error fetching summary:', error);
            return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
        }

        let income = 0;
        let expenses = 0;
        let subscriptionTotal = 0;

        for (const t of transactions || []) {
            if (t.amount > 0) {
                income += t.amount;
            } else {
                expenses += Math.abs(t.amount);
            }
            if (t.category === 'subscription') {
                subscriptionTotal += Math.abs(t.amount);
            }
        }

        return NextResponse.json({
            income: Math.round(income * 100) / 100,
            expenses: Math.round(expenses * 100) / 100,
            balance: Math.round((income - expenses) * 100) / 100,
            subscriptionTotal: Math.round(subscriptionTotal * 100) / 100,
            period: { start, end },
        });
    } catch (err) {
        console.error('Error in GET /api/transactions/summary:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
