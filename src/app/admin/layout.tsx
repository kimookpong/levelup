import { redirect } from 'next/navigation';
import AdminLayoutClient from '@/components/AdminLayoutClient';
import { auth } from '@/auth';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    // @ts-ignore
    const role = session?.user?.role;

    if (role !== 'admin') {
        redirect('/');
    }

    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
