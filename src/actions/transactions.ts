'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// --- Transactions CRUD ---

export async function getTransactions(status?: string) {
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        const where: any = {};
        if (status) {
            where.status = status;
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                user: {
                    select: { name: true, email: true }
                },
                game: {
                    select: { name: true }
                },
                package: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { data: transactions };
    } catch (error) {
        return { error: 'Failed to fetch transactions' };
    }
}

export async function createTransaction(data: {
    gameId: string;
    packageId: string;
    price: number;
    paymentId?: string;
}) {
    const session = await auth();
    if (!session || !session.user) {
        return { error: 'Unauthorized' };
    }

    try {
        const transaction = await prisma.transaction.create({
            data: {
                // @ts-ignore
                userId: session.user.id,
                gameId: data.gameId,
                packageId: data.packageId,
                price: data.price,
                paymentId: data.paymentId,
                status: 'PENDING'
            }
        });
        return { data: transaction };
    } catch (error) {
        console.error("Create Transaction Error:", error);
        return { error: 'Failed to create transaction' };
    }
}

export async function updateTransactionStatus(id: string, status: string, paymentId?: string) {
    // This action might need to be called by a webhook or admin
    // For safety, we check if it's admin OR internal call (if we had API keys)
    // For now, let's assume Admin or implicit internal Logic
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'admin') {
        // In real app, might want to allow system calls too
        return { error: 'Unauthorized' };
    }

    try {
        const updateData: any = { status };
        if (paymentId) updateData.paymentId = paymentId;

        const transaction = await prisma.transaction.update({
            where: { id },
            data: updateData
        });
        revalidatePath('/admin/transactions');
        return { data: transaction };
    } catch (error) {
        return { error: 'Failed to update transaction' };
    }
}
