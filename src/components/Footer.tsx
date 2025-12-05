import Image from 'next/image';
import { FaFacebook, FaTwitter, FaInstagram, FaDiscord, FaGamepad } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="bg-black/80 border-t border-white/5 py-16 mt-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center text-2xl font-display font-bold text-white mb-6">
                            <Image
                                src="/logo.png"
                                alt="Level Up Logo"
                                width={60}
                                height={60}
                                className="relative z-10 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                            />
                            <span className="tracking-wider">LEVEL<span className="text-primary">UP</span></span>
                        </div>
                        <p className="text-gray-400 max-w-sm leading-relaxed">
                            จุดหมายปลายทางสูงสุดสำหรับการเติมเกมทันที ปลอดภัย รวดเร็ว และเชื่อถือได้สำหรับเกมโปรดของคุณ ยกระดับประสบการณ์การเล่นเกมของคุณวันนี้
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-6 font-display tracking-wide">ช่วยเหลือ</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li><a href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">ศูนย์ช่วยเหลือ</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">ข้อกำหนดการใช้งาน</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">นโยบายความเป็นส่วนตัว</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">ติดต่อเรา</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-6 font-display tracking-wide">ติดตามเรา</h3>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all hover:scale-110"><FaFacebook /></a>
                            <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1DA1F2] transition-all hover:scale-110"><FaTwitter /></a>
                            <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#E1306C] transition-all hover:scale-110"><FaInstagram /></a>
                            <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#5865F2] transition-all hover:scale-110"><FaDiscord /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-16 pt-8 text-center text-gray-600 text-sm">
                    &copy; {new Date().getFullYear()} LevelUp. สงวนลิขสิทธิ์.
                </div>
            </div>
        </footer>
    );
}
