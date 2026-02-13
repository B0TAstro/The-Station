import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    providers: [],
    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60,
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
            const isPublicAsset =
                nextUrl.pathname.startsWith('/api/') ||
                nextUrl.pathname.startsWith('/_next/') ||
                nextUrl.pathname.includes('.');

            if (isOnAuthPage) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
                return true;
            }
            if (isLoggedIn) return true;
            if (isPublicAsset) return true;

            return false;
        },
    },
} satisfies NextAuthConfig;
