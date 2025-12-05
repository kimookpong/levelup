'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import { FaBars } from 'react-icons/fa';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white">
            <Navbar />

            {/* Mobile Header for Sidebar Toggle */}
            <div className="lg:hidden fixed top-20 left-0 right-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <FaBars />
                    <span className="text-sm font-bold uppercase tracking-wider">เมนูแอดมิน</span>
                </button>
            </div>

            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="lg:ml-64 pt-32 lg:pt-28 px-4 lg:px-8 pb-12 transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
