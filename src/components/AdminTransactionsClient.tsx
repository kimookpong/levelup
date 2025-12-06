'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FaSync, FaSearch, FaCheck, FaTimes, FaEye } from 'react-icons/fa';

interface Transaction {
    id: string;
    user_id: string;
    game_id: string;
    package_id: string;
    player_id: string;
    amount: number;
    status: 'pending' | 'success' | 'failed';
    payment_method: string | null;
    omise_charge_id: string | null;
    created_at: string;
    users?: {
        email: string;
        full_name: string;
    };
    games?: {
        name: string;
    };
    packages?: {
        name: string;
    };
}

interface AdminTransactionsClientProps {
    initialTransactions: Transaction[];
}

export default function AdminTransactionsClient({ initialTransactions }: AdminTransactionsClientProps) {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const fetchTransactions = useCallback(async () => {
        setRefreshing(true);
        try {
            let query = supabase
                .from('transactions')
                .select('*, users(email, full_name), games(name), packages(name)')
                .order('created_at', { ascending: false });

            if (filterStatus) {
                query = query.eq('status', filterStatus);
            }

            const { data, error } = await query;
            if (error) throw error;
            if (data) setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setRefreshing(false);
        }
    }, [filterStatus]);

    // Helper function to ensure session is valid
    const ensureSession = async () => {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) console.error('Session refresh error:', refreshError);

        if (!session) {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) throw new Error('กรุณาเข้าสู่ระบบใหม่');
            return currentSession;
        }
        return session;
    };

    const handleUpdateStatus = async (id: string, newStatus: 'success' | 'failed') => {
        const confirmMsg = newStatus === 'success'
            ? 'ยืนยันว่าธุรกรรมนี้สำเร็จแล้ว?'
            : 'ยืนยันว่าธุรกรรมนี้ล้มเหลว?';

        if (!confirm(confirmMsg)) return;

        try {
            await ensureSession();

            const { error } = await supabase
                .from('transactions')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            await fetchTransactions();
            setSelectedTransaction(null);
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">สำเร็จ</span>;
            case 'pending':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">รอดำเนินการ</span>;
            case 'failed':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400">ล้มเหลว</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400">{status}</span>;
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredTransactions = transactions.filter(txn => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            txn.id.toLowerCase().includes(query) ||
            txn.player_id.toLowerCase().includes(query) ||
            txn.users?.email?.toLowerCase().includes(query) ||
            txn.users?.full_name?.toLowerCase().includes(query) ||
            txn.games?.name?.toLowerCase().includes(query)
        );
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2">รายการธุรกรรม</h1>
                    <p className="text-gray-400">ดูและจัดการธุรกรรมทั้งหมด</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ค้นหา..."
                            className="bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 w-64"
                        />
                        <FaSearch className="absolute left-3.5 top-3.5 text-gray-500" />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setTimeout(fetchTransactions, 100);
                        }}
                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                    >
                        <option value="">ทุกสถานะ</option>
                        <option value="pending">รอดำเนินการ</option>
                        <option value="success">สำเร็จ</option>
                        <option value="failed">ล้มเหลว</option>
                    </select>
                    <button
                        onClick={fetchTransactions}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        <FaSync className={refreshing ? 'animate-spin' : ''} />
                        รีเฟรช
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="glass rounded-2xl p-6 border border-white/10">
                    <p className="text-gray-400 text-sm">ทั้งหมด</p>
                    <p className="text-3xl font-bold text-white">{transactions.length}</p>
                </div>
                <div className="glass rounded-2xl p-6 border border-green-500/20">
                    <p className="text-gray-400 text-sm">สำเร็จ</p>
                    <p className="text-3xl font-bold text-green-400">
                        {transactions.filter(t => t.status === 'success').length}
                    </p>
                </div>
                <div className="glass rounded-2xl p-6 border border-yellow-500/20">
                    <p className="text-gray-400 text-sm">รอดำเนินการ</p>
                    <p className="text-3xl font-bold text-yellow-400">
                        {transactions.filter(t => t.status === 'pending').length}
                    </p>
                </div>
                <div className="glass rounded-2xl p-6 border border-primary/20">
                    <p className="text-gray-400 text-sm">ยอดรวม (สำเร็จ)</p>
                    <p className="text-3xl font-bold text-primary">
                        ฿{transactions.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="glass rounded-3xl overflow-hidden animate-fade-in-up shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">รหัส</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">ผู้ใช้</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">เกม / แพ็กเกจ</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">Player ID</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">จำนวนเงิน</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">สถานะ</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">วันที่</th>
                            <th className="p-6 font-bold text-gray-300 uppercase tracking-wider text-sm text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredTransactions.map((txn) => (
                            <tr key={txn.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-6">
                                    <span className="font-mono text-xs text-gray-400">
                                        {txn.id.slice(0, 8)}...
                                    </span>
                                </td>
                                <td className="p-6">
                                    <div>
                                        <p className="font-medium text-white">{txn.users?.full_name || '-'}</p>
                                        <p className="text-xs text-gray-400">{txn.users?.email}</p>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div>
                                        <p className="font-medium text-white">{txn.games?.name || '-'}</p>
                                        <p className="text-xs text-gray-400">{txn.packages?.name}</p>
                                    </div>
                                </td>
                                <td className="p-6 font-mono text-sm text-gray-300">{txn.player_id}</td>
                                <td className="p-6 font-bold text-primary">{txn.amount.toLocaleString()} ฿</td>
                                <td className="p-6">{getStatusBadge(txn.status)}</td>
                                <td className="p-6 text-gray-400 text-sm">{formatDate(txn.created_at)}</td>
                                <td className="p-6 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setSelectedTransaction(txn)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="ดูรายละเอียด"
                                    >
                                        <FaEye />
                                    </button>
                                    {txn.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(txn.id, 'success')}
                                                className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                                                title="อนุมัติ"
                                            >
                                                <FaCheck />
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(txn.id, 'failed')}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="ปฏิเสธ"
                                            >
                                                <FaTimes />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredTransactions.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-gray-500">
                                    ไม่พบข้อมูลธุรกรรม
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a1b26] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in-up">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-2xl font-bold text-white">รายละเอียดธุรกรรม</h2>
                            <button onClick={() => setSelectedTransaction(null)} className="text-gray-400 hover:text-white">
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">รหัสธุรกรรม</p>
                                    <p className="text-white font-mono text-sm">{selectedTransaction.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">สถานะ</p>
                                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">ผู้ใช้</p>
                                    <p className="text-white">{selectedTransaction.users?.full_name || '-'}</p>
                                    <p className="text-gray-400 text-xs">{selectedTransaction.users?.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Player ID</p>
                                    <p className="text-white font-mono">{selectedTransaction.player_id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">เกม</p>
                                    <p className="text-white">{selectedTransaction.games?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">แพ็กเกจ</p>
                                    <p className="text-white">{selectedTransaction.packages?.name || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">จำนวนเงิน</p>
                                    <p className="text-2xl font-bold text-primary">{selectedTransaction.amount.toLocaleString()} ฿</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">วิธีชำระเงิน</p>
                                    <p className="text-white">{selectedTransaction.payment_method || '-'}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm">วันที่สร้าง</p>
                                <p className="text-white">{formatDate(selectedTransaction.created_at)}</p>
                            </div>

                            {selectedTransaction.omise_charge_id && (
                                <div>
                                    <p className="text-gray-400 text-sm">Omise Charge ID</p>
                                    <p className="text-white font-mono text-sm">{selectedTransaction.omise_charge_id}</p>
                                </div>
                            )}

                            {selectedTransaction.status === 'pending' && (
                                <div className="flex gap-3 pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => handleUpdateStatus(selectedTransaction.id, 'success')}
                                        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaCheck /> อนุมัติ
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedTransaction.id, 'failed')}
                                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaTimes /> ปฏิเสธ
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
