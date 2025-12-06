'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// --- News CRUD ---

export async function getAllNews() {
    try {
        const news = await prisma.news.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { data: news };
    } catch (error) {
        return { error: 'Failed to fetch news' };
    }
}

export async function createNews(data: {
    title: string;
    image_url: string;
    content: string;
    active: boolean;
}) {
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        const news = await prisma.news.create({
            data: {
                title: data.title,
                image_url: data.image_url,
                content: data.content,
                active: data.active
            }
        });
        revalidatePath('/admin/news');
        revalidatePath('/news');
        return { data: news };
    } catch (error) {
        return { error: 'Failed to create news' };
    }
}

export async function updateNews(id: string, data: {
    title?: string;
    image_url?: string;
    content?: string;
    active?: boolean;
}) {
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        const news = await prisma.news.update({
            where: { id },
            data
        });
        revalidatePath('/admin/news');
        revalidatePath('/news');
        return { data: news };
    } catch (error) {
        return { error: 'Failed to update news' };
    }
}

export async function deleteNews(id: string) {
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        await prisma.news.delete({
            where: { id }
        });
        revalidatePath('/admin/news');
        revalidatePath('/news');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete news' };
    }
}
