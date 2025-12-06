'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return { data: users };
    } catch (error) {
        return { error: 'Failed to fetch users' };
    }
}

export async function updateUserRole(userId: string, role: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role },
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update user role' };
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId },
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete user' };
    }
}
