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
    image_url?: string;
    link?: string;
    active: boolean;
    // Coupon Data
    code?: string;
    discount_type?: string;
    discount_value?: number;
    usage_limit?: number;
    expires_at?: Date;
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
                image_url: data.image_url || null,
                link: data.link || null,
                active: data.active,
                code: data.code || null,
                discount_type: data.discount_type || 'FIXED',
                discount_value: data.discount_value || 0,
                usage_limit: data.usage_limit || null,
                expires_at: data.expires_at || null
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
    image_url?: string | null;
    link?: string | null;
    active?: boolean;
    // Coupon Data
    code?: string | null;
    discount_type?: string;
    discount_value?: number;
    usage_limit?: number | null;
    expires_at?: Date | null;
    usage_count?: number;
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

export async function validatePromotion(code: string) {
    try {
        const promotion = await prisma.promotion.findUnique({
            where: { code }
        });

        if (!promotion) return { error: 'Invalid code' };
        if (!promotion.active) return { error: 'Promotion is inactive' };
        if (promotion.expires_at && new Date() > promotion.expires_at) return { error: 'Promotion expired' };
        if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) return { error: 'Usage limit reached' };

        return {
            data: {
                code: promotion.code,
                discount_type: promotion.discount_type,
                discount_value: promotion.discount_value
            }
        };
    } catch (error) {
        return { error: 'Verification failed' };
    }
}
