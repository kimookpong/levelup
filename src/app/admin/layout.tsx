import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';

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

    console.log(userData, user.id);

    if (userData?.role !== 'admin') {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white">
            <Navbar />
            <AdminSidebar />
            <main className="ml-64 pt-28 px-8 pb-12">
                {children}
            </main>
        </div>
    );
}
