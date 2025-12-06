'use client';
import React from 'react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaHistory, FaGamepad, FaCoins, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';
import { signOut } from 'next-auth/react';

// Mock Data (Removed)

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [transactions, setTransactions] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const avatarUrl = user?.image;
    const fullName = user?.name || 'User';
    const email = user?.email || 'No email provided';

    React.useEffect(() => {
        if (!user) return;

        async function fetchHistory() {
            setLoading(true);
            try {
                const { getUserTransactions } = await import('@/actions/transactions');
                const { data } = await getUserTransactions();
                if (data) setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [user]);

    const totalSpent = transactions.reduce((acc, curr) => acc + (curr.status === 'COMPLETED' ? curr.price : 0), 0);
    const successCount = transactions.filter(t => t.status === 'COMPLETED').length;

    if (authLoading || (loading && !transactions.length)) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6 mb-12">
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary p-1">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={fullName}
                                fill
                                sizes="96px"
                                className="rounded-full object-cover border-4 border-black"
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
                            onClick={() => signOut()}
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
                            <div className="text-2xl font-bold">{successCount}</div>
                            <div className="text-sm text-gray-400">Total Top-ups</div>
                        </div>
                    </div>
                    <div className="bg-card-bg border border-white/10 p-6 rounded-2xl flex items-center gap-4">
                        <div className="p-4 bg-secondary/20 text-secondary rounded-xl text-2xl"><FaCoins /></div>
                        <div>
                            <div className="text-2xl font-bold">{totalSpent.toLocaleString()} ฿</div>
                            <div className="text-sm text-gray-400">Total Spent</div>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FaHistory /> Transaction History
                </h2>

                <div className="bg-card-bg border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="p-4 font-bold whitespace-nowrap">Game</th>
                                    <th className="p-4 font-bold whitespace-nowrap">Package</th>
                                    <th className="p-4 font-bold whitespace-nowrap">Price</th>
                                    <th className="p-4 font-bold whitespace-nowrap">Date</th>
                                    <th className="p-4 font-bold whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            No transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((item) => (
                                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 whitespace-nowrap">{item.game.name}</td>
                                            <td className="p-4 whitespace-nowrap">{item.package.name}</td>
                                            <td className="p-4 font-mono whitespace-nowrap">{item.price.toLocaleString()} {item.currency}</td>
                                            <td className="p-4 text-gray-400 whitespace-nowrap">
                                                {new Date(item.createdAt).toLocaleString('th-TH')}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded text-xs font-bold 
                          ${item.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' :
                                                        item.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                                            'bg-red-500/20 text-red-500'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
