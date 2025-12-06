'use client';

import { useState } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all hover:scale-110"
                >
                    <FaComments className="text-white text-2xl" />
                </button>
            )}

            {isOpen && (
                <div className="bg-[#1a1b26] border border-white/10 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
                    <div className="p-4 bg-primary/10 border-b border-white/5 flex items-center justify-between">
                        <div className="font-bold text-white flex items-center gap-2">
                            <FaComments className="text-primary" />
                            Live Chat (ปิดปรับปรุง)
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4 text-center">
                        <FaComments className="text-4xl text-gray-600" />
                        <p className="text-gray-400">ระบบแชทกำลังอยู่ระหว่างการปรับปรุง<br />เพื่อให้บริการที่ดียิ่งขึ้น</p>
                        {!user && (
                            <Link
                                href="/login"
                                className="text-primary hover:underline text-sm font-bold"
                            >
                                เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
