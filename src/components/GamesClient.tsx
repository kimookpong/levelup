'use client';

import { useState } from 'react';
import GameCard from '@/components/GameCard';
import { FaSearch, FaGamepad } from 'react-icons/fa';

interface Game {
    id: string;
    name: string;
    slug: string;
    image_url: string;
    active: boolean;
}

interface GamesClientProps {
    games: Game[];
}

export default function GamesClient({ games }: GamesClientProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredGames = games.filter((game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0f1014] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                            <FaGamepad className="text-primary" />
                            เกมทั้งหมด
                        </h1>
                        <p className="text-gray-400 mt-2">เลือกเกมที่คุณต้องการเติมเงิน</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="ค้นหาเกม..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1a1b26] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                        <FaSearch className="absolute left-4 top-3.5 text-gray-500" />
                    </div>
                </div>

                {/* Games Grid */}
                {filteredGames.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredGames.map((game) => (
                            <GameCard
                                key={game.id}
                                game={{
                                    id: game.id,
                                    name: game.name,
                                    slug: game.slug,
                                    imageUrl: game.image_url,
                                    publisher: 'Official',
                                    discount: 0,
                                    isHot: false
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[#1a1b26]/30 rounded-2xl border border-white/5">
                        <FaSearch className="text-4xl text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">ไม่พบเกมที่คุณค้นหา</h3>
                        <p className="text-gray-400">ลองค้นหาด้วยคำค้นอื่น หรือดูเกมทั้งหมด</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-6 px-6 py-2 bg-primary/20 text-primary border border-primary/50 rounded-full hover:bg-primary hover:text-white transition-all"
                        >
                            ล้างคำค้นหา
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
