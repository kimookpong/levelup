import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminLayoutClient from '@/components/AdminLayoutClient';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check if user is admin with retry (in case of race condition with auth callback)
    let isAdmin = false;
    let retries = 3;

    while (retries > 0 && !isAdmin) {
        const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!error && userData?.role === 'admin') {
            isAdmin = true;
        } else if (retries > 1) {
            // Wait 300ms before retry
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        retries--;
    }

    if (!isAdmin) {
        redirect('/');
    }

    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

