'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getDashboardStats() {
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        const totalUsers = await prisma.user.count();
        const totalOrders = await prisma.transaction.count();
        const activeGames = await prisma.game.count({ where: { active: true } });

        // Calculate Total Revenue (Completed transactions only)
        const completedTransactions = await prisma.transaction.findMany({
            where: { status: 'COMPLETED' },
            select: { price: true }
        });
        const totalRevenue = completedTransactions.reduce((acc: number, curr: { price: number }) => acc + curr.price, 0);

        // Recent Transactions
        const recentTransactions = await prisma.transaction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { image: true, name: true, email: true } }, game: true, package: true }
        });

        return {
            data: {
                totalUsers,
                totalOrders,
                activeGames,
                totalRevenue,
                recentTransactions
            }
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { error: 'Failed to fetch dashboard stats' };
    }
}

export async function getRevenueChartData(period: 'year' | 'month' = 'year', year: number = new Date().getFullYear(), month?: number) {
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        let startDate: Date, endDate: Date;
        const chartData = [];

        if (period === 'year') {
            // Yearly View: Monthly data for the specific year
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59);

            const transactions = await prisma.transaction.findMany({
                where: {
                    status: 'COMPLETED',
                    createdAt: { gte: startDate, lte: endDate }
                },
                select: { createdAt: true, price: true }
            });

            const revenueMap: Record<number, number> = {};
            transactions.forEach((t: { createdAt: Date, price: number }) => {
                const m = t.createdAt.getMonth();
                revenueMap[m] = (revenueMap[m] || 0) + t.price;
            });

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            for (let i = 0; i < 12; i++) {
                chartData.push({
                    date: monthNames[i],
                    revenue: revenueMap[i] || 0
                });
            }

        } else {
            // Monthly View: Daily data for the specific month
            // month is 0-indexed in JS Date? detailed implementation: usually UI passes 1-12, let's normalize. 
            // Let's assume input month is 1-12.
            const targetMonth = (month || new Date().getMonth() + 1) - 1;
            startDate = new Date(year, targetMonth, 1);
            // End of month
            endDate = new Date(year, targetMonth + 1, 0, 23, 59, 59);

            const transactions = await prisma.transaction.findMany({
                where: {
                    status: 'COMPLETED',
                    createdAt: { gte: startDate, lte: endDate }
                },
                select: { createdAt: true, price: true }
            });

            const revenueMap: Record<number, number> = {};
            transactions.forEach((t: { createdAt: Date, price: number }) => {
                const d = t.createdAt.getDate();
                revenueMap[d] = (revenueMap[d] || 0) + t.price;
            });

            const daysInMonth = new Date(year, targetMonth + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                chartData.push({
                    date: i.toString(),
                    revenue: revenueMap[i] || 0
                });
            }
        }

        return { data: chartData };

    } catch (error) {
        return { error: 'Failed to fetch revenue data' };
    }
}

export async function getOrderStatusData() {
    // @ts-ignore
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        const statusCounts = await prisma.transaction.groupBy({
            by: ['status'],
            _count: { status: true }
        });

        const data = statusCounts.map((item: { status: string, _count: { status: number } }) => ({
            name: item.status,
            value: item._count.status
        }));

        return { data };
    } catch (error) {
        return { error: 'Failed to fetch status data' };
    }
}

export async function getUserGrowthData(period: 'year' | 'month' = 'year', year: number = new Date().getFullYear(), month?: number) {
    // @ts-ignore
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        let startDate: Date, endDate: Date;
        const chartData = [];

        if (period === 'year') {
            // Yearly View: Monthly data
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59);

            const users = await prisma.user.findMany({
                where: { createdAt: { gte: startDate, lte: endDate } },
                select: { createdAt: true }
            });

            const growthMap: Record<number, number> = {};
            users.forEach((u: { createdAt: Date }) => {
                const m = u.createdAt.getMonth();
                growthMap[m] = (growthMap[m] || 0) + 1;
            });

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            for (let i = 0; i < 12; i++) {
                chartData.push({
                    date: monthNames[i],
                    users: growthMap[i] || 0
                });
            }

        } else {
            // Monthly View: Daily data
            const targetMonth = (month || new Date().getMonth() + 1) - 1;
            startDate = new Date(year, targetMonth, 1);
            endDate = new Date(year, targetMonth + 1, 0, 23, 59, 59);

            const users = await prisma.user.findMany({
                where: { createdAt: { gte: startDate, lte: endDate } },
                select: { createdAt: true }
            });

            const growthMap: Record<number, number> = {};
            users.forEach((u: { createdAt: Date }) => {
                const d = u.createdAt.getDate();
                growthMap[d] = (growthMap[d] || 0) + 1;
            });

            const daysInMonth = new Date(year, targetMonth + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                chartData.push({
                    date: i.toString(),
                    users: growthMap[i] || 0
                });
            }
        }

        return { data: chartData };

    } catch (error) {
        return { error: 'Failed to fetch user growth data' };
    }
}
