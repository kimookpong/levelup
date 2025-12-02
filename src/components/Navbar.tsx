'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { FaGamepad, FaUser, FaSignOutAlt, FaBars, FaTimes, FaSearch, FaChevronDown } from 'react-icons/fa';
import Image from 'next/image';

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0f1014]/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Left Side: Logo & Menu */}
                    <div className="flex items-center gap-12">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10">

                                <FaGamepad className="text-primary text-4xl relative z-10 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-wide">LEVEL<span className="text-primary">UP</span></span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-8">
                            <Link href="/" className="text-white relative py-2 group">
                                <span className="font-medium">หน้าแรก</span>
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                            </Link>
                            <Link href="/games" className="text-gray-400 hover:text-white transition-colors font-medium">
                                เติมเกม
                            </Link>
                            <Link href="/cards" className="text-gray-400 hover:text-white transition-colors font-medium">
                                บัตรเติมเงิน
                            </Link>
                            <Link href="/support" className="text-gray-400 hover:text-white transition-colors font-medium">
                                ช่วยเหลือ
                            </Link>
                        </div>
                    </div>

                    {/* Right Side: Search, Currency, User */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="relative hidden xl:block w-80">
                            <input
                                type="text"
                                placeholder="ค้นหาเกม / บัตรเติมเงิน..."
                                className="w-full bg-[#0a0b0e] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all"
                            />
                            <FaSearch className="absolute left-3.5 top-3 text-gray-500 text-sm" />
                        </div>

                        {/* Currency Selector */}
                        <button className="flex items-center gap-2 bg-[#0a0b0e] border border-white/10 rounded-lg px-3 py-2.5 hover:border-white/20 transition-colors">
                            <div className="w-5 h-3.5 bg-red-800 relative overflow-hidden rounded-[2px]">
                                <div className="absolute inset-x-0 top-[33%] bottom-[33%] bg-blue-900" />
                            </div>
                            <span className="text-sm font-bold text-white">THB</span>
                        </button>

                        {/* User Profile */}
                        {user ? (
                            <div className="relative pl-2">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-10 h-10 rounded-full bg-[#1a1b26] border border-white/10 flex items-center justify-center hover:border-primary/50 transition-all group overflow-hidden focus:outline-none"
                                >
                                    {user.user_metadata?.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt="User Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FaUser className="text-gray-400 group-hover:text-white transition-colors" />
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#0f1014] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                                        <div className="py-1">
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <FaUser className="text-primary" />
                                                โปรไฟล์
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-white/5 transition-colors text-left"
                                            >
                                                <FaSignOutAlt />
                                                ออกจากระบบ
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="w-10 h-10 rounded-full bg-[#1a1b26] border border-white/10 flex items-center justify-center hover:border-primary/50 transition-all group"
                            >
                                <FaUser className="text-gray-400 group-hover:text-white transition-colors" />
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-300 hover:text-white p-2"
                        >
                            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-[#0f1014] border-t border-white/10 absolute w-full">
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-white/5">หน้าแรก</Link>
                        <Link href="/games" className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-white/5">เติมเกม</Link>
                        <Link href="/cards" className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-white/5">บัตรเติมเงิน</Link>
                        <Link href="/support" className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-white/5">ช่วยเหลือ</Link>

                        <div className="border-t border-white/10 my-4 pt-4">
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="ค้นหาเกม..."
                                    className="w-full bg-[#0a0b0e] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white"
                                />
                                <FaSearch className="absolute left-3.5 top-3 text-gray-500 text-sm" />
                            </div>

                            {user ? (
                                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-white/5">ออกจากระบบ</button>
                            ) : (
                                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-white/5">เข้าสู่ระบบ</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
