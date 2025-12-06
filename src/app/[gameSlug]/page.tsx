'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PackageCard from '@/components/PackageCard';
import PaymentModal from '@/components/PaymentModal';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';

export default function TopUpPage() {
    const params = useParams();
    const slug = params.gameSlug as string;

    const [game, setGame] = useState<any>(null);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [playerId, setPlayerId] = useState('');

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                setLoading(true);
                // 1. Fetch game details
                const { data: gameData, error: gameError } = await supabase
                    .from('games')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (gameError) throw gameError;
                if (gameData) {
                    setGame(gameData);

                    // 2. Fetch packages for this game
                    // Assuming 'packages' table has 'game_id' foreign key
                    const { data: packagesData, error: packagesError } = await supabase
                        .from('packages')
                        .select('*')
                        .eq('game_id', gameData.id)
                        .order('price', { ascending: true });

                    if (packagesError) {
                        console.error('Error fetching packages:', packagesError);
                    } else {
                        setPackages(packagesData || []);
                    }
                }
            } catch (error) {
                console.error('Error fetching game data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchGameData();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1014] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="min-h-screen bg-[#0f1014] text-white flex items-center justify-center">
                <h1 className="text-2xl">ไม่พบเกม</h1>
            </div>
        );
    }

    const handleBuyNow = () => {
        if (!playerId) {
            alert('กรุณากรอก Player ID');
            return;
        }
        if (!selectedPackage) {
            alert('กรุณาเลือกแพ็กเกจ');
            return;
        }
        setIsPaymentModalOpen(true);
    };

    const selectedPkgData = packages.find((p: any) => p.id === selectedPackage);

    return (
        <main className="min-h-screen bg-[#0f1014] text-white">
            <Navbar />

            {/* Header */}
            <div className="relative h-[40vh] min-h-[400px]">
                <Image
                    src={game.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000'}
                    alt={game.name}
                    fill
                    className="object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 w-full p-8 max-w-7xl mx-auto">
                    <div className="animate-float">
                        <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-4 text-glow">{game.name}</h1>
                        <p className="text-xl text-gray-300 max-w-2xl">จัดส่งทันที ปลอดภัย วิธีที่ดีที่สุดในการเติมเกมของคุณ</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Input & Packages */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Step 1: Player ID */}
                        <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-2xl shadow-[0_0_15px_rgba(255,0,85,0.5)]">1</div>
                                <h2 className="text-3xl font-display font-bold">กรอก Player ID</h2>
                            </div>
                            <div className="glass p-8 rounded-3xl">
                                <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider font-bold">Player ID / OpenID</label>
                                <input
                                    type="text"
                                    placeholder="เช่น 123456789"
                                    value={playerId}
                                    onChange={(e) => setPlayerId(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                                <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    ตรวจสอบ ID ให้ถูกต้อง เราไม่สามารถคืนเงินได้หากคุณกรอกผิด
                                </p>
                            </div>
                        </section>

                        {/* Step 2: Select Package */}
                        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-2xl shadow-[0_0_15px_rgba(255,0,85,0.5)]">2</div>
                                <h2 className="text-3xl font-display font-bold">เลือกแพ็กเกจ</h2>
                            </div>

                            {packages.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {packages.map((pkg: any, index: number) => (
                                        <PackageCard
                                            key={pkg.id}
                                            pkg={{ ...pkg, isPopular: index === 2 }} // Mocking popular item
                                            selected={selectedPackage === pkg.id}
                                            onSelect={() => setSelectedPackage(pkg.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 glass rounded-3xl border border-white/10">
                                    <p className="text-gray-400 text-lg">ยังไม่มีแพ็กเกจสำหรับเกมนี้</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="sticky top-24 glass rounded-3xl p-8 shadow-2xl border border-white/10">
                            <h3 className="text-2xl font-display font-bold mb-6 border-b border-white/10 pb-4">สรุปคำสั่งซื้อ</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-400">
                                    <span>เกม</span>
                                    <span className="text-white font-bold text-right">{game.name}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Player ID</span>
                                    <span className="text-white font-mono">{playerId || '-'}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>แพ็กเกจ</span>
                                    <span className="text-white font-bold">{selectedPkgData?.name || '-'}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-8 pt-6 border-t border-white/10">
                                <span className="text-lg font-bold text-gray-300">ยอดรวม</span>
                                <span className="text-4xl font-display font-bold text-primary text-glow">
                                    {selectedPkgData ? selectedPkgData.price.toLocaleString() : '0'} <span className="text-lg text-white">THB</span>
                                </span>
                            </div>

                            <button
                                onClick={handleBuyNow}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-5 rounded-xl shadow-[0_0_20px_rgba(255,0,85,0.3)] hover:shadow-[0_0_30px_rgba(255,0,85,0.5)] transition-all transform hover:scale-[1.02] text-lg uppercase tracking-wider"
                            >
                                ชำระเงิน
                            </button>

                            <p className="text-center text-gray-500 text-xs mt-4">
                                การคลิกชำระเงิน ถือว่าคุณยอมรับข้อกำหนดการให้บริการของเรา
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                pkg={selectedPkgData}
            />

            <Footer />
        </main>
    );
}
