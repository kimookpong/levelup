'use client';

import { useState } from 'react';
import GameCard from '@/components/GameCard';
import Image from 'next/image';

interface Game {
    id: string;
    name: string;
    slug: string;
    image_url: string;
    active: boolean;
}

interface HomeClientProps {
    games: Game[];
}

export default function HomeClient({ games }: HomeClientProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredGames = games.filter((game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Hero Section */}
            <section className="relative h-[65vh] min-h-[400px] md:h-[60vh] md:min-h-[500px] flex items-center justify-center overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f1014]/60 via-[#0f1014]/40 to-[#0f1014]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 animate-pulse-glow" />

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
                    <div className="inline-block mt-10 px-3 py-1 md:px-4 tracking-wider animate-float">
                        <Image
                            src="/logo.png"
                            alt="Level Up Logo"
                            width={180}
                            height={180}
                            className="relative z-10 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                        />
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-extrabold mb-4 md:mb-6 tracking-tight leading-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x">
                            LEVEL UP
                        </span>
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
                        เติมเกมมือถือโปรดของคุณได้ทันที
                        <span className="text-primary font-bold block md:inline"> รวดเร็ว ปลอดภัย ตลอด 24 ชม.</span>
                    </p>


                </div>
            </section>

            {/* Games Grid */}
            <section id="games" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20 pb-16 md:pb-24 pt-8">
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto relative mb-8 px-4">
                    <input
                        type="text"
                        placeholder="ค้นหาเกม / บัตรเติมเงิน..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1b26] border border-white/10 rounded-full py-3 px-5 md:py-4 md:px-6 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <div className="absolute right-6 top-1.5 bottom-1.5 md:right-6 md:top-2 md:bottom-2">
                        <button className="h-full px-4 md:px-6 bg-primary hover:bg-primary/90 text-white rounded-full text-sm md:text-base font-bold transition-colors">
                            ค้นหา
                        </button>
                    </div>
                </div>
                {filteredGames.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                        {filteredGames.map((game) => (
                            <GameCard
                                key={game.id}
                                game={{
                                    id: game.id,
                                    name: game.name,
                                    slug: game.slug,
                                    imageUrl: game.image_url,
                                    // Default values for missing fields
                                    publisher: 'Official',
                                    discount: 0,
                                    isHot: false
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">ไม่พบเกมที่คุณค้นหา</p>
                    </div>
                )}
            </section>
        </>
    );
}
