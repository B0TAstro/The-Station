import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAuthUrl } from '@/lib/server/true-layer';

export async function POST(_request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const authUrl = createAuthUrl();

        console.log('TrueLayer auth URL:', authUrl);

        return NextResponse.json({ authUrl });
    } catch (err) {
        console.error('Error creating auth URL:', err);
        console.error('Env vars:', {
            clientId: process.env.TRUELAYER_CLIENT_ID ? 'set' : 'MISSING',
            clientSecret: process.env.TRUELAYER_CLIENT_SECRET ? 'set' : 'MISSING',
            env: process.env.TRUELAYER_ENV,
            authUrl: process.env.AUTH_URL,
        });
        return NextResponse.json({ error: 'Failed to create auth URL' }, { status: 500 });
    }
}
