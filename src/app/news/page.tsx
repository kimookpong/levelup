
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendar, FaArrowRight } from 'react-icons/fa';

export const metadata = {
    title: 'News & Updates | LevelUp',
    description: 'Latest news and updates from LevelUp',
};

async function getValues() {
    try {
        const news = await prisma.news.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' }
        });
        return news;
    } catch (error) {
        return [];
    }
}

export default async function NewsPage() {
    const news = await getValues();

    return (
        <div className="min-h-screen bg-[#0f1014] pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4">
                        News & Updates
                    </h1>
                    <p className="text-gray-400 text-lg">
                        ติดตามข่าวสารและอัปเดตล่าสุดจากเรา
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map((item) => (
                        <article
                            key={item.id}
                            className="group bg-[#1a1b26] border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
                        >
                            <div className="relative h-48 w-full overflow-hidden">
                                <Image
                                    src={item.image_url}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b26] to-transparent opacity-60" />
                            </div>

                            <div className="p-6">
                                <div className="flex items-center space-x-2 text-emerald-400 text-sm mb-3">
                                    <FaCalendar className="w-3 h-3" />
                                    <span>{new Date(item.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>

                                <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                                    {item.title}
                                </h2>

                                <p className="text-gray-400 line-clamp-3 mb-4 text-sm leading-relaxed">
                                    {item.content}
                                </p>

                                <div className="pt-4 border-t border-white/5 flex justify-end">
                                    {/* In a real scenario, this might link to a detail page /news/[id] */}
                                    <span className="text-emerald-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                        อ่านเพิ่มเติม <FaArrowRight />
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {news.length === 0 && (
                    <div className="text-center py-20 bg-[#1a1b26] rounded-3xl border border-white/5 mx-auto max-w-2xl">
                        <h3 className="text-xl text-gray-400 mb-2">ไม่พบข่าวสาร</h3>
                        <p className="text-gray-500">ติดตามอัปเดตใหม่ๆ ได้ในเร็วๆ นี้</p>
                    </div>
                )}
            </div>
        </div>
    );
}
