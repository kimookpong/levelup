'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import { updateUserRole, deleteUser } from '@/actions/users';
import { FaEdit, FaTrash, FaUserShield, FaUser } from 'react-icons/fa';
import Image from 'next/image';

interface AdminUsersClientProps {
    initialUsers: User[];
}

export default function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [loading, setLoading] = useState<string | null>(null);

    const handleRoleUpdate = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Are you sure you want to change role to ${newRole}?`)) return;

        setLoading(userId);
        const res = await updateUserRole(userId, newRole);
        if (res.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } else {
            alert('Failed to update role');
        }
        setLoading(null);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setLoading(userId);
        const res = await deleteUser(userId);
        if (res.success) {
            setUsers(users.filter(u => u.id !== userId));
        } else {
            alert('Failed to delete user');
        }
        setLoading(null);
    };

    return (
        <div className="bg-[#1a1b26] rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-black/20 text-gray-400 text-sm">
                    <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Joined</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {users.map((user) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 relative">
                                    {user.image ? (
                                        <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <FaUser />
                                        </div>
                                    )}
                                </div>
                                <span className="font-medium text-white">{user.name || 'Unknown'}</span>
                            </td>
                            <td className="p-4 text-gray-300">{user.email}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin'
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                    }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="p-4 text-gray-400">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right space-x-2">
                                <button
                                    onClick={() => handleRoleUpdate(user.id, user.role)}
                                    disabled={loading === user.id}
                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                                    title="Toggle Role"
                                >
                                    <FaUserShield />
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    disabled={loading === user.id}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                    title="Delete User"
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {users.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    No users found.
                </div>
            )}
        </div>
    );
}
