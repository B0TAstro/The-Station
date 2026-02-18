import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            pseudo?: string;
            prenom?: string;
            nom?: string;
            avatar_url?: string;
        } & DefaultSession['user'];
    }

    interface User {
        pseudo?: string;
        prenom?: string;
        nom?: string;
        avatar_url?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        pseudo?: string;
        prenom?: string;
        nom?: string;
        avatar_url?: string;
    }
}
