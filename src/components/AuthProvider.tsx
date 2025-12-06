'use client';

import { createContext, useContext, ReactNode } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

interface AuthContextType {
    user: any | null; // Adapting to loose type for now, or use NextAuth User
    isAdmin: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    loading: true,
});

export const useAuth = () => {
    const { data: session, status } = useSession();
    const loading = status === 'loading';

    // Adapt NextAuth user to be usable similarly
    const user = session?.user || null;

    // @ts-ignore
    const isAdmin = user?.role === 'admin';

    // Map properties if needed by legacy code, or we update legacy code.
    // For now, let's just return the user, and we will update components to access user.image instead of user.user_metadata.avatar_url

    return { user, isAdmin, loading };
};

export default function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
}
