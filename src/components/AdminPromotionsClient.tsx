'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSync, FaPercent, FaMoneyBill } from 'react-icons/fa';

interface Promotion {
    id: string;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    max_uses: number | null;
    current_uses: number;
    expires_at: string | null;
    created_at: string;
}

interface AdminPromotionsClientProps {
    initialPromotions: Promotion[];
}

export default function AdminPromotionsClient({ initialPromotions }: AdminPromotionsClientProps) {
    const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percent' as 'percent' | 'fixed',
        discount_value: 0,
        max_uses: '',
        expires_at: ''
    });
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPromotions = useCallback(async () => {
        setRefreshing(true);
        try {
            const { data, error } = await supabase
                .from('promotions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setPromotions(data);
        } catch (error) {
            console.error('Error fetching promotions:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const resetForm = () => {
        setFormData({
            code: '',
            discount_type: 'percent',
            discount_value: 0,
            max_uses: '',
            expires_at: ''
        });
        setEditingPromotion(null);
    };

    const handleOpenModal = (promo?: Promotion) => {
        if (promo) {
            setEditingPromotion(promo);
            setFormData({
                code: promo.code,
                discount_type: promo.discount_type,
                discount_value: promo.discount_value,
                max_uses: promo.max_uses?.toString() || '',
                expires_at: promo.expires_at ? promo.expires_at.split('T')[0] : ''
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
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบโปรโมชั่นนี้?')) return;

        try {
            const { error } = await supabase
                .from('promotions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchPromotions();
        } catch (error: any) {
            console.error('Error deleting promotion:', error);
            alert(`เกิดข้อผิดพลาดในการลบ: ${error.message}`);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const saveData = {
                code: formData.code.toUpperCase(),
                discount_type: formData.discount_type,
                discount_value: formData.discount_value,
                max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
                expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
            };

            if (editingPromotion) {
                const { error } = await supabase
                    .from('promotions')
                    .update(saveData)
                    .eq('id', editingPromotion.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('promotions')
                    .insert([saveData]);

                if (error) throw error;
            }

            await fetchPromotions();
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving promotion:', error);
            if (error.code === '23505') {
                alert('โค้ดนี้มีอยู่แล้ว กรุณาใช้โค้ดอื่น');
            } else {
                alert(`เกิดข้อผิดพลาด: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const isExpired = (date: string | null) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2">จัดการโปรโมชั่น</h1>
                    <p className="text-gray-400">สร้างและจัดการโค้ดส่วนลด</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchPromotions}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        <FaSync className={refreshing ? 'animate-spin' : ''} />
                        รีเฟรช
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-primary hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,85,0.4)]"
                    >
                        <FaPlus />
                        เพิ่มโค้ด
                    </button>
                </div>
            </div>

            <div className="glass rounded-3xl overflow-hidden animate-fade-in-up shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">โค้ด</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">ส่วนลด</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">การใช้งาน</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">วันหมดอายุ</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">สถานะ</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {promotions.map((promo) => (
                            <tr key={promo.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-6">
                                    <span className="font-mono text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg">
                                        {promo.code}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-2">
                                        {promo.discount_type === 'percent' ? (
                                            <FaPercent className="text-green-400" />
                                        ) : (
                                            <FaMoneyBill className="text-yellow-400" />
                                        )}
                                        <span className="font-bold text-white">
                                            {promo.discount_type === 'percent'
                                                ? `${promo.discount_value}%`
                                                : `${promo.discount_value.toLocaleString()} THB`
                                            }
                                        </span>
                                    </div>
                                </td>
                                <td className="p-6 text-gray-300">
                                    {promo.current_uses} / {promo.max_uses || '∞'}
                                </td>
                                <td className="p-6 text-gray-300">
                                    {formatDate(promo.expires_at)}
                                </td>
                                <td className="p-6">
                                    {isExpired(promo.expires_at) ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400">
                                            หมดอายุ
                                        </span>
                                    ) : promo.max_uses && promo.current_uses >= promo.max_uses ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400">
                                            ใช้ครบแล้ว
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                                            ใช้งานได้
                                        </span>
                                    )}
                                </td>
                                <td className="p-6 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(promo)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promo.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {promotions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-gray-500">
                                    ไม่พบข้อมูลโปรโมชั่น
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
                                {editingPromotion ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">โค้ดส่วนลด *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white font-mono uppercase focus:outline-none focus:border-primary/50"
                                    placeholder="เช่น NEWYEAR2024"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">ประเภทส่วนลด</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percent' | 'fixed' })}
                                        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                    >
                                        <option value="percent">เปอร์เซ็นต์ (%)</option>
                                        <option value="fixed">จำนวนเงิน (THB)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">
                                        มูลค่าส่วนลด *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                                        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                        min="0"
                                        max={formData.discount_type === 'percent' ? 100 : undefined}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">จำนวนครั้งที่ใช้ได้</label>
                                    <input
                                        type="number"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                        placeholder="ไม่จำกัด"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">วันหมดอายุ</label>
                                    <input
                                        type="date"
                                        value={formData.expires_at}
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>
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
