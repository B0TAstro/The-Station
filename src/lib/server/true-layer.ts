const BASE_URL =
    process.env.TRUELAYER_ENV === 'production' ? 'https://api.truelayer.com' : 'https://api.truelayer-sandbox.com';

const AUTH_URL =
    process.env.TRUELAYER_ENV === 'production' ? 'https://auth.truelayer.com' : 'https://auth.truelayer-sandbox.com';

const APP_URL = process.env.AUTH_URL || 'http://localhost:3000';
const REDIRECT_URI = `${APP_URL}/api/transactions/true-layer/callback`;

function generateState(): string {
    return Math.random().toString(36).substring(2, 15);
}

export function createAuthUrl(): string {
    const state = generateState();
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.TRUELAYER_CLIENT_ID || '',
        redirect_uri: REDIRECT_URI,
        scope: 'accounts transactions',
        state,
    });

    return `${AUTH_URL}/?${params.toString()}`;
}

export async function exchangeToken(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    userId: string;
}> {
    const credentials = Buffer.from(
        `${process.env.TRUELAYER_CLIENT_ID}:${process.env.TRUELAYER_CLIENT_SECRET}`,
    ).toString('base64');

    const response = await fetch(`${AUTH_URL}/token/connect`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('TrueLayer exchange error:', error);
        throw new Error('Failed to exchange token');
    }

    const data = await response.json();
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        userId: data.user_id,
    };
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
    const credentials = Buffer.from(
        `${process.env.TRUELAYER_CLIENT_ID}:${process.env.TRUELAYER_CLIENT_SECRET}`,
    ).toString('base64');

    const response = await fetch(`${AUTH_URL}/token/connect`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return data.access_token;
}

export async function getAccounts(accessToken: string) {
    const response = await fetch(`${BASE_URL}/data/v1/accounts`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('TrueLayer get accounts error:', error);
        throw new Error('Failed to get accounts');
    }

    const data = await response.json();
    return data.results;
}

export async function getAccountTransactions(accessToken: string, accountId: string) {
    const response = await fetch(`${BASE_URL}/data/v1/accounts/${accountId}/transactions`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('TrueLayer get transactions error:', error);
        throw new Error('Failed to get transactions');
    }

    const data = await response.json();
    return data.results;
}

export async function getAccountBalance(accessToken: string, accountId: string) {
    const response = await fetch(`${BASE_URL}/data/v1/accounts/${accountId}/balance`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('TrueLayer get balance error:', error);
        throw new Error('Failed to get balance');
    }

    const data = await response.json();
    return data.results;
}
