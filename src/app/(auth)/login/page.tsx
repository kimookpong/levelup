'use client';

import { useState } from 'react';
import { FaGoogle, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setLoading(true);
        await signIn('google', { callbackUrl: '/' });
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0f1014] text-white flex flex-col relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors group">
                        <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        กลับสู่หน้าหลัก
                    </Link>

                    <div className="bg-[#1a1b26] border border-white/10 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">พอร์ตโฟลิโอ</h1>
                            <p className="text-gray-400">เข้าสู่ระบบเพื่อจัดการข้อมูล</p>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mb-6"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <FaGoogle className="text-xl" />
                            )}
                            เข้าสู่ระบบด้วย Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
