'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getChatUsers() {
    const session = await auth();
    // @ts-ignore
    if (!session || !session.user || !session.user.id) {
        return { error: 'Unauthorized' };
    }

    // @ts-ignore
    const adminId = session.user.id;

    try {
        // Fetch all unique users who have sent messages or received messages from this admin
        // This is complex with just Prisma, so we'll fetch messages and aggregate manually
        // or use distinct if possible.
        // Simplified: Fetch all messages involving this admin
        const messages = await prisma.chatMessage.findMany({
            where: {
                OR: [
                    { sender_id: adminId },
                    { receiver_id: adminId }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        const lastMessages: Record<string, any> = {};

        messages.forEach((msg) => {
            const otherUserId = msg.sender_id === adminId ? msg.receiver_id : msg.sender_id;
            if (!lastMessages[otherUserId]) {
                lastMessages[otherUserId] = {
                    userId: otherUserId,
                    lastMessage: msg.message,
                    lastMessageAt: msg.createdAt, // Keep as Date object
                    isRead: msg.is_read
                };
            }
        });

        const userIds = Object.keys(lastMessages);
        if (userIds.length === 0) return { data: [] };

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, image: true, email: true }
        });

        const usersWithTime = users.map((u) => {
            const chatData = lastMessages[u.id];
            return {
                id: u.id,
                full_name: u.name,
                email: u.email,
                avatar_url: u.image,
                last_message_at: chatData.lastMessageAt.toISOString(), // Convert to string here
                last_message: chatData.lastMessage
            };
        }).sort((a, b) =>
            new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        );

        return { data: usersWithTime };

    } catch (error) {
        return { error: 'Failed to fetch chat users' };
    }
}

export async function getMessages(userId: string) {
    const session = await auth();
    // @ts-ignore
    if (!session || !session.user || !session.user.id) {
        return { error: 'Unauthorized' };
    }

    // @ts-ignore
    const adminId = session.user.id;

    try {
        const messages = await prisma.chatMessage.findMany({
            where: {
                OR: [
                    { sender_id: adminId, receiver_id: userId },
                    { sender_id: userId, receiver_id: adminId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        return {
            data: messages.map((msg) => ({
                ...msg,
                is_admin: msg.sender_id === adminId
            }))
        };
    } catch (error) {
        return { error: 'Failed to fetch messages' };
    }
}

export async function sendMessage(text: string, receiverId: string) {
    const session = await auth();
    // @ts-ignore
    if (!session || !session.user || !session.user.id) {
        return { error: 'Unauthorized' };
    }

    try {
        const message = await prisma.chatMessage.create({
            data: {
                message: text,
                // @ts-ignore
                sender_id: session.user.id,
                receiver_id: receiverId
            }
        });
        return { data: message };
    } catch (error) {
        return { error: 'Failed to send message' };
    }
}

export async function getSupportUser() {
    try {
        const admin = await prisma.user.findFirst({
            where: { role: 'admin' },
            select: { id: true, name: true, image: true }
        });
        return { data: admin };
    } catch (error) {
        return { error: 'Failed to find support user' };
    }
}
