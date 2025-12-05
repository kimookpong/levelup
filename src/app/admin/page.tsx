import { createServerClient } from '@/lib/supabase/server';
import { FaUsers, FaGamepad, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

export default async function AdminDashboard() {
    const supabase = await createServerClient();

    // Fetch Stats
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: gamesCount } = await supabase.from('games').select('*', { count: 'exact', head: true });
    const { data: transactions } = await supabase.from('transactions').select('amount').eq('status', 'success');

    const totalSales = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const stats = [
        {
            title: 'ผู้ใช้งานทั้งหมด',
            value: usersCount || 0,
            icon: FaUsers,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-400/20'
        },
        {
            title: 'ยอดขายรวม',
            value: `฿${totalSales.toLocaleString()}`,
            icon: FaMoneyBillWave,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
            border: 'border-green-400/20'
        },
        {
            title: 'เกมทั้งหมด',
            value: gamesCount || 0,
            icon: FaGamepad,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            border: 'border-purple-400/20'
        },
        {
            title: 'รายการวันนี้',
            value: '0', // Placeholder for daily stats
            icon: FaChartLine,
            color: 'text-orange-400',
            bg: 'bg-orange-400/10',
            border: 'border-orange-400/20'
        }
    ];

    return (
        <div>
            <div className="mb-8 animate-fade-in">
                <h1 className="text-4xl font-display font-bold text-white mb-2">Dashboard</h1>
                <p className="text-gray-400">ภาพรวมของระบบ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className={`glass p-6 rounded-2xl border ${stat.border} animate-fade-in-up`} style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`text-2xl ${stat.color}`} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.bg} ${stat.color}`}>
                                +0%
                            </span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="glass rounded-3xl p-8 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">กิจกรรมล่าสุด</h2>
                <div className="text-center py-12 text-gray-500">
                    ยังไม่มีข้อมูลกิจกรรมล่าสุด
                </div>
            </div>
        </div>
    );
}
