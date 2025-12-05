import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameCard from '@/components/GameCard';
import { FaBolt, FaShieldAlt, FaHeadset, FaNewspaper, FaStar, FaCreditCard } from 'react-icons/fa';
import Image from 'next/image';

import { createStaticClient } from '@/lib/supabase/server';

const NEWS = [
    {
        id: 1,
        title: "อัปเดตใหม่! RoV ซีซั่นล่าสุด พร้อมฮีโร่ใหม่",
        excerpt: "พบกับการเปลี่ยนแปลงครั้งใหญ่ใน RoV ซีซั่นนี้ พร้อมฮีโร่ใหม่สุดแกร่งที่จะมาเขย่าเมต้า",
        date: "2 ธ.ค. 2024",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000"
    },
    {
        id: 2,
        title: "Genshin Impact: แจก Primogems ฟรี!",
        excerpt: "โค้ดใหม่ล่าสุดสำหรับเดือนนี้ รีบเติมก่อนหมดอายุ รับ Primogems ฟรีทันที",
        date: "1 ธ.ค. 2024",
        image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=1000"
    },
    {
        id: 3,
        title: "PUBG Mobile: เทคนิคการไต่แรงค์",
        excerpt: "รวมเทคนิคระดับโปรเพลเยอร์ที่จะช่วยให้คุณไต่แรงค์ขึ้น Conqueror ได้ง่ายๆ",
        date: "30 พ.ย. 2024",
        image: "https://images.unsplash.com/photo-1593305841991-05c29736f87e?auto=format&fit=crop&q=80&w=1000"
    }
];

const REVIEWS = [
    {
        id: 1,
        name: "Kitti Gamer",
        rating: 5,
        comment: "เติมไวมากครับ ได้ของจริง ไม่โกง แนะนำเลยครับเว็บนี้",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
    },
    {
        id: 2,
        name: "Sarah C.",
        rating: 5,
        comment: "บริการดีมาก แอดมินตอบไว ช่วยเหลือดีมากค่ะ",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
    },
    {
        id: 3,
        name: "ProPlayer99",
        rating: 4,
        comment: "ราคาดีกว่าเติมเองเยอะเลย คุ้มมากครับ",
        avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=100"
    }
];

const PAYMENTS = [
    { name: "TrueMoney Wallet", logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=200" },
    { name: "KPlus", logo: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=200" },
    { name: "Visa/Mastercard", logo: "https://images.unsplash.com/photo-1556742111-a3010425418e?auto=format&fit=crop&q=80&w=200" },
    { name: "PromptPay", logo: "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?auto=format&fit=crop&q=80&w=200" }
];

export default async function Home() {
    let games = [];
    try {
        const supabase = createStaticClient();
        const { data } = await supabase.from('games').select('*').eq('active', true);
        games = data || [];
    } catch (error) {
        console.error("Supabase connection error:", error);
        // Fallback to empty games list or mock data if needed
    }

    return (
        <main className="min-h-screen bg-[#0f1014] text-white selection:bg-primary selection:text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[400px] md:h-[60vh] md:min-h-[500px] flex items-center justify-center overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f1014]/60 via-[#0f1014]/40 to-[#0f1014]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 animate-pulse-glow" />

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-12 md:mt-16">
                    <div className="inline-block mb-3 md:mb-4 px-3 py-1 md:px-4 rounded-full glass border-primary/30 text-primary text-xs md:text-sm font-bold tracking-wider uppercase animate-float">
                        แพลตฟอร์มเติมเกมอันดับ 1
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-extrabold mb-4 md:mb-6 tracking-tight leading-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                            LEVEL UP
                        </span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x">
                            เกมของคุณ
                        </span>
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
                        เติมเกมมือถือโปรดของคุณได้ทันที
                        <span className="text-primary font-bold block md:inline"> รวดเร็ว ปลอดภัย ตลอด 24 ชม.</span>
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative mb-8 px-4">
                        <input
                            type="text"
                            placeholder="ค้นหาเกม / บัตรเติมเงิน..."
                            className="w-full bg-[#1a1b26] border border-white/10 rounded-full py-3 px-5 md:py-4 md:px-6 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                        <div className="absolute right-6 top-1.5 bottom-1.5 md:right-6 md:top-2 md:bottom-2">
                            <button className="h-full px-4 md:px-6 bg-primary hover:bg-primary/90 text-white rounded-full text-sm md:text-base font-bold transition-colors">
                                ค้นหา
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Games Grid */}
            <section id="games" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 relative z-20 pb-16 md:pb-24 pt-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {games?.map((game) => (
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
            </section>

            {/* For Gamers Section */}
            <section className="py-12 md:py-20 bg-[#1a1b26]/30 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8 md:mb-12">
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-2 md:gap-3">
                            <FaNewspaper className="text-primary" />
                            สำหรับ <span className="text-primary">เกมเมอร์</span>
                        </h2>
                        <a href="#" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">ดูทั้งหมด &rarr;</a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                        {NEWS.map((news) => (
                            <div key={news.id} className="group cursor-pointer">
                                <div className="relative h-40 md:h-48 rounded-xl overflow-hidden mb-3 md:mb-4">
                                    <Image
                                        src={news.image}
                                        alt={news.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs text-white">
                                        ข่าวสาร
                                    </div>
                                </div>
                                <div className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">{news.date}</div>
                                <h3 className="text-base md:text-xl font-bold text-white mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                    {news.title}
                                </h3>
                                <p className="text-gray-400 text-xs md:text-sm line-clamp-2">
                                    {news.excerpt}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section className="py-12 md:py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white text-center mb-8 md:mb-12">
                        รีวิวจาก <span className="text-primary">เกมเมอร์</span>
                    </h2>

                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                        {REVIEWS.map((review) => (
                            <div
                                key={review.id}
                                className="snap-center shrink-0 w-[280px] md:w-[350px] bg-[#1a1b26] p-5 md:p-6 rounded-2xl border border-white/5 relative hover:border-primary/30 transition-colors"
                            >
                                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                    <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden shrink-0 border border-white/10">
                                        <Image
                                            src={review.avatar}
                                            alt={review.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm md:text-base">{review.name}</div>
                                        <div className="flex text-yellow-500 text-xs md:text-sm">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} className={i < review.rating ? "fill-current" : "text-gray-600"} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-xs md:text-sm italic leading-relaxed">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Payment Support Section */}
            <section className="py-8 md:py-12 border-t border-white/5 bg-[#1a1b26]/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                        <div className="flex items-center gap-3">
                            <FaShieldAlt className="text-2xl md:text-3xl text-green-500" />
                            <div>
                                <div className="font-bold text-white text-sm md:text-base">ชำระเงินปลอดภัย 100%</div>
                                <div className="text-[10px] md:text-xs text-gray-400">รองรับทุกช่องทาง</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 md:gap-6 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Using text for payment methods as placeholders if logos aren't perfect */}
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
                                <FaCreditCard className="text-white text-sm md:text-base" />
                                <span className="text-xs md:text-sm font-bold">Credit/Debit</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
                                <span className="text-xs md:text-sm font-bold text-orange-500">TrueMoney</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
                                <span className="text-xs md:text-sm font-bold text-green-500">KPlus</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
                                <span className="text-xs md:text-sm font-bold text-blue-500">PromptPay</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
