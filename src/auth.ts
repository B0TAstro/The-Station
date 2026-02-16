import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

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

                    console.log('🔍 User data from DB:', {
                        id: user?.id,
                        pseudo: user?.pseudo,
                        avatar_url: user?.avatar_url,
                    });

                    if (error || !user) {
                        return null;
                    }

                    if (!user.authorized) {
                        throw new Error('Compte en attente de validation.');
                    }

                    const bcrypt = await import('bcryptjs');
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) {
                        const userObj = {
                            id: user.id,
                            name: user.pseudo || user.nom,
                            email: user.email,
                            image: user.avatar_url || null,
                            avatar_url: user.avatar_url || null,
                        };
                        console.log('✅ Returning user object:', userObj);
                        return userObj;
                    }
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
                token.avatar_url = user.avatar_url || null;
                console.log('🔑 JWT token updated:', {
                    id: token.id,
                    pseudo: token.pseudo,
                    avatar_url: token.avatar_url,
                });
            }
            return token;
        },
    },
});
