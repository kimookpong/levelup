'use client';

import { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { FaUsers, FaGamepad, FaMoneyBillWave, FaChartLine, FaShoppingBag, FaFilter } from 'react-icons/fa';
import { getRevenueChartData, getUserGrowthData } from '@/actions/dashboard';

interface DashboardStats {
    totalUsers: number;
    totalOrders: number;
    activeGames: number;
    totalRevenue: number;
    recentTransactions: any[];
}

interface AdminDashboardClientProps {
    stats: DashboardStats;
    revenueData: any[]; // Initial Data
    statusData: any[];
    userGrowthData: any[]; // Initial Data
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = [2024, 2025]; // Add more if needed or dynamic

export default function AdminDashboardClient({
    stats,
    revenueData: initialRevenue,
    statusData,
    userGrowthData: initialUserGrowth
}: AdminDashboardClientProps) {

    const [revenueData, setRevenueData] = useState(initialRevenue);
    const [userGrowthData, setUserGrowthData] = useState(initialUserGrowth);

    // Filter State
    const [period, setPeriod] = useState<'year' | 'month'>('year');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [revRes, userRes] = await Promise.all([
                    getRevenueChartData(period, selectedYear, period === 'month' ? selectedMonth : undefined),
                    getUserGrowthData(period, selectedYear, period === 'month' ? selectedMonth : undefined)
                ]);

                if (revRes.data) setRevenueData(revRes.data);
                if (userRes.data) setUserGrowthData(userRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period, selectedYear, selectedMonth]); // Re-fetch when filters change

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1a1b26] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <h3 className="text-gray-400 text-sm mb-1">รายได้รวม</h3>
                        <div className="text-3xl font-bold text-white">฿{stats.totalRevenue.toLocaleString()}</div>
                        <div className="text-emerald-500 text-xs mt-2 flex items-center gap-1">
                            <span className="text-gray-500">Total Lifetime</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 text-xl">
                        <FaMoneyBillWave />
                    </div>
                </div>

                <div className="bg-[#1a1b26] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <h3 className="text-gray-400 text-sm mb-1">คำสั่งซื้อทั้งหมด</h3>
                        <div className="text-3xl font-bold text-white">{stats.totalOrders}</div>
                        <div className="text-blue-500 text-xs mt-2 flex items-center gap-1">
                            <span className="text-gray-500">Transactions</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 text-xl">
                        <FaShoppingBag />
                    </div>
                </div>

                <div className="bg-[#1a1b26] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <h3 className="text-gray-400 text-sm mb-1">ผู้ใช้งาน</h3>
                        <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                        <div className="text-purple-500 text-xs mt-2 flex items-center gap-1">
                            <span className="text-gray-500">Registered Users</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-500 text-xl">
                        <FaUsers />
                    </div>
                </div>

                <div className="bg-[#1a1b26] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <h3 className="text-gray-400 text-sm mb-1">เกมที่เปิดให้บริการ</h3>
                        <div className="text-3xl font-bold text-white">{stats.activeGames}</div>
                        <div className="text-orange-500 text-xs mt-2 flex items-center gap-1">
                            <span className="text-gray-500">Active Games</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 text-xl">
                        <FaGamepad />
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-end items-center bg-[#1a1b26] p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-gray-400">
                    <FaFilter /> <span className="text-sm">ตัวกรอง:</span>
                </div>

                <div className="flex gap-2 bg-black/20 p-1 rounded-xl">
                    <button
                        onClick={() => setPeriod('year')}
                        className={`px-4 py-1.5 rounded-lg text-sm transition-all ${period === 'year' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        รายปี (Yearly)
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={`px-4 py-1.5 rounded-lg text-sm transition-all ${period === 'month' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        รายเดือน (Monthly)
                    </button>
                </div>

                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-black/20 border border-white/10 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500"
                >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                {period === 'month' && (
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="bg-black/20 border border-white/10 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500"
                    >
                        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                )}
            </div>


            {/* Charts Row 1: Revenue & User Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1b26] border border-white/10 p-6 rounded-2xl relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">
                            รายได้ {period === 'year' ? `ปี ${selectedYear}` : `${MONTHS[selectedMonth - 1]} ${selectedYear}`}
                        </h3>
                        {loading && <div className="text-emerald-500 text-xs animate-pulse">Updating...</div>}
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `฿${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1a1b26] border border-white/10 p-6 rounded-2xl relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">
                            ผู้ใช้งานใหม่ {period === 'year' ? `ปี ${selectedYear}` : `${MONTHS[selectedMonth - 1]} ${selectedYear}`}
                        </h3>
                        {loading && <div className="text-emerald-500 text-xs animate-pulse">Updating...</div>}
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#333' }}
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2: Status & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-[#1a1b26] border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-6">สัดส่วนสถานะคำสั่งซื้อ</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-[#1a1b26] border border-white/10 p-6 rounded-2xl overflow-hidden">
                    <h3 className="text-lg font-bold text-white mb-6">รายการล่าสุด</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/20 text-gray-400 text-sm">
                                <tr>
                                    <th className="p-3">User</th>
                                    <th className="p-3">Item</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {stats.recentTransactions.map((t: any) => (
                                    <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                        <td className="p-3 text-white">{t.user?.name || 'Guest'}</td>
                                        <td className="p-3 text-gray-400">{t.game.name} - {t.package.name}</td>
                                        <td className="p-3 text-emerald-400">฿{t.price.toLocaleString()}</td>
                                        <td className="p-3 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500' :
                                                t.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    'bg-red-500/20 text-red-500'
                                                }`}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
