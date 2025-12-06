'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// --- Promotions CRUD ---

export async function getPromotions() {
    try {
        const promotions = await prisma.promotion.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { data: promotions };
    } catch (error) {
        return { error: 'Failed to fetch promotions' };
    }
}

export async function createPromotion(data: {
    title: string;
    image_url: string;
    link?: string;
    active: boolean;
}) {
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        const promotion = await prisma.promotion.create({
            data: {
                title: data.title,
                image_url: data.image_url,
                link: data.link,
                active: data.active
            }
        });
        revalidatePath('/admin/promotions');
        return { data: promotion };
    } catch (error) {
        return { error: 'Failed to create promotion' };
    }
}

export async function updatePromotion(id: string, data: {
    title?: string;
    image_url?: string;
    link?: string;
    active?: boolean;
}) {
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        const promotion = await prisma.promotion.update({
            where: { id },
            data
        });
        revalidatePath('/admin/promotions');
        return { data: promotion };
    } catch (error) {
        return { error: 'Failed to update promotion' };
    }
}

export async function deletePromotion(id: string) {
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        await prisma.promotion.delete({
            where: { id }
        });
        revalidatePath('/admin/promotions');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete promotion' };
    }
}
