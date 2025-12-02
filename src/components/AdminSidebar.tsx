'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaGamepad, FaBox, FaHistory, FaTags, FaComments, FaSignOutAlt } from 'react-icons/fa';

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { path: '/admin', icon: <FaGamepad />, label: 'จัดการเกม' },
        { path: '/admin/packages', icon: <FaBox />, label: 'จัดการแพ็กเกจ' },
        { path: '/admin/transactions', icon: <FaHistory />, label: 'รายการธุรกรรม' },
        { path: '/admin/promotions', icon: <FaTags />, label: 'โปรโมชั่น' },
        { path: '/admin/chat', icon: <FaComments />, label: 'แชทช่วยเหลือ' },
    ];

    return (
        <aside className="w-64 bg-black/50 backdrop-blur-xl border-r border-white/10 min-h-screen fixed left-0 top-0 pt-24 z-40">
            <div className="px-6 mb-8">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">เมนู</h2>
            </div>

            <nav className="space-y-1 px-4">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
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
    );
}
