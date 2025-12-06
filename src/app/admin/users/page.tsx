import { getUsers } from '@/actions/users';
import AdminUsersClient from './AdminUsersClient';

export default async function AdminUsers() {
    const { data: users, error } = await getUsers();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">จัดการผู้ใช้งาน (User Management)</h1>
            {error ? (
                <div className="text-red-500">Error loading users: {error}</div>
            ) : (
                <AdminUsersClient initialUsers={users || []} />
            )}
        </div>
    );
}
