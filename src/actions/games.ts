'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function getGames() {
    try {
        const games = await prisma.game.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { data: games };
    } catch (error) {
        return { error: 'Failed to fetch games' };
    }
}

export async function getGameBySlug(slug: string) {
    try {
        const game = await prisma.game.findUnique({
            where: { slug },
            include: { packages: { where: { active: true }, orderBy: { price: 'asc' } } }
        });
        return { data: game };
    } catch (error) {
        return { error: 'Failed to fetch game' };
    }
}

export async function getActiveGames() {
    try {
        const games = await prisma.game.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
        return { data: games, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}

export async function createGame(data: any) {
    try {
        const session = await auth();
        // @ts-ignore
        if (session?.user?.role !== 'admin') {
            return { error: 'Unauthorized' };
        }

        const game = await prisma.game.create({
            data: {
                name: data.name,
                slug: data.slug,
                image_url: data.image_url,
                active: data.active
            }
        });
        revalidatePath('/admin/games');
        revalidatePath('/');
        return { data: game, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}

export async function updateGame(id: string, data: any) {
    try {
        const session = await auth();
        // @ts-ignore
        if (session?.user?.role !== 'admin') {
            return { error: 'Unauthorized' };
        }

        const game = await prisma.game.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                image_url: data.image_url,
                active: data.active
            }
        });
        revalidatePath('/admin/games');
        revalidatePath('/');
        return { data: game, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}

export async function deleteGame(id: string) {
    try {
        const session = await auth();
        // @ts-ignore
        if (session?.user?.role !== 'admin') {
            return { error: 'Unauthorized' };
        }

        await prisma.game.delete({
            where: { id }
        });
        revalidatePath('/admin/games');
        revalidatePath('/');
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function toggleGameStatus(id: string, currentStatus: boolean) {
    try {
        const session = await auth();
        // @ts-ignore
        if (session?.user?.role !== 'admin') {
            return { error: 'Unauthorized' };
        }

        await prisma.game.update({
            where: { id },
            data: { active: !currentStatus }
        });
        revalidatePath('/admin/games');
        revalidatePath('/');
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
}
