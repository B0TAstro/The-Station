import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { getAccounts, getAccountTransactions, refreshAccessToken } from '@/lib/server/true-layer';
import { createAdminClient } from '@/lib/server/supabase-admin';

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const force = searchParams.get('force') === 'true';

        const supabase = createAdminClient();

        const { data: plaidItems, error: itemsError } = await supabase
            .from('plaid_items')
            .select('*')
            .eq('user_id', session.user.id);

        if (itemsError) {
            console.error('Error fetching true layer items:', itemsError);
            return NextResponse.json({ error: 'Failed to fetch true layer items' }, { status: 500 });
        }

        if (!plaidItems || plaidItems.length === 0) {
            return NextResponse.json({ transactions: [] });
        }

        const cookieStore = await cookies();
        const lastSyncCookie = cookieStore.get('last_sync');
        const today = formatDate(new Date());

        const shouldFetch = force || !lastSyncCookie || lastSyncCookie.value !== today;

        if (shouldFetch) {
            for (const item of plaidItems) {
                try {
                    let accessToken = item.access_token;

                    if (item.refresh_token) {
                        try {
                            accessToken = await refreshAccessToken(item.refresh_token);

                            await supabase.from('plaid_items').update({ access_token: accessToken }).eq('id', item.id);
                        } catch (refreshError) {
                            console.error('Error refreshing token:', refreshError);
                        }
                    }

                    const accounts = await getAccounts(accessToken);

                    for (const account of accounts) {
                        const transactions = await getAccountTransactions(accessToken, account.account_id);

                        if (transactions && transactions.length > 0) {
                            const transactionsToInsert = transactions.map(
                                (txn: {
                                    transaction_id: string;
                                    account_id: string;
                                    amount: number;
                                    timestamp: string;
                                    description: string;
                                    merchant_name?: string | null;
                                    category?: string[] | null;
                                }) => ({
                                    user_id: session.user.id,
                                    plaid_transaction_id: txn.transaction_id,
                                    plaid_item_id: item.id,
                                    account_id: txn.account_id,
                                    amount: txn.amount,
                                    date: txn.timestamp.split('T')[0],
                                    name: txn.description,
                                    merchant_name: txn.merchant_name || null,
                                    category: txn.category || null,
                                }),
                            );

                            const { error: upsertError } = await supabase
                                .from('transactions')
                                .upsert(transactionsToInsert, {
                                    onConflict: 'plaid_transaction_id',
                                    ignoreDuplicates: true,
                                });

                            if (upsertError) {
                                console.error('Error upserting transactions:', upsertError);
                            }
                        }
                    }
                } catch (fetchError) {
                    console.error('Error fetching transactions for item:', item.id, fetchError);
                }
            }

            const response = NextResponse.next();
            response.cookies.set('last_sync', today, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30,
            });
        }

        const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: false });

        if (transactionsError) {
            console.error('Error fetching transactions:', transactionsError);
            return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
        }

        return NextResponse.json({ transactions: transactions || [] });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
