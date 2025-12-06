'use client';

import { useState } from 'react';
import { updateTransactionStatus } from '@/actions/transactions';
import { FaSearch, FaFilter, FaCheckCircle, FaTimesCircle, FaClock, FaEye } from 'react-icons/fa';

interface Transaction {
    id: string;
    userId: string | null;
    gameId: string;
    packageId: string;
    price: number;
    currency: string;
    status: string;
    paymentId: string | null;
    promotionCode: string | null;
    discount: number | null;
    createdAt: Date;
    updatedAt: Date;
    user: { name: string | null; email: string | null } | null;
    game: { name: string };
    package: { name: string };
}

interface AdminTransactionsClientProps {
    initialTransactions: Transaction[];
}

export default function AdminTransactionsClient({ initialTransactions }: AdminTransactionsClientProps) {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [loading, setLoading] = useState<string | null>(null);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
        setLoading(id);
        try {
            const res = await updateTransactionStatus(id, newStatus);
            if (res.data) {
                setTransactions(transactions.map(t => t.id === id ? { ...t, status: newStatus } : t));
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
        } finally {
            setLoading(null);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch =
            (t.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.game.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'PENDING': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'FAILED': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-white hidden md:block">รายการคำสั่งซื้อ</h2>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ค้นหา Order ID, Email, Game..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 bg-[#1a1b26] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full md:w-40 bg-[#1a1b26] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none"
                        >
                            <option value="ALL">สถานะทั้งหมด</option>
                            <option value="COMPLETED">สำเร็จ</option>
                            <option value="PENDING">รอดำเนินการ</option>
                            <option value="FAILED">ล้มเหลว</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-[#1a1b26] rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-gray-400 text-sm uppercase font-medium">
                            <tr>
                                <th className="p-4 min-w-[120px]">Order ID</th>
                                <th className="p-4 min-w-[200px]">User</th>
                                <th className="p-4 min-w-[150px]">Game/Package</th>
                                <th className="p-4 min-w-[100px]">Amount</th>
                                <th className="p-4 min-w-[120px]">Status</th>
                                <th className="p-4 min-w-[150px]">Date</th>
                                <th className="p-4 text-right min-w-[120px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-white/5">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-xs text-gray-500">
                                        {t.id.slice(0, 8)}...
                                    </td>
                                    <td className="p-4">
                                        <div className="text-white font-medium">{t.user?.name || 'Guest'}</div>
                                        <div className="text-gray-500 text-xs">{t.user?.email || '-'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-emerald-400">{t.game.name}</div>
                                        <div className="text-gray-400 text-xs">{t.package.name}</div>
                                    </td>
                                    <td className="p-4 text-white font-medium">
                                        ฿{t.price.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(t.status)}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400 text-xs">
                                        {new Date(t.createdAt).toLocaleString('th-TH')}
                                    </td>
                                    <td className="p-4 text-right">
                                        {t.status === 'PENDING' && (
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(t.id, 'COMPLETED')}
                                                    disabled={loading === t.id}
                                                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                                                    title="Mark as Completed"
                                                >
                                                    <FaCheckCircle />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(t.id, 'FAILED')}
                                                    disabled={loading === t.id}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                    title="Mark as Failed"
                                                >
                                                    <FaTimesCircle />
                                                </button>
                                            </div>
                                        )}
                                        {t.status !== 'PENDING' && (
                                            <div className="text-gray-600 text-xs italic">
                                                No Actions
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        ไม่พบข้อมูลรายการสั่งซื้อ
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
