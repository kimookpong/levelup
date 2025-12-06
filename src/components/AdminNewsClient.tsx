'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaImage } from 'react-icons/fa';
import { getAllNews, createNews, updateNews, deleteNews } from '@/actions/news';

interface NewsItem {
    id: string;
    title: string;
    image_url: string;
    content: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export default function AdminNewsClient() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        image_url: '',
        content: '',
        active: true
    });
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [imageError, setImageError] = useState(false);

    const fetchNews = useCallback(async () => {
        setRefreshing(true);
        try {
            const { data } = await getAllNews();
            // @ts-ignore
            if (data) setNews(data);
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingNews) {
                await updateNews(editingNews.id, {
                    title: formData.title,
                    image_url: formData.image_url,
                    content: formData.content,
                    active: formData.active
                });
            } else {
                await createNews({
                    title: formData.title,
                    image_url: formData.image_url,
                    content: formData.content,
                    active: formData.active
                });
            }
            setIsModalOpen(false);
            resetForm();
            fetchNews();
        } catch (error) {
            console.error('Error saving news:', error);
            alert('Failed to save news');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this news?')) return;

        try {
            await deleteNews(id);
            fetchNews();
        } catch (error) {
            console.error('Error deleting news:', error);
            alert('Failed to delete news');
        }
    };

    const resetForm = () => {
        setFormData({ title: '', image_url: '', content: '', active: true });
        setEditingNews(null);
        setImageError(false);
    };

    const openEditModal = (item: NewsItem) => {
        setEditingNews(item);
        setFormData({
            title: item.title,
            image_url: item.image_url,
            content: item.content,
            active: item.active
        });
        setImageError(false);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">จัดการข่าวสาร</h2>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                    <FaPlus />
                    <span>เพิ่มข่าวสาร</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                    <div key={item.id} className="group bg-[#1a1b26] border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
                        <div className="relative h-48 w-full overflow-hidden bg-black/20">
                            <Image
                                src={item.image_url}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={() => setImageError(true)}
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-mono border border-white/10">
                                {item.active ? (
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
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                    {item.content}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                                <button
                                    onClick={() => openEditModal(item)}
                                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm"
                                >
                                    <FaEdit /> <span>แก้ไข</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm"
                                >
                                    <FaTrash /> <span>ลบ</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {news.length === 0 && !refreshing && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-[#1a1b26] border border-white/5 dashed rounded-2xl">
                        ไม่พบข้อมูลข่าวสาร
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1a1b26] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">
                                {editingNews ? 'แก้ไขข่าวสาร' : 'เพิ่มข่าวสารใหม่'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">หัวข้อข่าว</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    placeholder="เช่น ประกาศปิดปรับปรุงเซิร์ฟเวอร์"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">รูปภาพ URL</label>
                                <div className="flex space-x-2">
                                    <div className="flex-1">
                                        <input
                                            type="url"
                                            required
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="w-12 h-12 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative">
                                        {formData.image_url && !imageError ? (
                                            <Image
                                                src={formData.image_url}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            <FaImage className="text-gray-600" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">เนื้อหาข่าว</label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full h-32 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                                    placeholder="รายละเอียดข่าว..."
                                />
                            </div>

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
