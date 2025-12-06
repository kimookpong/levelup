'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function getPackages(gameId?: string) {
    try {
        const where = gameId ? { game_id: gameId } : {};
        const packages = await prisma.package.findMany({
            where,
            include: {
                game: {
                    select: { id: true, name: true, image_url: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform to match old structure if needed, basically renaming 'game' to 'games' to match Supabase join if we want minimal frontend change,
        // OR we update frontend to use 'game'. I will implement frontend update.
        return { data: packages, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}

export async function createPackage(data: any) {
    try {
        const session = await auth();
        // @ts-ignore
        if (session?.user?.role !== 'admin') {
            return { error: 'Unauthorized' };
        }

        const pkg = await prisma.package.create({
            data: {
                game_id: data.game_id,
                name: data.name,
                price: data.price,
                currency: data.currency,
                bonus_details: data.bonus_details || null,
                active: data.active
            }
        });
        revalidatePath('/admin/packages');
        return { data: pkg, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}

export async function updatePackage(id: string, data: any) {
    try {
        const session = await auth();
        // @ts-ignore
        if (session?.user?.role !== 'admin') {
            return { error: 'Unauthorized' };
        }

        const pkg = await prisma.package.update({
            where: { id },
            data: {
                game_id: data.game_id,
                name: data.name,
                price: data.price,
                currency: data.currency,
                bonus_details: data.bonus_details || null,
                active: data.active
            }
        });
        revalidatePath('/admin/packages');
        return { data: pkg, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}

export async function deletePackage(id: string) {
    try {
        const session = await auth();
        // @ts-ignore
        if (session?.user?.role !== 'admin') {
            return { error: 'Unauthorized' };
        }

        await prisma.package.delete({
            where: { id }
        });
        revalidatePath('/admin/packages');
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
}
