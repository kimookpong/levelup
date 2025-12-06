'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Initialize Omise
// Note: 'omise' package might not have types, using require or any if needed. 
// Assuming ESM import works or fallback to require.
const omise = require('omise')({
    'publicKey': process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY,
    'secretKey': process.env.OMISE_SECRET_KEY,
});

export async function processCreditCardPayment(transactionId: string, token: string) {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { package: true } // Assuming we need currency? Or we trust the transaction
        });

        if (!transaction) return { error: 'Transaction not found' };

        // Transaction Amount (Omise uses smallest unit, e.g. Satang for THB)
        const amount = Math.round(transaction.price * 100);

        return new Promise((resolve, reject) => {
            omise.charges.create({
                'amount': amount,
                'currency': transaction.currency.toLowerCase(),
                'card': token,
                'metadata': {
                    'transaction_id': transactionId
                }
            }, async (err: any, charge: any) => {
                if (err) {
                    console.error('Omise Charge Error:', err);
                    resolve({ error: err.message || 'Payment failed' });
                    return;
                }

                if (charge.status === 'successful') {
                    // Update Transaction
                    await prisma.transaction.update({
                        where: { id: transactionId },
                        data: {
                            status: 'COMPLETED',
                            paymentId: charge.id
                        }
                    });
                    revalidatePath('/profile');
                    resolve({ data: { success: true, chargeId: charge.id } });
                } else {
                    // Authorized (Pending capture) or Failed
                    if (charge.status === 'failed') {
                        resolve({ error: charge.failure_message || 'Payment failed' });
                    } else {
                        // Pending / Authorized? For cards usually instant unless 3DS
                        // For this MVP assuming successful or 3DS flow (which returns redirect_uri)
                        // handling 3DS is complex, sticking to simple capture or assuming success.
                        // If 3DS, we get 'pending' and 'authorize_uri'.

                        if (charge.status === 'pending' && charge.authorize_uri) {
                            // Let's treat 3DS as a "success" in terms of "Action started", 
                            // but we need to tell client to redirect.
                            // For simplicity given the "Mock" nature before, 
                            // if it's test mode non-3DS it succeeds immediately.
                            resolve({ error: '3D Secure not fully implemented in this demo. Use non-3DS test card.' });
                        } else {
                            resolve({ error: 'Payment status: ' + charge.status });
                        }
                    }
                }
            });
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        return { error: 'Internal server error' };
    }
}

export async function createSourceCharge(transactionId: string, sourceType: string, sourceOptions?: any) {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) return { error: 'Transaction not found' };

        const amount = Math.round(transaction.price * 100);

        const sourceConfig: any = { type: sourceType };
        if (sourceOptions) {
            Object.assign(sourceConfig, sourceOptions);
        }

        return new Promise((resolve, reject) => {
            omise.charges.create({
                'amount': amount,
                'currency': transaction.currency.toLowerCase(),
                'source': sourceConfig,
                'return_uri': `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?payment_success=true&transaction_id=${transactionId}`, // Redirect back to profile
                'metadata': {
                    'transaction_id': transactionId
                }
            }, async (err: any, charge: any) => {
                if (err) {
                    console.error('Omise Source Error:', err);
                    resolve({ error: err.message || 'Failed to create charge' });
                    return;
                }

                // Update transaction with paymentId
                await prisma.transaction.update({
                    where: { id: transactionId },
                    data: { paymentId: charge.id }
                });

                // Handle Response Types
                // 1. Image (QR Code like PromptPay)
                if (charge.source && charge.source.scannable_code) {
                    resolve({
                        data: {
                            type: 'qr',
                            chargeId: charge.id,
                            qrImage: charge.source.scannable_code.image.download_uri,
                            qrText: charge.source.scannable_code.payload
                        }
                    });
                }
                // 2. Redirect (TrueMoney, Mobile Banking, etc.)
                else if (charge.authorize_uri) {
                    resolve({
                        data: {
                            type: 'redirect',
                            chargeId: charge.id,
                            authorizeUri: charge.authorize_uri
                        }
                    });
                }
                // 3. Fallback / Success immediately (Rare for sources usually)
                else {
                    resolve({ data: { type: 'unknown', chargeId: charge.id, status: charge.status } });
                }
            });
        });

    } catch (error) {
        console.error('Source Charge error:', error);
        return { error: 'Internal server error' };
    }
}

export async function checkChargeStatus(chargeId: string) {
    return new Promise((resolve, reject) => {
        omise.charges.retrieve(chargeId, async (err: any, charge: any) => {
            if (err) {
                resolve({ error: 'Check failed' });
                return;
            }

            if (charge.status === 'successful') {
                // Update DB if not already
                // Ideally this happens via Webhook, but polling/check verifies it too.
                // We don't know the transactionId easily unless we fetch it by paymentId.
                const transaction = await prisma.transaction.findFirst({ where: { paymentId: chargeId } });
                if (transaction && transaction.status !== 'COMPLETED') {
                    await prisma.transaction.update({
                        where: { id: transaction.id },
                        data: { status: 'COMPLETED' }
                    });
                    revalidatePath('/profile');
                }

                resolve({ data: { status: 'successful' } });
            } else if (charge.status === 'failed') {
                // Update DB
                const transaction = await prisma.transaction.findFirst({ where: { paymentId: chargeId } });
                if (transaction && transaction.status !== 'FAILED') {
                    await prisma.transaction.update({
                        where: { id: transaction.id },
                        data: { status: 'FAILED' }
                    });
                }
                resolve({ data: { status: 'failed', message: charge.failure_message } });
            } else {
                resolve({ data: { status: 'pending' } });
            }
        });
    });
}
