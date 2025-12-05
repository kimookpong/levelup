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

    // Check if user is admin
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (userData?.role !== 'admin') {
        redirect('/');
    }

    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

