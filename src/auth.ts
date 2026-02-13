import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Google,
        GitHub,
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
                    throw new Error('Trop de tentatives. Réessayez dans quelques minutes.');
                }

                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const supabase = createAdminClient();

                    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();

                    if (error || !user) {
                        return null;
                    }

                    if (!user.authorized) {
                        throw new Error('Compte en attente de validation.');
                    }

                    const bcrypt = await import('bcryptjs');
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.pseudo || user.nom,
                            email: user.email,
                            image: null,
                        };
                    }
                }
                return null;
            },
        }),
    ],
});
