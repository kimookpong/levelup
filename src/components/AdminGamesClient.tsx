'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck } from 'react-icons/fa';

interface Game {
    id: string;
    name: string;
    slug: string;
    image_url: string;
    active: boolean;
}

interface AdminGamesClientProps {
    initialGames: Game[];
}

export default function AdminGamesClient({ initialGames }: AdminGamesClientProps) {
    const [games, setGames] = useState<Game[]>(initialGames);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        image_url: '',
        active: true
    });
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setFormData({ name: '', slug: '', image_url: '', active: true });
        setEditingGame(null);
    };

    const handleOpenModal = (game?: Game) => {
        if (game) {
            setEditingGame(game);
            setFormData({
                name: game.name,
                slug: game.slug,
                image_url: game.image_url,
                active: game.active
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { data, error } = await supabase
                .from('games')
                .update({ active: !currentStatus })
                .eq('id', id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error('ไม่สามารถบันทึกข้อมูลได้ (Permission Denied หรือไม่พบข้อมูล)');
            }

            setGames(games.map(g => g.id === id ? { ...g, active: !currentStatus } : g));
        } catch (error: any) {
            console.error('Error toggling status:', error);
            alert(`เกิดข้อผิดพลาดในการเปลี่ยนสถานะ: ${error.message || error}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบเกมนี้?')) return;

        try {
            const { data, error } = await supabase
                .from('games')
                .delete()
                .eq('id', id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error('ไม่สามารถลบข้อมูลได้ (Permission Denied หรือไม่พบข้อมูล)');
            }

            setGames(games.filter(g => g.id !== id));
        } catch (error: any) {
            console.error('Error deleting game:', error);
            alert(`เกิดข้อผิดพลาดในการลบเกม: ${error.message || error}`);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingGame) {
                // Update
                const { data, error } = await supabase
                    .from('games')
                    .update(formData)
                    .eq('id', editingGame.id)
                    .select()
                    .single();

                if (error) throw error;

                setGames(games.map(g => g.id === editingGame.id ? data : g));
            } else {
                // Insert
                const { data, error } = await supabase
                    .from('games')
                    .insert([formData])
                    .select()
                    .single();

                if (error) throw error;

                setGames([data, ...games]);
            }
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving game:', error);
            alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message || error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2">จัดการเกม</h1>
                    <p className="text-gray-400">เพิ่ม แก้ไข หรือลบเกมออกจากระบบ</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,85,0.4)]"
                >
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
                        {games.map((game) => (
                            <tr key={game.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-6">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                                        <Image
                                            src={game.image_url}
                                            alt={game.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </td>
                                <td className="p-6 font-medium text-lg">{game.name}</td>
                                <td className="p-6 text-gray-400 font-mono text-sm">{game.slug}</td>
                                <td className="p-6">
                                    <button
                                        onClick={() => handleToggleStatus(game.id, game.active)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black ${game.active ? 'bg-green-500' : 'bg-gray-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${game.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </td>
                                <td className="p-6 text-right space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(game)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(game.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {games.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-500">
                                    ไม่พบข้อมูลเกม
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a1b26] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-scale-in">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <FaTimes />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6">
                            {editingGame ? 'แก้ไขเกม' : 'เพิ่มเกมใหม่'}
                        </h2>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">ชื่อเกม</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">รูปภาพ URL</label>
                                {(formData.image_url.startsWith('http') || formData.image_url.startsWith('/')) && (
                                    <div className="mb-4 relative aspect-[2/3] h-[200px] rounded-xl overflow-hidden border border-white/10 bg-black/50">
                                        <Image
                                            src={formData.image_url}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                                    required
                                />

                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-primary hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
