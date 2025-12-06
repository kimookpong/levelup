'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaNewspaper, FaToggleOn, FaToggleOff, FaEye } from 'react-icons/fa';
import { createNews, updateNews, deleteNews } from '@/actions/news';
import { News } from '@prisma/client';

interface AdminNewsClientProps {
    initialNews: News[];
}

export default function AdminNewsClient({ initialNews }: AdminNewsClientProps) {
    const [newsList, setNewsList] = useState<News[]>(initialNews);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        image_url: '',
        content: '',
        active: true
    });
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            title: formData.title,
            image_url: formData.image_url,
            content: formData.content,
            active: formData.active
        };

        try {
            if (editingNews) {
                const res = await updateNews(editingNews.id, payload);
                if (res.data) {
                    setNewsList(newsList.map(n => n.id === editingNews.id ? res.data! : n));
                }
            } else {
                const res = await createNews(payload);
                if (res.data) {
                    setNewsList([res.data, ...newsList]);
                }
            }
            setIsModalOpen(false);
            resetForm();
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
            setNewsList(newsList.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting news:', error);
            alert('Failed to delete news');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            image_url: '',
            content: '',
            active: true
        });
        setEditingNews(null);
        setImageError(false);
    };

    const openEditModal = (news: News) => {
        setEditingNews(news);
        setFormData({
            title: news.title,
            image_url: news.image_url,
            content: news.content,
            active: news.active
        });
        setImageError(false);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white hidden md:block">รายการข่าวสาร</h2>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                    <FaPlus />
                    <span>เพิ่มข่าวสาร</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsList.map((news) => (
                    <div key={news.id} className="group bg-[#1a1b26] border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
                        <div className="relative h-48 w-full overflow-hidden bg-black/20">
                            {news.image_url ? (
                                <Image
                                    src={news.image_url}
                                    alt={news.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gray-900/50">
                                    <FaNewspaper className="text-4xl mb-2" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-mono border border-white/10">
                                {news.active ? (
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
                                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 min-h-[3.5rem]">
                                    {news.title}
                                </h3>
                                <p className="text-gray-400 text-sm line-clamp-3 mt-2 h-[4.5rem]">
                                    {news.content}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Last Update: {new Date(news.updatedAt).toLocaleDateString('th-TH')}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                                <button
                                    onClick={() => openEditModal(news)}
                                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm"
                                >
                                    <FaEdit /> <span>แก้ไข</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(news.id)}
                                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm"
                                >
                                    <FaTrash /> <span>ลบ</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {newsList.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-[#1a1b26] border border-white/5 dashed rounded-2xl">
                        ไม่พบข้อมูลข่าวสาร
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#1a1b26] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl my-8">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">
                                {editingNews ? 'แก้ไขข่าวสาร' : 'เพิ่มข่าวสารใหม่'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">หัวข้อข่าว *</label>
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
                                    <label className="text-sm text-gray-400">เนื้อหาข่าว</label>
                                    <textarea
                                        rows={5}
                                        required
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
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
                                <span className="text-gray-300">เผยแพร่ทันที</span>
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
