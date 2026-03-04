import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/server/supabase-admin';
import { CATEGORY_LABELS } from '@/types/budget';

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

        // ---- Monthly data (last 6 months from the end of the period) ----
        const endDate = new Date(end);
        const monthlyStart = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1);
        const monthlyStartStr = monthlyStart.toISOString().split('T')[0];

        const { data: monthlyTransactions, error: monthlyError } = await supabase
            .from('transactions')
            .select('amount, date')
            .eq('user_id', session.user.id)
            .gte('date', monthlyStartStr)
            .lte('date', end);

        if (monthlyError) {
            console.error('Error fetching monthly stats:', monthlyError);
            return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
        }

        // Aggregate by month
        const monthlyMap: Record<string, { income: number; expenses: number }> = {};

        // Pre-fill 6 months
        for (let i = 0; i < 6; i++) {
            const d = new Date(endDate.getFullYear(), endDate.getMonth() - (5 - i), 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap[key] = { income: 0, expenses: 0 };
        }

        for (const t of monthlyTransactions || []) {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyMap[key]) {
                if (t.amount > 0) {
                    monthlyMap[key].income += t.amount;
                } else {
                    monthlyMap[key].expenses += Math.abs(t.amount);
                }
            }
        }

        const monthly = Object.entries(monthlyMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, data]) => {
                const [y, m] = month.split('-');
                const d = new Date(parseInt(y), parseInt(m) - 1, 1);
                const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
                return {
                    month,
                    label: label.charAt(0).toUpperCase() + label.slice(1),
                    income: Math.round(data.income * 100) / 100,
                    expenses: Math.round(data.expenses * 100) / 100,
                };
            });

        // ---- Category breakdown for the selected period ----
        const { data: periodTransactions, error: periodError } = await supabase
            .from('transactions')
            .select('amount, category')
            .eq('user_id', session.user.id)
            .gte('date', start)
            .lte('date', end)
            .lt('amount', 0); // expenses only

        if (periodError) {
            console.error('Error fetching category stats:', periodError);
            return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
        }

        const categoryMap: Record<string, number> = {};

        for (const t of periodTransactions || []) {
            const cat = t.category || 'uncategorised';
            categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(t.amount);
        }

        const categories = Object.entries(categoryMap)
            .map(([category, total]) => ({
                category,
                label: CATEGORY_LABELS[category] || (category === 'uncategorised' ? 'Non catégorisé' : category),
                total: Math.round(total * 100) / 100,
            }))
            .sort((a, b) => b.total - a.total);

        return NextResponse.json({
            monthly,
            categories,
            period: { start, end },
        });
    } catch (err) {
        console.error('Error in GET /api/transactions/stats:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
