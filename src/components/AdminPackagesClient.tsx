'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSync } from 'react-icons/fa';

interface Game {
    id: string;
    name: string;
    image_url: string;
}

interface Package {
    id: string;
    game_id: string;
    name: string;
    price: number;
    currency: string;
    bonus_details: string | null;
    active: boolean;
    games?: Game;
}

interface AdminPackagesClientProps {
    initialPackages?: Package[];
    initialGames?: Game[];
}

export default function AdminPackagesClient({ initialPackages = [], initialGames = [] }: AdminPackagesClientProps) {
    const [packages, setPackages] = useState<Package[]>(initialPackages);
    // Remove initialGames from useState to manage it properly
    const [games, setGames] = useState<Game[]>(initialGames);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);
    const [formData, setFormData] = useState({
        game_id: '',
        name: '',
        price: 0,
        currency: 'THB',
        bonus_details: '',
        active: true
    });
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filterGameId, setFilterGameId] = useState<string>('');

    const fetchGames = useCallback(async () => {
        try {
            const { data } = await import('@/actions/games').then(m => m.getGames());
            if (data) setGames(data);
        } catch (error) {
            console.error("Error fetching games", error);
        }
    }, []);

    const fetchPackages = useCallback(async () => {
        setRefreshing(true);
        try {
            const { data, error } = await import('@/actions/packages').then(m => m.getPackages(filterGameId));

            if (error) throw new Error(error);
            // @ts-ignore
            if (data) setPackages(data);
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setRefreshing(false);
        }
    }, [filterGameId]);

    useEffect(() => {
        // Fetch if not provided
        if (!initialGames || initialGames.length === 0) {
            fetchGames();
        }
        // Always fetch packages to be safe or if empty
        if (!initialPackages || initialPackages.length === 0) {
            fetchPackages();
        }
    }, [filterGameId, fetchPackages, fetchGames]);

    const resetForm = () => {
        setFormData({
            game_id: games[0]?.id || '',
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
                currency: pkg.currency || 'THB',
                bonus_details: pkg.bonus_details || '',
                active: pkg.active
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

    const handleDelete = async (id: string) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแพ็กเกจนี้?')) return;

        try {
            const { error } = await import('@/actions/packages').then(m => m.deletePackage(id));

            if (error) throw new Error(error);
            await fetchPackages();
        } catch (error: any) {
            console.error('Error deleting package:', error);
            alert(`เกิดข้อผิดพลาดในการลบ: ${error.message}`);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const saveData = {
                game_id: formData.game_id,
                name: formData.name,
                price: formData.price,
                currency: formData.currency,
                bonus_details: formData.bonus_details || null,
                active: formData.active
            };

            let result;
            if (editingPackage) {
                result = await import('@/actions/packages').then(m => m.updatePackage(editingPackage.id, saveData));
            } else {
                result = await import('@/actions/packages').then(m => m.createPackage(saveData));
            }

            if (result.error) throw new Error(result.error);

            await fetchPackages();
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving package:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const filteredPackages = filterGameId
        ? packages.filter(p => p.game_id === filterGameId)
        : packages;

    return (
        <div>
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2">จัดการแพ็กเกจ</h1>
                    <p className="text-gray-400">เพิ่ม แก้ไข หรือลบแพ็กเกจเติมเกม</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={filterGameId}
                        onChange={(e) => setFilterGameId(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                    >
                        <option value="">ทุกเกม</option>
                        {games.map(game => (
                            <option key={game.id} value={game.id}>{game.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={fetchPackages}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        <FaSync className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-primary hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,85,0.4)]"
                    >
                        <FaPlus />
                        เพิ่มแพ็กเกจ
                    </button>
                </div>
            </div>

            <div className="glass rounded-3xl overflow-hidden animate-fade-in-up shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">เกม</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">ชื่อแพ็กเกจ</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">ราคา</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">โบนัส</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">สถานะ</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredPackages.map((pkg) => (
                            <tr key={pkg.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        {pkg.games?.image_url && (
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-800">
                                                <Image src={pkg.games.image_url} alt={pkg.games.name} fill sizes="40px" className="object-cover" />
                                            </div>
                                        )}
                                        <span className="font-bold text-white">{pkg.games?.name}</span>
                                    </div>
                                </td>
                                <td className="p-6 font-medium text-gray-200">{pkg.name}</td>
                                <td className="p-6 font-mono text-primary font-bold">{pkg.price.toLocaleString()} {pkg.currency}</td>
                                <td className="p-6 text-gray-400 text-sm">{pkg.bonus_details || '-'}</td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${pkg.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                        {pkg.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                    </span>
                                </td>
                                <td className="p-6 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(pkg)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pkg.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredPackages.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-gray-500">
                                    ไม่พบข้อมูลแพ็กเกจ
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a1b26] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in-up">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-2xl font-bold text-white">
                                {editingPackage ? 'แก้ไขแพ็กเกจ' : 'เพิ่มแพ็กเกจใหม่'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">เกม *</label>
                                <select
                                    value={formData.game_id}
                                    onChange={(e) => setFormData({ ...formData, game_id: e.target.value })}
                                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                    required
                                >
                                    <option value="">เลือกเกม</option>
                                    {games.map(game => (
                                        <option key={game.id} value={game.id}>{game.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">ชื่อแพ็กเกจ *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                    placeholder="เช่น 100 Diamonds"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">ราคา *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">สกุลเงิน</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                    >
                                        <option value="THB">THB</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">รายละเอียดโบนัส</label>
                                <input
                                    type="text"
                                    value={formData.bonus_details}
                                    onChange={(e) => setFormData({ ...formData, bonus_details: e.target.value })}
                                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                    placeholder="เช่น +10 Bonus Diamonds"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-5 h-5 rounded border-white/20 bg-black/50 text-primary focus:ring-primary"
                                />
                                <label htmlFor="active" className="text-gray-300">เปิดใช้งาน</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-primary hover:bg-red-600 rounded-xl text-white font-bold transition-colors disabled:opacity-50"
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
