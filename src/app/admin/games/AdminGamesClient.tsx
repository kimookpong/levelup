'use client';

import { useState } from 'react';
import { Game } from '@prisma/client';
import { createGame, updateGame, deleteGame, toggleGameStatus } from '@/actions/games';
import { FaEdit, FaTrash, FaPlus, FaGamepad, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import Image from 'next/image';

interface AdminGamesClientProps {
    initialGames: Game[];
}

export default function AdminGamesClient({ initialGames }: AdminGamesClientProps) {
    const [games, setGames] = useState<Game[]>(initialGames);
    const [loading, setLoading] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        image_url: '',
        active: true
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading('submit');

        if (editingGame) {
            const res = await updateGame(editingGame.id, formData);
            if (res.data) {
                setGames(games.map(g => g.id === editingGame.id ? res.data : g));
                setIsModalOpen(false);
                resetForm();
            } else {
                alert('Updated failed: ' + res.error);
            }
        } else {
            const res = await createGame(formData);
            if (res.data) {
                setGames([res.data, ...games]);
                setIsModalOpen(false);
                resetForm();
            } else {
                alert('Create failed: ' + res.error);
            }
        }
        setLoading(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this game?')) return;
        setLoading(id);
        const res = await deleteGame(id);
        if (!res.error) {
            setGames(games.filter(g => g.id !== id));
        } else {
            alert('Delete failed: ' + res.error);
        }
        setLoading(null);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        setLoading(id);
        const res = await toggleGameStatus(id, currentStatus);
        if (!res.error) {
            setGames(games.map(g => g.id === id ? { ...g, active: !currentStatus } : g));
        }
        setLoading(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white hidden md:block">รายการเกม</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                    <FaPlus /> เพิ่มเกมใหม่
                </button>
            </div>

            <div className="bg-[#1a1b26] rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left bg-[#1a1b26]">
                        <thead className="bg-black/20 text-gray-400 text-sm">
                            <tr>
                                <th className="p-4 min-w-[80px]">Image</th>
                                <th className="p-4 min-w-[150px]">Game Name</th>
                                <th className="p-4 min-w-[120px]">Slug</th>
                                <th className="p-4">Active</th>
                                <th className="p-4 text-right min-w-[120px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {games.map((game) => (
                                <tr key={game.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 relative border border-white/10">
                                            {game.image_url ? (
                                                <Image src={game.image_url} alt={game.name} fill className="object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-500"><FaGamepad /></div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-white">{game.name}</td>
                                    <td className="p-4 text-gray-400 font-mono text-xs">{game.slug}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleToggle(game.id, game.active)}
                                            disabled={loading === game.id}
                                            className={`text-2xl transition-colors ${game.active ? 'text-emerald-500' : 'text-gray-600'}`}
                                        >
                                            {game.active ? <FaToggleOn /> : <FaToggleOff />}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleOpenModal(game)}
                                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(game.id)}
                                            disabled={loading === game.id}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {games.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No games found.</div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a1b26] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">{editingGame ? 'แก้ไขเกม' : 'เพิ่มเกมใหม่'}</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Game Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Slug (URL Path)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === 'submit'}
                                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/20"
                                >
                                    {loading === 'submit' ? 'Saving...' : 'Save Game'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
