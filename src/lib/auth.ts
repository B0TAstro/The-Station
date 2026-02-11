import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

// Whitelist of allowed emails
const ALLOWED_EMAILS = process.env.ALLOWED_EMAIL?.split(',') || [];

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        Credentials({
            name: 'Email',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                // Check whitelist
                if (!ALLOWED_EMAILS.includes(email)) {
                    throw new Error('Email not authorized');
                }

                // For demo purposes - in production, verify against Supabase
                // This is a simple check, you should implement proper password hashing
                if (password === process.env.AUTH_PASSWORD) {
                    return {
                        id: '1',
                        email: email,
                        name: email.split('@')[0],
                    };
                }

                throw new Error('Invalid credentials');
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            const email = user.email;

            // Check whitelist for OAuth providers
            if (email && ALLOWED_EMAILS.includes(email)) {
                return true;
            }

            return false;
        },
        async session({ session, token }) {
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
    },
});
