'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaHistory, FaGamepad, FaCoins, FaSignOutAlt } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

// Mock Data
const HISTORY = [
    { id: 1, game: 'ROV', package: '1,200 Coupons', price: 350, status: 'Success', date: '2023-10-25 14:30' },
    { id: 2, game: 'PUBG Mobile', package: '60 UC', price: 29, status: 'Pending', date: '2023-10-26 09:15' },
    { id: 3, game: 'Free Fire', package: '100 Diamonds', price: 35, status: 'Failed', date: '2023-10-24 18:00' },
];

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const avatarUrl = user?.user_metadata?.avatar_url;
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User';
    const email = user?.email || 'No email provided';

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary p-1">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={fullName}
                                className="w-full h-full rounded-full object-cover border-4 border-black"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-4xl font-bold">
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{fullName}</h1>
                        <p className="text-gray-400 mb-4">{email}</p>
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                window.location.href = '/login';
                            }}
                            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-bold flex items-center gap-2"
                        >
                            <FaSignOutAlt />
                            ออกจากระบบ
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-card-bg border border-white/10 p-6 rounded-2xl flex items-center gap-4">
                        <div className="p-4 bg-primary/20 text-primary rounded-xl text-2xl"><FaGamepad /></div>
                        <div>
                            <div className="text-2xl font-bold">12</div>
                            <div className="text-sm text-gray-400">Top-ups</div>
                        </div>
                    </div>
                    <div className="bg-card-bg border border-white/10 p-6 rounded-2xl flex items-center gap-4">
                        <div className="p-4 bg-secondary/20 text-secondary rounded-xl text-2xl"><FaCoins /></div>
                        <div>
                            <div className="text-2xl font-bold">4,500 ฿</div>
                            <div className="text-sm text-gray-400">Total Spent</div>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FaHistory /> Transaction History
                </h2>

                <div className="bg-card-bg border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="p-4 font-bold">Game</th>
                                <th className="p-4 font-bold">Package</th>
                                <th className="p-4 font-bold">Price</th>
                                <th className="p-4 font-bold">Date</th>
                                <th className="p-4 font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {HISTORY.map((item) => (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">{item.game}</td>
                                    <td className="p-4">{item.package}</td>
                                    <td className="p-4">{item.price} ฿</td>
                                    <td className="p-4 text-gray-400">{item.date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold 
                      ${item.status === 'Success' ? 'bg-green-500/20 text-green-500' :
                                                item.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    'bg-red-500/20 text-red-500'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            <Footer />
        </div>
    );
}
