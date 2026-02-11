'use server';

import { plaidClient } from './client';
import { CountryCode, Products } from 'plaid';

export async function createLinkToken(userId: string) {
    try {
        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: userId },
            client_name: 'The Station',
            products: [Products.Transactions],
            country_codes: [CountryCode.Fr],
            language: 'fr',
        });

        return { linkToken: response.data.link_token };
    } catch (error) {
        console.error('Error creating link token:', error);
        throw new Error('Failed to create link token');
    }
}

export async function exchangePublicToken(publicToken: string) {
    try {
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        return {
            accessToken: response.data.access_token,
            itemId: response.data.item_id,
        };
    } catch (error) {
        console.error('Error exchanging public token:', error);
        throw new Error('Failed to exchange public token');
    }
}

export async function getTransactions(accessToken: string, startDate: string, endDate: string) {
    try {
        const response = await plaidClient.transactionsGet({
            access_token: accessToken,
            start_date: startDate,
            end_date: endDate,
        });

        return {
            accounts: response.data.accounts,
            transactions: response.data.transactions,
        };
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
}

export async function getBalance(accessToken: string) {
    try {
        const response = await plaidClient.accountsBalanceGet({
            access_token: accessToken,
        });

        return { accounts: response.data.accounts };
    } catch (error) {
        console.error('Error fetching balance:', error);
        throw new Error('Failed to fetch balance');
    }
}
