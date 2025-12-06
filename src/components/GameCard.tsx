import Image from 'next/image';
import Link from 'next/link';
import { FaFire } from 'react-icons/fa';

interface GameProps {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    discount?: number;
    isHot?: boolean;
    publisher?: string;
}

export default function GameCard({ game }: { game: GameProps }) {
    return (
        <Link href={`/games/${game.slug}`} className="group relative block h-full">
            <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/5 bg-[#1a1b26] transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(255,0,85,0.2)] hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                    <Image
                        src={game.imageUrl}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Hot Badge */}
                    {game.isHot && (
                        <div className="absolute top-1 right-1 md:top-2 md:right-2 z-10">
                            <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/40">
                                <FaFire className="text-[10px] md:text-xs" />
                            </div>
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b26] via-transparent to-transparent opacity-80" />
                </div>

                {/* Content */}
                <div className="p-3 md:p-4">
                    <h3 className="text-xs md:text-sm font-bold text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {game.name}
                    </h3>

                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] md:text-xs text-gray-400 line-clamp-1">
                            {game.publisher || 'Official'}
                        </p>

                        {/* Discount Badge */}
                        {game.discount && (
                            <div className="shrink-0 rounded-md bg-purple-600/90 px-1.5 py-0.5 text-[10px] md:text-xs font-bold text-white">
                                -{game.discount}%
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
