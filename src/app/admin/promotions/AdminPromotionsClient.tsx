'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaTicketAlt, FaClock, FaLink } from 'react-icons/fa';
import { createPromotion, updatePromotion, deletePromotion } from '@/actions/promotions';
import { Promotion } from '@prisma/client';

interface AdminPromotionsClientProps {
    initialPromotions: Promotion[];
}

export default function AdminPromotionsClient({ initialPromotions }: AdminPromotionsClientProps) {
    const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        image_url: '',
        link: '',
        active: true,
        code: '',
        discount_type: 'FIXED',
        discount_value: 0,
        usage_limit: '',
        expires_at: ''
    });
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            title: formData.title,
            image_url: formData.image_url || undefined,
            link: formData.link || undefined,
            active: formData.active,
            code: formData.code || undefined,
            discount_type: formData.discount_type,
            discount_value: Number(formData.discount_value),
            usage_limit: formData.usage_limit ? Number(formData.usage_limit) : undefined,
            expires_at: formData.expires_at ? new Date(formData.expires_at) : undefined
        };

        try {
            if (editingPromotion) {
                const res = await updatePromotion(editingPromotion.id, payload);
                if (res.data) {
                    setPromotions(promotions.map(p => p.id === editingPromotion.id ? res.data : p));
                }
            } else {
                const res = await createPromotion(payload);
                if (res.data) {
                    setPromotions([res.data, ...promotions]);
                }
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving promotion:', error);
            alert('Failed to save promotion');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this promotion?')) return;

        try {
            await deletePromotion(id);
            setPromotions(promotions.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting promotion:', error);
            alert('Failed to delete promotion');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            image_url: '',
            link: '',
            active: true,
            code: '',
            discount_type: 'FIXED',
            discount_value: 0,
            usage_limit: '',
            expires_at: ''
        });
        setEditingPromotion(null);
        setImageError(false);
    };

    const openEditModal = (promotion: Promotion) => {
        setEditingPromotion(promotion);

        // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
        let formattedDate = '';
        if (promotion.expires_at) {
            const date = new Date(promotion.expires_at);
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            formattedDate = localDate.toISOString().slice(0, 16);
        }

        setFormData({
            title: promotion.title,
            image_url: promotion.image_url || '',
            link: promotion.link || '',
            active: promotion.active,
            // @ts-ignore
            code: promotion.code || '',
            // @ts-ignore
            discount_type: promotion.discount_type || 'FIXED',
            // @ts-ignore
            discount_value: promotion.discount_value || 0,
            // @ts-ignore
            usage_limit: promotion.usage_limit ? String(promotion.usage_limit) : '',
            expires_at: formattedDate
        });
        setImageError(false);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white hidden md:block">รายการโปรโมชั่น</h2>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                    <FaPlus />
                    <span>เพิ่มโปรโมชั่น</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map((promo) => (
                    <div key={promo.id} className="group bg-[#1a1b26] border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
                        <div className="relative h-48 w-full overflow-hidden bg-black/20">
                            {promo.image_url ? (
                                <Image
                                    src={promo.image_url}
                                    alt={promo.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gray-900/50">
                                    <FaTicketAlt className="text-4xl mb-2" />
                                    {/* @ts-ignore */}
                                    <span className="text-sm font-mono">{promo.code || 'No Code'}</span>
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-mono border border-white/10">
                                {promo.active ? (
                                    <span className="text-emerald-400 flex items-center space-x-1">
                                        <FaCheck className="w-3 h-3" /> <span>Active</span>
                                    </span>
                                ) : (
                                    <span className="text-red-400 flex items-center space-x-1">
                                        <FaTimes className="w-3 h-3" /> <span>Inactive</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                                    {promo.title}
                                </h3>

                                {/* @ts-ignore */}
                                {promo.code && (
                                    <div className="flex items-center space-x-2 text-sm text-yellow-400 mt-2 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20 w-fit">
                                        <FaTicketAlt className="w-3 h-3" />
                                        {/* @ts-ignore */}
                                        <span className="font-mono font-bold">{promo.code}</span>
                                        <span className="text-gray-400 text-xs ml-2">
                                            {/* @ts-ignore */}
                                            (-{promo.discount_value}{promo.discount_type === 'PERCENT' ? '%' : ' THB'})
                                        </span>
                                    </div>
                                )}

                                {/* @ts-ignore */}
                                {promo.expires_at && (
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
                                        <FaClock className="w-3 h-3" />
                                        {/* @ts-ignore */}
                                        <span> หมดอายุ: {new Date(promo.expires_at).toLocaleDateString('th-TH')}</span>
                                    </div>
                                )}

                                {promo.link && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                                        <FaLink className="w-3 h-3" />
                                        <span className="truncate">{promo.link}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                                <button
                                    onClick={() => openEditModal(promo)}
                                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm"
                                >
                                    <FaEdit /> <span>แก้ไข</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(promo.id)}
                                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm"
                                >
                                    <FaTrash /> <span>ลบ</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {promotions.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-[#1a1b26] border border-white/5 dashed rounded-2xl">
                        ไม่พบข้อมูลโปรโมชั่น
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#1a1b26] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl my-8">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">
                                {editingPromotion ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลใหม่'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* General Info */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">ข้อมูลพื้นฐาน</h4>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">ชื่อรายการ *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">รูปภาพ URL (Optional)</label>
                                    <input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">ลิงก์ URL (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <hr className="border-white/10" />

                            {/* Coupon Info */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                                    <FaTicketAlt /> ข้อมูลคูปอง (Optional)
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">รหัสคูปอง (Code)</label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition-colors font-mono uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">ประเภทส่วนลด</label>
                                        <select
                                            value={formData.discount_type}
                                            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                                        >
                                            <option value="FIXED">ลดเป็นบาท (THB)</option>
                                            <option value="PERCENT">ลดเป็นเปอร์เซ็นต์ (%)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">มูลค่าส่วนลด</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">จำกัดจำนวน (ครั้ง)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.usage_limit}
                                            onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">วันหมดอายุ</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expires_at}
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <hr className="border-white/10" />

                            <div className="flex items-center space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.active ? 'bg-emerald-500' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.active ? 'left-7' : 'left-1'}`} />
                                </button>
                                <span className="text-gray-300">เปิดใช้งาน</span>
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors font-medium"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
