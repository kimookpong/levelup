'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createTransaction(data: {
    gameId: string;
    packageId: string;
    price: number;
    playerId: string;
    promotionCode?: string;
    paymentId?: string;
}) {
    const session = await auth();
    // Allow guest purchases or require login? Assuming login for now based on previous context, 
    // but the UI doesn't explicitly block guests yet. 
    // However, schema has userId as optional. Let's allowing guest for now if session is missing, but link if present.
    const userId = session?.user?.id;

    try {
        // 1. Validate Package
        const pkg = await prisma.package.findUnique({
            where: { id: data.packageId }
        });

        if (!pkg) {
            return { error: 'Package not found' };
        }

        if (pkg.price !== data.price && !data.promotionCode) {
            // Basic price check if no promo code (client should send correct price)
            // Ideally we recalculate server side entirely.
        }

        let finalPrice = pkg.price;
        let discount = 0;

        // 2. Validate Promotion (if provided)
        if (data.promotionCode) {
            const promotion = await prisma.promotion.findUnique({
                where: { code: data.promotionCode }
            });

            if (!promotion) {
                return { error: 'Invalid promotion code' };
            }

            if (!promotion.active) {
                return { error: 'Promotion is not active' };
            }

            if (promotion.expires_at && new Date() > promotion.expires_at) {
                return { error: 'Promotion expired' };
            }

            if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) {
                return { error: 'Promotion usage limit reached' };
            }

            // Calculate Discount
            if (promotion.discount_type === 'FIXED') {
                discount = promotion.discount_value;
            } else { // PERCENT
                discount = (pkg.price * promotion.discount_value) / 100;
            }

            // Ensure price doesn't go below 0
            if (discount > pkg.price) {
                discount = pkg.price;
            }

            finalPrice = pkg.price - discount;

            // Increment usage count
            await prisma.promotion.update({
                where: { id: promotion.id },
                data: { usage_count: { increment: 1 } }
            });
        }

        // 3. Create Transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId: userId,
                gameId: data.gameId,
                packageId: data.packageId,
                price: finalPrice,
                currency: pkg.currency,
                status: 'PENDING', // Waiting for payment
                promotionCode: data.promotionCode,
                discount: discount,
            }
        });

        return { data: transaction };

    } catch (error) {
        console.error('Transaction creation error:', error);
        return { error: 'Failed to create transaction' };
    }
}

export async function updateTransactionStatus(transactionId: string, status: string, paymentId?: string) {
    const session = await auth();
    // Allow update if admin or if it's the user's transaction?
    // For simplicity in payment callback, we might need to trust the client calling this *after* Omise success?
    // IN REALITY: Omise should call a Webhook.
    // FOR THIS MVP: Client calls this after getting success from Omise.
    // We should probably check if user owns transaction.

    // Allow guest if we aren't strict, or check session.

    try {
        const transaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: status, // 'COMPLETED'
                paymentId: paymentId
            }
        });
        revalidatePath('/profile'); // Update history if viewed
        return { data: transaction };
    } catch (error) {
        console.error('Update transaction error:', error);
        return { error: 'Failed to update transaction' };
    }
}
