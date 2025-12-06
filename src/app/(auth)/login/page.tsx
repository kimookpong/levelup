'use client';

import { supabase } from '@/lib/supabase/client';
import { FaGoogle, FaFacebook, FaLine, FaGamepad, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function LoginPage() {
    const handleLogin = async (provider: 'google' | 'facebook' | 'line') => {
        await supabase.auth.signInWithOAuth({
            provider: provider as any,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />

            {/* Back to Home Button */}
            <Link
                href="/"
                className="absolute top-8 left-8 z-20 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span>กลับสู่หน้าหลัก</span>
            </Link>

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="glass p-8 rounded-3xl shadow-2xl border border-white/10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4 box-glow">
                            <FaGamepad className="text-3xl" />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-white mb-2">ยินดีต้อนรับกลับมา</h1>
                        <p className="text-gray-400">เข้าสู่ระบบเพื่อเริ่มการผจญภัยของคุณ</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => handleLogin('google')}
                            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors transform hover:scale-[1.02] cursor-pointer"
                        >
                            <FaGoogle className="text-xl text-red-500" />
                            เข้าสู่ระบบด้วย Google
                        </button>
                        <button
                            onClick={() => handleLogin('facebook')}
                            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-bold py-3 rounded-xl hover:bg-[#166fe5] transition-colors transform hover:scale-[1.02] cursor-pointer"
                        >
                            <FaFacebook className="text-xl" />
                            เข้าสู่ระบบด้วย Facebook
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        การเข้าสู่ระบบถือว่าคุณยอมรับ <a href="#" className="text-primary hover:underline">ข้อกำหนดการให้บริการ</a> และ <a href="#" className="text-primary hover:underline">นโยบายความเป็นส่วนตัว</a> ของเรา
                    </div>
                </div>
            </div>
        </div>
    );
}
