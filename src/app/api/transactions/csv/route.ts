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
    accountType: string = 'courant',
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
            account_type: accountType,
            account_number: accountNumber,
            account_name: accountName,
            source_type: 'csv',
        })
        .select()
        .single();

    if (error) throw new Error('Failed to create account');
    return newAccount;
}

interface ParsedTransaction {
    date: string;
    description: string;
    amount: number;
}

interface AccountTransactions {
    accountNumber: string;
    transactions: ParsedTransaction[];
}

function parseAllTransactionsFromCSV(lines: string[], accountMap: Map<string, Account>): AccountTransactions[] {
    const results: AccountTransactions[] = [];
    // If there's only one account, use it as default fallback
    const uniqueAccounts = [...new Set(accountMap.values())];
    let currentAccountNumber: string | null =
        uniqueAccounts.length === 1 ? uniqueAccounts[0].account_number || uniqueAccounts[0].account_name || null : null;
    let headerRowIndex = -1;
    let dateCol = -1;
    let libelleCol = -1;
    let debitCol = -1;
    let creditCol = -1;
    let inTransactionSection = false;
    let pendingLine = '';
    let inQuotes = false;

    console.log('Starting CSV parsing, total lines:', lines.length);
    console.log('Account map keys:', Array.from(accountMap.keys()));
    console.log('Default account:', currentAccountNumber);

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        let line = rawLine.trim();

        if (!line) {
            continue;
        }

        for (let j = 0; j < line.length; j++) {
            if (line[j] === '"' && (j === 0 || line[j - 1] !== '\\')) {
                inQuotes = !inQuotes;
            }
        }

        if (inQuotes || pendingLine) {
            pendingLine += ' ' + line;
            continue;
        }

        if (pendingLine) {
            line = pendingLine + ' ' + line;
            pendingLine = '';
        }

        const carteMatch = line.match(/(.+?)\s*carte\s*n°\s*(\d+)/i);
        if (carteMatch) {
            console.log(`Line ${i}: Found account header: ${carteMatch[1]} n° ${carteMatch[2]}`);
            if (currentAccountNumber && currentAccountNumber !== carteMatch[2]) {
                inTransactionSection = false;
            }
            currentAccountNumber = carteMatch[2];
            headerRowIndex = -1;
            inTransactionSection = false;
            console.log(`  -> Current account set to: ${currentAccountNumber}`);
            continue;
        }

        if (line.includes('Livret') || line.includes('LEP') || line.includes('CEL') || line.includes('PEL')) {
            console.log(`Line ${i}: Found Livret: ${line}`);
            if (currentAccountNumber) {
                inTransactionSection = false;
            }
            currentAccountNumber = line.replace(/["']/g, '').trim();
            console.log(`  -> Current account set to (livret name): ${currentAccountNumber}`);
            headerRowIndex = -1;
            inTransactionSection = false;
            continue;
        }

        if (line.includes('Aucune opération') || line.includes('Aucune operation')) {
            console.log(`Line ${i}: Found 'Aucune operation'`);
            if (currentAccountNumber) {
                results.push({
                    accountNumber: currentAccountNumber,
                    transactions: [],
                });
            }
            currentAccountNumber = null;
            inTransactionSection = false;
            continue;
        }

        const cols = line.split(';').map((c) => c.trim());
        const headers = cols.map((h) => removeDiacritics(h.replace(/"/g, '').toLowerCase()));

        if (
            headers[0]?.includes('date') ||
            (headers[1] && headers[1].includes('lib')) ||
            headers.some((h) => h.includes('debit') || h.includes('credit'))
        ) {
            console.log(`Line ${i}: Found header row:`, headers);
            headerRowIndex = i;
            dateCol = -1;
            libelleCol = -1;
            debitCol = -1;
            creditCol = -1;
            headers.forEach((h, idx) => {
                if (h.includes('date')) dateCol = idx;
                if (h.includes('libelle')) libelleCol = idx;
                if (h.includes('debit')) debitCol = idx;
                if (h.includes('credit')) creditCol = idx;
            });
            console.log(
                `  -> dateCol=${dateCol}, libelleCol=${libelleCol}, debitCol=${debitCol}, creditCol=${creditCol}`,
            );
            inTransactionSection = true;
            console.log(`  -> inTransactionSection=true, currentAccountNumber=${currentAccountNumber}`);
            continue;
        }

        if (inTransactionSection && headerRowIndex !== -1 && currentAccountNumber) {
            if (cols.length >= 2 && dateCol >= 0 && cols[dateCol] && /^\d{2}\/\d{2}\/\d{4}$/.test(cols[dateCol])) {
                const date = cols[dateCol];
                const debitRaw = debitCol >= 0 && cols[debitCol] ? cols[debitCol] : '';
                const creditRaw = creditCol >= 0 && cols[creditCol] ? cols[creditCol] : '';
                const debit = parseFrenchNumber(debitRaw);
                const credit = parseFrenchNumber(creditRaw);
                let libelle = libelleCol >= 0 && cols[libelleCol] ? cols[libelleCol] : '';
                libelle = libelle.replace(/^"|"$/g, '').replace(/""/g, '"').replace(/\s+/g, ' ').trim();

                console.log(
                    `Line ${i}: Transaction: date=${date}, debitRaw="${debitRaw}", creditRaw="${creditRaw}", libelle=${libelle.substring(0, 30)}...`,
                );

                if (libelle) {
                    const amount = credit > 0 ? credit : -Math.abs(debit);
                    console.log(`  -> Amount calculated: ${amount} (credit=${credit}, debit=${debit})`);

                    if (amount !== 0) {
                        const existing = results.find((r) => r.accountNumber === currentAccountNumber);
                        console.log(`  -> Adding transaction: amount=${amount}`);

                        if (existing) {
                            existing.transactions.push({
                                date: parseDate(date),
                                description: libelle,
                                amount,
                            });
                        } else {
                            results.push({
                                accountNumber: currentAccountNumber,
                                transactions: [
                                    {
                                        date: parseDate(date),
                                        description: libelle,
                                        amount,
                                    },
                                ],
                            });
                        }
                    }
                }
            }
        }
    }

    console.log('Final parsed results:', JSON.stringify(results));
    return results;
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

        function splitCSVLines(text: string): string[] {
            const lines: string[] = [];
            let currentLine = '';
            let inQuotes = false;

            for (let i = 0; i < text.length; i++) {
                const char = text[i];

                if (char === '"') {
                    inQuotes = !inQuotes;
                    currentLine += char;
                } else if (char === '\n' && !inQuotes) {
                    if (currentLine.trim()) {
                        lines.push(currentLine);
                    }
                    currentLine = '';
                } else if (char !== '\r') {
                    currentLine += char;
                }
            }

            if (currentLine.trim()) {
                lines.push(currentLine);
            }

            return lines;
        }

        const lines = splitCSVLines(utf8Text);
        console.log('Split into', lines.length, 'lines');

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
                confirmedAccounts.map(
                    (acc: { accountNumber: string | null; accountName: string; accountType: string }) =>
                        getOrCreateAccount(
                            supabase,
                            session.user.id,
                            acc.accountNumber,
                            acc.accountName,
                            acc.accountType,
                        ),
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
                    getOrCreateAccount(supabase, session.user.id, acc.accountNumber, acc.accountName, 'courant'),
                ),
            );
        }

        console.log('Using accounts:', JSON.stringify(accounts));

        // Generate one source_id per import batch
        const now = new Date();
        const importId = `csv_${now.toISOString()}`;

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

        const accountMap = new Map<string, Account>();
        for (const acc of accounts) {
            if (acc.account_number) {
                accountMap.set(acc.account_number, acc);
            }
            if (acc.account_name) {
                accountMap.set(acc.account_name, acc);
            }
        }

        const parsedData = parseAllTransactionsFromCSV(lines, accountMap);

        console.log('Parsed data:', JSON.stringify(parsedData));

        for (const accountData of parsedData) {
            const account = accountMap.get(accountData.accountNumber);
            if (!account) continue;

            for (const txn of accountData.transactions) {
                transactions.push({
                    user_id: session.user.id,
                    source_type: 'csv',
                    source_id: importId,
                    amount: txn.amount,
                    date: txn.date,
                    description: txn.description,
                    name: txn.description,
                    category: null,
                    account_id: account.id,
                });
            }
        }

        console.log(`Total transactions in array: ${transactions.length}`);

        if (transactions.length === 0) {
            console.error('No transactions parsed');
            return NextResponse.json({ error: 'No valid transactions found' }, { status: 400 });
        }

        console.log(`Checking for duplicates in database...`);

        // Dedup: check by account_id + date + amount + description (all four must match = AND)
        const accountIds = [...new Set(transactions.map((t) => t.account_id))];
        const { data: existingTxns } = await supabase
            .from('transactions')
            .select('account_id, date, amount, description')
            .eq('user_id', session.user.id)
            .in('account_id', accountIds);

        const existingSet = new Set(
            (existingTxns || []).map((t) => `${t.account_id}|${t.date}|${t.amount}|${t.description}`),
        );

        const newTransactions = transactions.filter((t) => {
            const key = `${t.account_id}|${t.date}|${t.amount}|${t.description}`;
            return !existingSet.has(key);
        });

        console.log(`Found ${existingSet.size} existing transactions, ${newTransactions.length} new transactions`);

        if (newTransactions.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                message: 'All transactions already exist',
            });
        }

        console.log(`Sending ${newTransactions.length} new transactions to Supabase`);

        const { error: upsertError } = await supabase.from('transactions').insert(newTransactions);

        if (upsertError) {
            console.error('Error importing transactions:', upsertError);
            return NextResponse.json({ error: 'Failed to import transactions' }, { status: 500 });
        }

        await supabase.from('users').update({ last_csv_import: now.toISOString() }).eq('id', session.user.id);

        return NextResponse.json({ success: true, count: newTransactions.length, lastImport: now.toISOString() });
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

function parseFrenchNumber(value: string | undefined): number {
    if (!value || !value.trim()) return 0;
    const cleaned = value.trim().replace(/\s/g, '').replace(',', '.');
    const result = parseFloat(cleaned);
    return isNaN(result) ? 0 : result;
}
