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

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const utf8Text = buffer.toString('latin1');
        const lines = utf8Text.split('\n');

        const transactions: Array<{
            user_id: string;
            source_type: string;
            source_id: string;
            amount: number;
            date: string;
            description: string;
            merchant_name: string | null;
            category: string[] | null;
        }> = [];

        let headerRowIndex = -1;
        let dateCol = -1;
        let libelleCol = -1;
        let debitCol = -1;
        let creditCol = -1;

        for (let i = 0; i < Math.min(lines.length, 15); i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const headers = line.split(';').map((h) => removeDiacritics(h.trim().replace(/"/g, '').toLowerCase()));

            if (
                headers[0]?.includes('date') ||
                (headers[1] && headers[1].includes('lib')) ||
                headers.some((h) => h.includes('debit') || h.includes('credit'))
            ) {
                headerRowIndex = i;
                headers.forEach((h, idx) => {
                    if (h.includes('date')) dateCol = idx;
                    if (h.includes('libelle')) libelleCol = idx;
                    if (h.includes('debit')) debitCol = idx;
                    if (h.includes('credit')) creditCol = idx;
                });
                break;
            }
        }

        if (headerRowIndex === -1) {
            return NextResponse.json({ error: 'Header row not found. Format not recognized.' }, { status: 400 });
        }

        let currentTransaction: { date: string; libelle: string; debit: number; credit: number } | null = null;
        let accumulatedLine = '';
        let inQuotes = false;
        let lineNum = headerRowIndex + 1;

        while (lineNum < lines.length) {
            let line = lines[lineNum];
            if (!line) {
                lineNum++;
                continue;
            }

            for (let i = 0; i < line.length; i++) {
                if (line[i] === '"') {
                    inQuotes = !inQuotes;
                }
            }

            if (inQuotes) {
                accumulatedLine += ' ' + line;
                lineNum++;
                continue;
            }

            if (accumulatedLine) {
                line = accumulatedLine + ' ' + line;
                accumulatedLine = '';
            }

            const cols = parseCSVLine(line);

            if (cols.length >= 2 && cols[dateCol] && /^\d{2}\/\d{2}\/\d{4}$/.test(cols[dateCol])) {
                if (currentTransaction) {
                    const amount =
                        currentTransaction.credit > 0 ? currentTransaction.credit : -Math.abs(currentTransaction.debit);
                    if (amount !== 0 && currentTransaction.libelle) {
                        const transactionId = `csv_${Date.now()}_${lineNum}`;
                        transactions.push({
                            user_id: session.user.id,
                            source_type: 'csv',
                            source_id: transactionId,
                            amount,
                            date: parseDate(currentTransaction.date),
                            description: currentTransaction.libelle,
                            merchant_name: extractMerchant(currentTransaction.libelle),
                            category: null,
                        });
                    }
                }

                const date = cols[dateCol];
                const debit = debitCol >= 0 ? parseFrenchNumber(cols[debitCol]) : 0;
                const credit = creditCol >= 0 ? parseFrenchNumber(cols[creditCol]) : 0;
                let libelle = cols[libelleCol] || '';

                libelle = libelle.replace(/^"|"$/g, '').replace(/""/g, '"');

                currentTransaction = { date, libelle, debit, credit };
            }
            lineNum++;
        }

        if (currentTransaction) {
            const amount =
                currentTransaction.credit > 0 ? currentTransaction.credit : -Math.abs(currentTransaction.debit);
            if (amount !== 0 && currentTransaction.libelle) {
                const transactionId = `csv_${Date.now()}_${lines.length}`;
                transactions.push({
                    user_id: session.user.id,
                    source_type: 'csv',
                    source_id: transactionId,
                    amount,
                    date: parseDate(currentTransaction.date),
                    description: currentTransaction.libelle,
                    merchant_name: extractMerchant(currentTransaction.libelle),
                    category: null,
                });
            }
        }

        if (transactions.length === 0) {
            return NextResponse.json({ error: 'No valid transactions found' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error: upsertError } = await supabase.from('transactions').upsert(transactions, {
            onConflict: 'source_id',
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

function parseDate(dateStr: string): string {
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`;
    }
    return dateStr;
}

function removeDiacritics(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function extractMerchant(description: string): string | null {
    const merchant = description
        .replace(/CB\s*/gi, '')
        .replace(/\d{4,}/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return merchant.length > 0 ? merchant : null;
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ';' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    while (result.length < 5) {
        result.push('');
    }

    return result;
}

function parseFrenchNumber(value: string | undefined): number {
    if (!value) return 0;
    const cleaned = value.replace(/\s/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}
