import { FaGem, FaFire } from 'react-icons/fa';

interface PackageProps {
    id: string;
    name: string;
    price: number;
    currency: string;
    bonus?: string;
    isPopular?: boolean;
}

interface PackageCardProps {
    pkg: PackageProps;
    selected: boolean;
    onSelect: () => void;
}

export default function PackageCard({ pkg, selected, onSelect }: PackageCardProps) {
    return (
        <div
            onClick={onSelect}
            className={`
        cursor-pointer relative p-6 rounded-2xl border transition-all duration-300 group
        ${selected
                    ? 'bg-primary/10 border-primary box-glow transform scale-105 z-10'
                    : 'bg-card-bg border-white/10 hover:border-white/30 hover:bg-white/5 hover:-translate-y-1'
                }
      `}
        >
            {pkg.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap z-20">
                    <FaFire /> ยอดนิยม
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full transition-colors ${selected ? 'bg-primary text-white' : 'bg-white/10 text-gray-400 group-hover:text-white'}`}>
                        <FaGem className="text-xl" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-display">{pkg.name}</h3>
                </div>
                {selected && (
                    <div className="h-4 w-4 rounded-full bg-primary shadow-[0_0_10px_currentColor] animate-pulse" />
                )}
            </div>

            <div className="text-3xl font-bold text-white mb-2 font-display">
                {pkg.price.toLocaleString()} <span className="text-sm text-gray-400 font-normal font-sans">{pkg.currency}</span>
            </div>

            {pkg.bonus && (
                <div className="inline-block bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30 text-secondary text-xs font-bold px-2 py-1 rounded">
                    {pkg.bonus}
                </div>
            )}
        </div>
    );
}
