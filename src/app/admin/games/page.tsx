import { createServerClient } from '@/lib/supabase/server';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

export default async function AdminGames() {
    const supabase = await createServerClient();
    const { data: games } = await supabase.from('games').select('*').order('created_at', { ascending: false });

    return (
        <div>
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2">จัดการเกม</h1>
                    <p className="text-gray-400">เพิ่ม แก้ไข หรือลบเกมออกจากระบบ</p>
                </div>
                <button className="flex items-center gap-2 bg-primary hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,85,0.4)]">
                    <FaPlus />
                    เพิ่มเกม
                </button>
            </div>

            <div className="glass rounded-3xl overflow-hidden animate-fade-in-up shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">รูปปก</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">ชื่อเกม</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">Slug</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">สถานะ</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {games?.map((game) => (
                            <tr key={game.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-6">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                                        <img src={game.image_url} alt={game.name} className="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td className="p-6 font-medium text-lg">{game.name}</td>
                                <td className="p-6 text-gray-400 font-mono text-sm">{game.slug}</td>
                                <td className="p-6">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${game.active
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${game.active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                        {game.active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                    </span>
                                </td>
                                <td className="p-6 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                                        <FaEdit />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {(!games || games.length === 0) && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-500">
                                    ไม่พบข้อมูลเกม
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
