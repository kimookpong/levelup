'use client';

import { useState } from 'react';
import { Package, Game } from '@prisma/client';
import { createPackage, updatePackage, deletePackage } from '@/actions/packages';
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import Image from 'next/image';

interface AdminPackagesClientProps {
    initialPackages: (Package & { game: Game })[];
    games: Game[];
}

export default function AdminPackagesClient({ initialPackages, games }: AdminPackagesClientProps) {
    const [packages, setPackages] = useState(initialPackages);
    const [loading, setLoading] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        game_id: '',
        name: '',
        price: 0,
        currency: 'THB',
        bonus_details: '',
        active: true
    });

    const resetForm = () => {
        setFormData({
            game_id: games.length > 0 ? games[0].id : '',
            name: '',
            price: 0,
            currency: 'THB',
            bonus_details: '',
            active: true
        });
        setEditingPackage(null);
    };

    const handleOpenModal = (pkg?: Package) => {
        if (pkg) {
            setEditingPackage(pkg);
            setFormData({
                game_id: pkg.game_id,
                name: pkg.name,
                price: pkg.price,
                currency: pkg.currency,
                bonus_details: pkg.bonus_details || '',
                active: pkg.active
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading('submit');

        if (editingPackage) {
            const res = await updatePackage(editingPackage.id, formData);
            if (res.data) {
                // @ts-ignore
                setPackages(packages.map(p => p.id === editingPackage.id ? { ...res.data, game: games.find(g => g.id === res.data.game_id) } : p));
                setIsModalOpen(false);
                resetForm();
            } else {
                alert('Update failed: ' + res.error);
            }
        } else {
            const res = await createPackage(formData);
            if (res.data) {
                // @ts-ignore
                setPackages([{ ...res.data, game: games.find(g => g.id === res.data.game_id) }, ...packages]);
                setIsModalOpen(false);
                resetForm();
            } else {
                alert('Create failed: ' + res.error);
            }
        }
        setLoading(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this package?')) return;
        setLoading(id);
        const res = await deletePackage(id);
        if (!res.error) {
            setPackages(packages.filter(p => p.id !== id));
        } else {
            alert('Delete failed: ' + res.error);
        }
        setLoading(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white hidden md:block">รายการแพ็กเกจ</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                    <FaPlus /> เพิ่มแพ็กเกจ
                </button>
            </div>

            <div className="bg-[#1a1b26] rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left bg-[#1a1b26]">
                        <thead className="bg-black/20 text-gray-400 text-sm">
                            <tr>
                                <th className="p-4">Game</th>
                                <th className="p-4">Package Name</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Bonus</th>
                                <th className="p-4">Active</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {packages.map((pkg) => (
                                <tr key={pkg.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded overflow-hidden bg-gray-800 relative border border-white/10">
                                                {pkg.game?.image_url ? (
                                                    <Image src={pkg.game.image_url} alt={pkg.game.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-500 text-xs">{pkg.game?.name?.[0]}</div>
                                                )}
                                            </div>
                                            <span className="text-gray-400 text-xs hidden md:inline">{pkg.game?.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-white">{pkg.name}</td>
                                    <td className="p-4 text-emerald-400 font-bold">{pkg.price.toLocaleString()} {pkg.currency}</td>
                                    <td className="p-4 text-gray-400 text-xs max-w-[150px] truncate">{pkg.bonus_details || '-'}</td>
                                    <td className="p-4">
                                        <span className={`text-xl ${pkg.active ? 'text-emerald-500' : 'text-gray-600'}`}>
                                            {pkg.active ? <FaToggleOn /> : <FaToggleOff />}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleOpenModal(pkg)}
                                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pkg.id)}
                                            disabled={loading === pkg.id}
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
                {packages.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No packages found.</div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a1b26] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">{editingPackage ? 'แก้ไขแพ็กเกจ' : 'เพิ่มแพ็กเกจใหม่'}</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Select Game</label>
                                <select
                                    value={formData.game_id}
                                    onChange={e => setFormData({ ...formData, game_id: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                                    required
                                >
                                    <option value="" disabled>Select a game</option>
                                    {games.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Package Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                                    placeholder="e.g. 100 Points"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Price</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Currency</label>
                                    <input
                                        type="text"
                                        value={formData.currency}
                                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Bonus Details (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.bonus_details}
                                    onChange={e => setFormData({ ...formData, bonus_details: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                                    placeholder="e.g. +10 Bonus"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-gray-400 text-sm">Active</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                                    className={`text-2xl ${formData.active ? 'text-emerald-500' : 'text-gray-600'}`}
                                >
                                    {formData.active ? <FaToggleOn /> : <FaToggleOff />}
                                </button>
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
                                    {loading === 'submit' ? 'Saving...' : 'Save Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
