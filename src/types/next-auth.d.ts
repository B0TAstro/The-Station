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

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        pseudo?: string;
        avatar_url?: string;
    }
}
