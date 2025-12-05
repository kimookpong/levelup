'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaGamepad, FaBox, FaHistory, FaTags, FaComments, FaSignOutAlt, FaHome, FaUsers, FaTimes } from 'react-icons/fa';

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { path: '/admin', icon: <FaHome />, label: 'หน้าแรก' },
        { path: '/admin/games', icon: <FaGamepad />, label: 'จัดการเกม' },
        { path: '/admin/packages', icon: <FaBox />, label: 'จัดการแพ็กเกจ' },
        { path: '/admin/transactions', icon: <FaHistory />, label: 'รายการธุรกรรม' },
        { path: '/admin/promotions', icon: <FaTags />, label: 'โปรโมชั่น' },
        { path: '/admin/users', icon: <FaUsers />, label: 'ผู้ใช้งาน' },
        { path: '/admin/chat', icon: <FaComments />, label: 'แชทช่วยเหลือ' },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-64 bg-[#0f1014] border-r border-white/10 pt-24 transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:bg-black/50 lg:backdrop-blur-xl
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="px-6 mb-8 flex items-center justify-between">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">เมนู</h2>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
                        <FaTimes />
                    </button>
                </div>

                <nav className="space-y-1 px-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-primary/20 text-primary font-bold shadow-[0_0_15px_rgba(255,0,85,0.2)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className={`text-lg ${isActive(item.path) ? 'text-primary' : 'text-gray-500 group-hover:text-white'}`}>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                            {isActive(item.path) && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_currentColor]" />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-8 w-full px-4">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors group">
                        <FaSignOutAlt className="group-hover:translate-x-1 transition-transform" />
                        <span>ออกจากระบบ</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
