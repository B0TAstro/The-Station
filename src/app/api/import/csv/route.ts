import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/server/supabase-admin';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const text = await file.text();
        const lines = text.split('\n').filter((line) => line.trim());

        if (lines.length < 2) {
            return NextResponse.json({ error: 'File empty or invalid' }, { status: 400 });
        }

        const transactions: Array<{
            user_id: string;
            plaid_transaction_id: string;
            account_id: string;
            amount: number;
            date: string;
            name: string;
            merchant_name: string | null;
            category: string[] | null;
        }> = [];

        let dateCol = -1;
        let libelleCol = -1;
        let debitCol = -1;
        let creditCol = -1;

        const headers = lines[0].split(';').map((h) => h.trim().replace(/"/g, ''));

        headers.forEach((header, index) => {
            const h = header.toLowerCase();
            if (h.includes('date')) dateCol = index;
            if (h.includes('libell')) libelleCol = index;
            if (h.includes('dйbit') || h.includes('debit')) debitCol = index;
            if (h.includes('crйdit') || h.includes('credit')) creditCol = index;
        });

        if (dateCol === -1 || libelleCol === -1) {
            return NextResponse.json(
                { error: 'Invalid CSV format. Expected columns: Date, Libellé, Débit, Crédit' },
                { status: 400 },
            );
        }

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(';').map((c) => c.trim().replace(/"/g, ''));
            if (cols.length <= Math.max(dateCol, libelleCol)) continue;

            const dateStr = cols[dateCol];
            const libelle = cols[libelleCol];
            const debit = debitCol >= 0 ? parseFloat(cols[debitCol]?.replace(',', '.') || '0') : 0;
            const credit = creditCol >= 0 ? parseFloat(cols[creditCol]?.replace(',', '.') || '0') : 0;

            const amount = credit > 0 ? credit : -Math.abs(debit);
            const date = parseDate(dateStr);

            if (!date || !libelle) continue;

            const transactionId = `csv_${Date.now()}_${i}`;

            transactions.push({
                user_id: session.user.id,
                plaid_transaction_id: transactionId,
                account_id: 'csv_import',
                amount,
                date,
                name: libelle,
                merchant_name: extractMerchant(libelle),
                category: null,
            });
        }

        if (transactions.length === 0) {
            return NextResponse.json({ error: 'No valid transactions found' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error: upsertError } = await supabase.from('transactions').upsert(transactions, {
            onConflict: 'plaid_transaction_id',
            ignoreDuplicates: true,
        });

        if (upsertError) {
            console.error('Error importing transactions:', upsertError);
            return NextResponse.json({ error: 'Failed to import transactions' }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: transactions.length });
    } catch (err) {
        console.error('Error in CSV import:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function parseDate(dateStr: string): string | null {
    const formats = [/^(\d{2})\/(\d{2})\/(\d{4})$/, /^(\d{2})-(\d{2})-(\d{4})$/, /^(\d{4})-(\d{2})-(\d{2})$/];

    for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
            if (format === formats[2]) {
                return dateStr;
            }
            const [, a, b, c] = match;
            return `${c}-${b}-${a}`;
        }
    }

    return null;
}

function extractMerchant(description: string): string | null {
    const merchant = description
        .replace(/CB\s*/gi, '')
        .replace(/\d{4,}/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return merchant.length > 0 ? merchant : null;
}
