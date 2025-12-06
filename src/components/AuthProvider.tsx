'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Function to fetch user role with retry
        const fetchUserRole = async (userId: string, retryCount = 0): Promise<void> => {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user role:', error);
                // Retry up to 3 times with delay (in case of race condition with auth callback)
                if (retryCount < 3) {
                    console.log(`Retrying fetch user role... attempt ${retryCount + 1}`);
                    setTimeout(() => fetchUserRole(userId, retryCount + 1), 500);
                }
            } else {
                console.log('User role:', data?.role);
                setIsAdmin(data?.role === 'admin');
            }
        };

        // Check initial session
        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                await fetchUserRole(session.user.id);
            }
            setLoading(false);
        };

        checkInitialSession();

        // Listen to auth changes - THIS RUNS GLOBALLY NOW
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event (global):', event);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Add delay for SIGNED_IN event to allow callback to complete upsert
                if (event === 'SIGNED_IN') {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                await fetchUserRole(session.user.id);
            } else {
                setIsAdmin(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
