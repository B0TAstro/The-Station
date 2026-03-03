import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/server/supabase-admin';

interface Account {
    id: string;
    user_id: string;
    account_type: string | null;
    account_number: string | null;
    account_name: string | null;
    source_type: string;
}

function parseAccountsFromCSV(
    lines: string[],
): Array<{ accountNumber: string | null; accountName: string; rawLine: string }> {
    const accounts: Array<{ accountNumber: string | null; accountName: string; rawLine: string }> = [];
    const seenAccountNumbers = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed) continue;

        const carteMatch = trimmed.match(/(.+?)\s*carte\s*n°\s*(\d+)/i);
        if (carteMatch) {
            const accountNumber = carteMatch[2];
            if (!seenAccountNumbers.has(accountNumber)) {
                seenAccountNumbers.add(accountNumber);
                accounts.push({
                    accountNumber: accountNumber,
                    accountName: carteMatch[1].trim().replace(/["']/g, '') || 'Compte courant',
                    rawLine: trimmed,
                });
            }
            continue;
        }

        if (
            trimmed.includes('Livret') ||
            trimmed.includes('LEP') ||
            trimmed.includes('CEL') ||
            trimmed.includes('PEL')
        ) {
            const accountName = trimmed.replace(/["']/g, '').trim();
            if (!seenAccountNumbers.has(accountName)) {
                seenAccountNumbers.add(accountName);
                accounts.push({
                    accountNumber: null,
                    accountName: accountName,
                    rawLine: trimmed,
                });
            }
        }
    }

    return accounts;
}

function parseAccountInfo(lines: string[]): { accountNumber: string | null; accountName: string | null } {
    const accounts = parseAccountsFromCSV(lines);
    if (accounts.length > 0) {
        return {
            accountNumber: accounts[0].accountNumber,
            accountName: accounts[0].accountName,
        };
    }
    return { accountNumber: null, accountName: 'Compte courant' };
}

async function checkAccountsExist(
    supabase: ReturnType<typeof createAdminClient>,
    userId: string,
    accounts: Array<{ accountNumber: string | null; accountName: string }>,
): Promise<Array<{ accountNumber: string | null; accountName: string; exists: boolean; id?: string }>> {
    const results = [];

    for (const acc of accounts) {
        let existing = null;
        if (acc.accountNumber) {
            const { data } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', userId)
                .eq('account_number', acc.accountNumber)
                .maybeSingle();
            existing = data;
        }

        if (!existing) {
            const { data } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', userId)
                .eq('account_name', acc.accountName)
                .maybeSingle();
            existing = data;
        }

        results.push({
            accountNumber: acc.accountNumber,
            accountName: acc.accountName,
            exists: !!existing,
            id: existing?.id,
        });
    }

    return results;
}

async function getOrCreateAccount(
    supabase: ReturnType<typeof createAdminClient>,
    userId: string,
    accountNumber: string | null,
    accountName: string | null,
): Promise<Account> {
    if (accountNumber) {
        const { data: existing } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId)
            .eq('account_number', accountNumber)
            .maybeSingle();

        if (existing) return existing;
    }

    const { data: existingByName } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('account_name', accountName)
        .maybeSingle();

    if (existingByName) return existingByName;

    const { data: newAccount, error } = await supabase
        .from('accounts')
        .insert({
            user_id: userId,
            account_type: 'compte_depot',
            account_number: accountNumber,
            account_name: accountName,
            source_type: 'csv',
        })
        .select()
        .single();

    if (error) throw new Error('Failed to create account');
    return newAccount;
}

function generateSourceId(accountId: string, date: string, amount: number, description: string): string {
    const hash = Buffer.from(`${accountId}|${date}|${amount}|${description}`).toString('base64').slice(0, 32);
    return `csv_${hash}`;
}

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

        const confirmedAccountsJson = formData.get('confirmedAccounts') as string | null;
        const confirmedAccounts = confirmedAccountsJson ? JSON.parse(confirmedAccountsJson) : null;

        const detectedAccounts = parseAccountsFromCSV(lines);
        console.log('Detected accounts:', JSON.stringify(detectedAccounts));

        if (detectedAccounts.length === 0) {
            detectedAccounts.push({ accountNumber: null, accountName: 'Compte courant', rawLine: '' });
        }

        const supabase = createAdminClient();

        let accounts: Account[];

        if (confirmedAccounts) {
            console.log('Confirmed accounts:', JSON.stringify(confirmedAccounts));
            accounts = await Promise.all(
                confirmedAccounts.map((acc: { accountNumber: string | null; accountName: string }) =>
                    getOrCreateAccount(supabase, session.user.id, acc.accountNumber, acc.accountName),
                ),
            );
        } else {
            const accountChecks = await checkAccountsExist(supabase, session.user.id, detectedAccounts);
            console.log('Account checks:', JSON.stringify(accountChecks));
            const hasNewAccounts = accountChecks.some((acc) => !acc.exists);

            if (hasNewAccounts) {
                console.log('Returning needsConfirmation');
                return NextResponse.json({
                    needsConfirmation: true,
                    accounts: accountChecks,
                });
            }

            accounts = await Promise.all(
                accountChecks.map((acc) =>
                    getOrCreateAccount(supabase, session.user.id, acc.accountNumber, acc.accountName),
                ),
            );
        }

        console.log('Using accounts:', JSON.stringify(accounts));

        const transactions: Array<{
            user_id: string;
            source_type: string;
            source_id: string;
            amount: number;
            date: string;
            description: string;
            name: string;
            category: string | null;
            account_id: string;
        }> = [];

        let headerRowIndex = -1;
        let dateCol = -1;
        let libelleCol = -1;
        let debitCol = -1;
        let creditCol = -1;

        console.log('Looking for header in first 15 lines...');
        for (let i = 0; i < Math.min(lines.length, 15); i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const headers = line.split(';').map((h) => removeDiacritics(h.trim().replace(/"/g, '').toLowerCase()));
            console.log(`Line ${i}:`, headers);

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
                console.log(
                    `Found header at line ${i}: dateCol=${dateCol}, libelleCol=${libelleCol}, debitCol=${debitCol}, creditCol=${creditCol}`,
                );
                break;
            }
        }

        if (headerRowIndex === -1) {
            console.error('Header not found');
            return NextResponse.json({ error: 'Header row not found. Format not recognized.' }, { status: 400 });
        }

        console.log(`Parsing transactions from line ${headerRowIndex + 1} to ${lines.length}`);

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
                        const parsedDate = parseDate(currentTransaction.date);
                        const transactionId = generateSourceId(
                            accounts[0].id,
                            parsedDate,
                            amount,
                            currentTransaction.libelle,
                        );
                        transactions.push({
                            user_id: session.user.id,
                            source_type: 'csv',
                            source_id: transactionId,
                            amount,
                            date: parsedDate,
                            description: currentTransaction.libelle,
                            name: currentTransaction.libelle,
                            category: null,
                            account_id: accounts[0].id,
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
                const parsedDate = parseDate(currentTransaction.date);
                const transactionId = generateSourceId(accounts[0].id, parsedDate, amount, currentTransaction.libelle);
                transactions.push({
                    user_id: session.user.id,
                    source_type: 'csv',
                    source_id: transactionId,
                    amount,
                    date: parsedDate,
                    description: currentTransaction.libelle,
                    name: currentTransaction.libelle,
                    category: null,
                    account_id: accounts[0].id,
                });
            }
        }

        if (transactions.length === 0) {
            console.error('No transactions parsed');
            return NextResponse.json({ error: 'No valid transactions found' }, { status: 400 });
        }

        console.log(`Parsed ${transactions.length} transactions`);

        const { error: upsertError } = await supabase.from('transactions').upsert(transactions, {
            onConflict: 'source_id',
            ignoreDuplicates: true,
        });

        if (upsertError) {
            console.error('Error importing transactions:', upsertError);
            return NextResponse.json({ error: 'Failed to import transactions' }, { status: 500 });
        }

        const now = new Date();
        await supabase.from('users').update({ last_csv_import: now.toISOString() }).eq('id', session.user.id);

        return NextResponse.json({ success: true, count: transactions.length, lastImport: now.toISOString() });
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
