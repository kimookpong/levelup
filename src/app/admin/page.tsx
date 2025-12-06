import { getDashboardStats, getRevenueChartData, getOrderStatusData, getUserGrowthData } from '@/actions/dashboard';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboard() {
    const statsRes = await getDashboardStats();
    const revenueRes = await getRevenueChartData();
    const statusRes = await getOrderStatusData();
    const userGrowthRes = await getUserGrowthData();

    if (statsRes.error || revenueRes.error || statusRes.error || userGrowthRes.error) {
        return (
            <div className="p-8 text-red-500">
                Failed to load dashboard data.
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-white">ภาพรวมระบบ (System Overview)</h1>
            <AdminDashboardClient
                stats={statsRes.data!}
                revenueData={revenueRes.data!}
                statusData={statusRes.data!}
                userGrowthData={userGrowthRes.data!}
            />
        </div>
    );
}
