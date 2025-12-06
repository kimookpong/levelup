'use client';

import { useState, useCallback, useEffect } from 'react';
import { getTransactions, updateTransactionStatus } from '@/actions/transactions';
import { FaCheckCircle, FaTimesCircle, FaClock, FaSearch } from 'react-icons/fa';

interface Transaction {
    id: string;
    userId: string | null;
    gameId: string;
    packageId: string;
    price: number;
    currency: string;
    status: string;
    paymentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    user?: { name: string | null; email: string };
    game: { name: string };
    package: { name: string };
}

export default function AdminTransactionsClient() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getTransactions();
            // @ts-ignore
            if (data) setTransactions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleStatusUpdate = async (id: string, status: string) => {
        if (!confirm(`ต้องการเปลี่ยนสถานะเป็น ${status}?`)) return;
        try {
            await updateTransactionStatus(id, status);
            fetchTransactions();
        } catch (error) {
            alert('Update failed');
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'COMPLETED':
                return <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg text-xs border border-emerald-400/20"><FaCheckCircle /> สำเร็จ</span>;
            case 'FAILED':
                return <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-lg text-xs border border-red-400/20"><FaTimesCircle /> ล้มเหลว</span>;
            default:
                return <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg text-xs border border-yellow-400/20"><FaClock /> รอตรวจสอบ</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">ยอดขาย / ธุรกรรม</h2>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-500" />
                    <input
                        type="text"
                        placeholder="ค้นหา..."
                        className="bg-[#1a1b26] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-[#1a1b26] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-black/20 text-gray-400 text-left text-sm">
                                <th className="p-4">วันที่</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Game / Package</th>
                                <th className="p-4">ยอดเงิน</th>
                                <th className="p-4">Payment Ref</th>
                                <th className="p-4">สถานะ</th>
                                <th className="p-4">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">ไม่พบรายการ</td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-sm text-gray-400">
                                            {new Date(tx.createdAt).toLocaleString('th-TH')}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-white font-medium">{tx.user?.name || 'Guest'}</div>
                                            <div className="text-xs text-gray-500">{tx.user?.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-emerald-400">{tx.game.name}</div>
                                            <div className="text-xs text-gray-400">{tx.package.name}</div>
                                        </td>
                                        <td className="p-4 font-mono text-white">
                                            {tx.price.toLocaleString()} {tx.currency}
                                        </td>
                                        <td className="p-4 text-xs font-mono text-gray-500">
                                            {tx.paymentId || '-'}
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={tx.status} />
                                        </td>
                                        <td className="p-4">
                                            {tx.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(tx.id, 'COMPLETED')}
                                                        className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
                                                        title="Mark as Completed"
                                                    >
                                                        <FaCheckCircle />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(tx.id, 'FAILED')}
                                                        className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                                                        title="Mark as Failed"
                                                    >
                                                        <FaTimesCircle />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
