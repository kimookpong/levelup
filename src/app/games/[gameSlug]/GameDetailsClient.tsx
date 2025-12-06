'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaShieldAlt, FaBolt, FaHeadset, FaCheck, FaStar, FaGamepad } from 'react-icons/fa';
import PaymentModal from '@/components/PaymentModal';
import PackageCard from '@/components/PackageCard';
import Image from 'next/image';

interface GameDetailsClientProps {
    game: any;
    packages: any[];
}

export default function GameDetailsClient({ game, packages }: GameDetailsClientProps) {
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [playerId, setPlayerId] = useState('');

    // --- State for Purchase ---
    const [currentTransaction, setCurrentTransaction] = useState<any>(null);
    const [promotionCode, setPromotionCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; value: number } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApplyPromotion = async () => {
        if (!promotionCode.trim()) return;

        // Call server action to validate
        const { validatePromotion } = await import('@/actions/promotions');
        const res = await validatePromotion(promotionCode);

        if (res.error || !res.data) {
            alert(res.error || 'Invalid code');
            setAppliedDiscount(null);
            return;
        }

        const promo = res.data;
        let discountVal = 0;
        const currentPrice = selectedPkgData ? selectedPkgData.price : 0;

        if (promo.discount_type === 'FIXED') {
            discountVal = promo.discount_value;
        } else {
            discountVal = (currentPrice * promo.discount_value) / 100;
        }

        // Cap discount
        if (discountVal > currentPrice) discountVal = currentPrice;

        setAppliedDiscount({
            code: promo.code!,
            value: discountVal
        });
        alert('ใช้คูปองส่วนลดสำเร็จ!');
    };

    const handleRemovePromotion = () => {
        setAppliedDiscount(null);
        setPromotionCode('');
    };

    const handleBuyNow = async () => {
        if (!playerId) {
            alert('กรุณากรอก Player ID');
            return;
        }
        if (!selectedPackage) {
            alert('กรุณาเลือกแพ็กเกจ');
            return;
        }

        setIsProcessing(true);
        try {
            const { createTransaction } = await import('@/actions/transactions');
            const res = await createTransaction({
                gameId: game.id,
                packageId: selectedPackage,
                price: selectedPkgData.price, // Base price, server validates final
                playerId: playerId,
                promotionCode: appliedDiscount?.code
            });

            if (res.error || !res.data) {
                alert('Purchase Failed: ' + res.error);
                return;
            }

            // Success -> Open Payment Modal with Transaction Details
            setCurrentTransaction(res.data);
            setIsPaymentModalOpen(true);

        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const selectedPkgData = packages.find((p: any) => p.id === selectedPackage);
    const finalPrice = selectedPkgData ? (selectedPkgData.price - (appliedDiscount ? appliedDiscount.value : 0)) : 0;

    return (
        <main className="min-h-screen bg-[#0f1014] text-white">
            <Navbar />
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
            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column: Game Info and Package Selection */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-6 mb-8 animate-fade-in-down">
                            <Image
                                src={game.image_url || '/placeholder-game.jpg'}
                                alt={game.name}
                                width={120}
                                height={120}
                                className="rounded-2xl shadow-lg border border-white/10"
                            />
                            <div>
                                <h1 className="text-4xl font-display font-bold text-primary mb-2">{game.name}</h1>
                                <p className="text-gray-400 text-lg">{game.description}</p>
                            </div>
                        </div>

                        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/10 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <h2 className="text-2xl font-display font-bold mb-6 border-b border-white/10 pb-4">
                                <FaGamepad className="inline-block mr-3 text-primary" />
                                กรอก Player ID
                            </h2>
                            <input
                                type="text"
                                placeholder="กรอก Player ID ของคุณ"
                                value={playerId}
                                onChange={(e) => setPlayerId(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-6 py-4 text-lg text-white focus:outline-none focus:border-primary transition-colors"
                            />
                            <p className="text-gray-500 text-sm mt-3">
                                ตรวจสอบให้แน่ใจว่า Player ID ถูกต้องเพื่อการเติมเงินที่ราบรื่น
                            </p>
                        </div>

                        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <h2 className="text-2xl font-display font-bold mb-6 border-b border-white/10 pb-4">
                                <FaStar className="inline-block mr-3 text-primary" />
                                เลือกแพ็กเกจ
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {packages.length > 0 ? (
                                    packages.map((pkg: any) => (
                                        <PackageCard
                                            key={pkg.id}
                                            pkg={pkg}
                                            selected={selectedPackage === pkg.id}
                                            onSelect={() => setSelectedPackage(pkg.id)}
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-400 col-span-full">ไม่มีแพ็กเกจสำหรับเกมนี้</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <h2 className="text-2xl font-display font-bold mb-6 text-primary">ทำไมต้องเติมเงินกับเรา?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="flex flex-col items-center text-center glass p-6 rounded-2xl border border-white/10 shadow-lg">
                                    <FaShieldAlt className="text-5xl text-green-400 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">ปลอดภัย 100%</h3>
                                    <p className="text-gray-400 text-sm">ระบบป้องกันข้อมูลส่วนตัวและการทำธุรกรรมที่เข้มงวด</p>
                                </div>
                                <div className="flex flex-col items-center text-center glass p-6 rounded-2xl border border-white/10 shadow-lg">
                                    <FaBolt className="text-5xl text-yellow-400 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">รวดเร็วทันใจ</h3>
                                    <p className="text-gray-400 text-sm">เติมเงินเข้าเกมได้ภายในไม่กี่วินาที</p>
                                </div>
                                <div className="flex flex-col items-center text-center glass p-6 rounded-2xl border border-white/10 shadow-lg">
                                    <FaHeadset className="text-5xl text-blue-400 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">บริการ 24/7</h3>
                                    <p className="text-gray-400 text-sm">ทีมงานพร้อมช่วยเหลือตลอดเวลา</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="sticky top-24 glass rounded-3xl p-8 shadow-2xl border border-white/10">
                            <h3 className="text-2xl font-display font-bold mb-6 border-b border-white/10 pb-4">สรุปคำสั่งซื้อ</h3>

                            {/* Promotion Input */}
                            <div className="mb-6">
                                <label className="block text-gray-400 mb-2 text-xs uppercase tracking-wider font-bold">คูปองส่วนลด</label>
                                {appliedDiscount ? (
                                    <div className="flex items-center justify-between bg-green-500/20 border border-green-500/50 p-3 rounded-xl">
                                        <span className="text-green-400 text-sm font-bold flex items-center gap-2">
                                            <FaCheck /> {appliedDiscount.code}
                                        </span>
                                        <button onClick={handleRemovePromotion} className="text-gray-400 hover:text-white text-xs underline">ลบ</button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="กรอกโค้ดส่วนลด"
                                            value={promotionCode}
                                            onChange={(e) => setPromotionCode(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                        />
                                        <button
                                            onClick={handleApplyPromotion}
                                            className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl text-sm transition-colors"
                                        >
                                            ใช้
                                        </button>
                                    </div>
                                )}
                            </div>


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
                                {appliedDiscount && (
                                    <div className="flex justify-between text-green-400">
                                        <span>ส่วนลด</span>
                                        <span className="font-bold">-{appliedDiscount.value.toLocaleString()} THB</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-8 pt-6 border-t border-white/10">
                                <span className="text-lg font-bold text-gray-300">ยอดรวม</span>
                                <span className="text-4xl font-display font-bold text-primary text-glow">
                                    {finalPrice.toLocaleString()} <span className="text-lg text-white">THB</span>
                                </span>
                            </div>

                            <button
                                onClick={handleBuyNow}
                                disabled={isProcessing}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-5 rounded-xl shadow-[0_0_20px_rgba(255,0,85,0.3)] hover:shadow-[0_0_30px_rgba(255,0,85,0.5)] transition-all transform hover:scale-[1.02] text-lg uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'กำลังดำเนินการ...' : 'ชำระเงิน'}
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
                transactionId={currentTransaction?.id}
                amount={currentTransaction?.price}
            />

            <Footer />
        </main >
    );
}
