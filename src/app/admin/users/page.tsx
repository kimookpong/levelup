import { createServerClient } from '@/lib/supabase/server';
import { FaUserShield, FaUser } from 'react-icons/fa';

export default async function AdminUsers() {
    const supabase = await createServerClient();
    const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false });

    return (
        <div>
            <div className="mb-8 animate-fade-in">
                <h1 className="text-4xl font-display font-bold text-white mb-2">จัดการผู้ใช้งาน</h1>
                <p className="text-gray-400">ดูรายชื่อและจัดการสิทธิ์ผู้ใช้งาน</p>
            </div>

            <div className="glass rounded-3xl overflow-hidden animate-fade-in-up shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">ผู้ใช้งาน</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">อีเมล</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">บทบาท</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">วันที่สมัคร</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users?.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center border border-white/10">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FaUser className="text-gray-400" />
                                            )}
                                        </div>
                                        <span className="font-medium text-white">{user.full_name || 'ไม่ระบุชื่อ'}</span>
                                    </div>
                                </td>
                                <td className="p-6 text-gray-300">{user.email}</td>
                                <td className="p-6">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'admin'
                                        ? 'bg-primary/10 text-primary border-primary/20'
                                        : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        }`}>
                                        {user.role === 'admin' ? <FaUserShield /> : <FaUser />}
                                        {user.role === 'admin' ? 'Admin' : 'User'}
                                    </span>
                                </td>
                                <td className="p-6 text-gray-400 text-sm">
                                    {new Date(user.created_at).toLocaleDateString('th-TH')}
                                </td>
                                <td className="p-6 text-right">
                                    {/* Add client component button here for toggling role if needed */}
                                    <button className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                                        เปลี่ยนสิทธิ์
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
