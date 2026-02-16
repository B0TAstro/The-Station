import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            pseudo?: string;
            avatar_url?: string;
        } & DefaultSession['user'];
    }

    interface User {
        pseudo?: string;
        avatar_url?: string;
    }
}
