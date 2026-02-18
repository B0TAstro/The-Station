import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { exchangeToken } from '@/lib/server/true-layer';
import { createAdminClient } from '@/lib/server/supabase-admin';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const _state = searchParams.get('state');

        if (!code) {
            return NextResponse.redirect(new URL('/budget?error=no_code', request.url));
        }

        const { accessToken, refreshToken, userId } = await exchangeToken(code);

        const supabase = createAdminClient();

        const { error: insertError } = await supabase.from('plaid_items').insert([
            {
                user_id: session.user.id,
                access_token: accessToken,
                refresh_token: refreshToken,
                item_id: userId,
                institution_name: 'Bank',
                status: 'active',
            },
        ]);

        if (insertError) {
            console.error('Error inserting true layer item:', insertError);
            return NextResponse.redirect(new URL('/budget?error=insert_failed', request.url));
        }

        return NextResponse.redirect(new URL('/budget?connected=true', request.url));
    } catch (err) {
        console.error('TrueLayer callback error:', err);
        return NextResponse.redirect(new URL('/budget?error=callback_failed', request.url));
    }
}
