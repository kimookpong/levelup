'use client';

import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';

const TRANSACTIONS = [
    { id: 'TXN001', user: 'user1@example.com', amount: 350, game: 'ROV', status: 'Success', date: '2023-10-25' },
    { id: 'TXN002', user: 'user2@example.com', amount: 29, game: 'PUBG', status: 'Pending', date: '2023-10-26' },
    { id: 'TXN003', user: 'user3@example.com', amount: 1000, game: 'ROV', status: 'Success', date: '2023-10-26' },
];

export default function AdminTransactions() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <AdminSidebar />

            <main className="ml-64 pt-24 px-8">
                <h1 className="text-3xl font-bold mb-8">รายการธุรกรรม</h1>

                <div className="bg-card-bg border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="p-4 font-bold">รหัส</th>
                                <th className="p-4 font-bold">ผู้ใช้</th>
                                <th className="p-4 font-bold">เกม</th>
                                <th className="p-4 font-bold">จำนวนเงิน</th>
                                <th className="p-4 font-bold">สถานะ</th>
                                <th className="p-4 font-bold">วันที่</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TRANSACTIONS.map((txn) => (
                                <tr key={txn.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-xs text-gray-400">{txn.id}</td>
                                    <td className="p-4">{txn.user}</td>
                                    <td className="p-4">{txn.game}</td>
                                    <td className="p-4 font-bold">{txn.amount} ฿</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold 
                      ${txn.status === 'Success' ? 'bg-green-500/20 text-green-500' :
                                                txn.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    'bg-red-500/20 text-red-500'}`}>
                                            {txn.status === 'Success' ? 'สำเร็จ' : txn.status === 'Pending' ? 'รอดำเนินการ' : txn.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400">{txn.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
