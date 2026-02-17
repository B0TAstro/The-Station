import NextAuth, { CredentialsSignin } from 'next-auth';
import { authConfig } from './config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { createAdminClient } from '@/lib/server/supabase-admin';
import { rateLimit } from '@/lib/middleware/rate-limit';

class EmailNotFoundError extends CredentialsSignin {
    code = 'EMAIL_NOT_FOUND';
}
class UnauthorizedAccountError extends CredentialsSignin {
    code = 'UNAUTHORIZED_ACCOUNT';
}
class WrongPasswordError extends CredentialsSignin {
    code = 'WRONG_PASSWORD';
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials, request) {
                const ip =
                    (request?.headers as Headers)?.get?.('x-forwarded-for') ||
                    (request?.headers as Headers)?.get?.('x-real-ip') ||
                    'unknown';
                const limiter = rateLimit(`login:${ip}`, {
                    maxAttempts: 10,
                    windowMs: 5 * 60 * 1000,
                });

                if (!limiter.success) {
                    throw new Error('Trop de tentatives, réessayez plus tard !');
                }

                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const supabase = createAdminClient();

                    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();

                    if (error || !user) {
                        throw new EmailNotFoundError();
                    }

                    if (!user.authorized) {
                        throw new UnauthorizedAccountError();
                    }

                    const bcrypt = await import('bcryptjs');
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.pseudo || user.nom,
                            email: user.email,
                            image: user.avatar_url || null,
                            avatar_url: user.avatar_url || null,
                        };
                    }

                    throw new WrongPasswordError();
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.pseudo = user.name;
                token.avatar_url = (user as any).avatar_url || null;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.pseudo = token.pseudo as string;
                session.user.avatar_url = token.avatar_url as string | undefined;
            }
            return session;
        },
    },
});
