'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { FaTimes, FaCreditCard, FaLock, FaShieldAlt, FaQrcode, FaCheck } from 'react-icons/fa';
import { createTransaction, updateTransactionStatus } from '@/actions/transactions';
import Image from 'next/image';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: any;
    transactionId?: string;
    amount?: number;
}

declare global {
    interface Window {
        OmiseCard: any;
    }
}

export default function PaymentModal({ isOpen, onClose, pkg, transactionId, amount }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [omiseLoaded, setOmiseLoaded] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'qr_code'>('credit_card');

    useEffect(() => {
        if (isOpen && omiseLoaded && window.OmiseCard) {
            window.OmiseCard.configure({
                publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || 'pkey_test_5wvisbxphp1636s887z', // Fallback for dev if env missing
            });
        }
    }, [isOpen, omiseLoaded]);

    if (!isOpen) return null;

    const finalAmount = amount || (pkg ? pkg.price : 0);

    const handleQRPayment = async () => {
        setLoading(true);
        // Simulate QR Payment Verification (e.g. upload slip or check mock promptpay)
        setTimeout(async () => {
            try {
                if (transactionId) {
                    const res = await updateTransactionStatus(transactionId, 'COMPLETED', 'qr_' + Date.now());
                    if (res.data) {
                        alert('ชำระเงินผ่าน QR Code สำเร็จ!');
                        onClose();
                    } else {
                        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + res.error);
                    }
                } else {
                    // Fallback creation
                    const res = await createTransaction({
                        gameId: pkg.game_id,
                        packageId: pkg.id,
                        price: pkg.price,
                        playerId: 'UNKNOWN',
                        paymentId: 'qr_' + Date.now()
                    });

                    if (res.data) {
                        alert('ชำระเงินสำเร็จ! (Demo Mode)');
                        onClose();
                    } else {
                        alert('เกิดข้อผิดพลาดในการบันทึกรายการ: ' + res.error);
                    }
                }
            } catch (err) {
                console.error(err);
                alert('เกิดข้อผิดพลาด');
            } finally {
                setLoading(false);
            }
        }, 2000);
    }

    const handlePayment = () => {
        if (paymentMethod === 'qr_code') {
            handleQRPayment();
            return;
        }

        if (!omiseLoaded) {
            alert('ระบบชำระเงินยังไม่พร้อม กรุณารอสักครู่');
            return;
        }

        window.OmiseCard.open({
            amount: finalAmount * 100, // Amount in Satang
            currency: pkg?.currency || 'THB',
            defaultPaymentMethod: 'credit_card',
            onCreateTokenSuccess: async (nonce: string) => {
                setLoading(true);
                try {
                    // If we have an existing transaction, we update it.
                    // Otherwise we create one (Legacy behavior / Fallback).

                    if (transactionId) {
                        const res = await updateTransactionStatus(transactionId, 'COMPLETED', 'tok_' + nonce);
                        if (res.data) {
                            alert('ชำระเงินสำเร็จ!');
                            onClose();
                        } else {
                            alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + res.error);
                        }
                    } else {
                        const res = await createTransaction({
                            gameId: pkg.game_id,
                            packageId: pkg.id,
                            price: pkg.price,
                            playerId: 'UNKNOWN', // Fallback
                            paymentId: 'tok_' + nonce
                        });

                        if (res.data) {
                            alert('ชำระเงินสำเร็จ! (Demo Mode)');
                            onClose();
                        } else {
                            alert('เกิดข้อผิดพลาดในการบันทึกรายการ: ' + res.error);
                        }
                    }

                } catch (err) {
                    console.error(err);
                    alert('เกิดข้อผิดพลาด');
                } finally {
                    setLoading(false);
                }
            },
            onFormClosed: () => {
                // Do nothing
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <Script
                src="https://cdn.omise.co/omise.js"
                onLoad={() => setOmiseLoaded(true)}
            />

            <div className="bg-[#1a1b26] rounded-3xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1a1b26] to-[#2a2b36] p-6 border-b border-white/5 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {paymentMethod === 'credit_card' ? <FaCreditCard className="text-emerald-400" /> : <FaQrcode className="text-emerald-400" />}
                        ชำระเงิน
                    </h3>
                </div>

                <div className="p-8 space-y-6">
                    {/* Method Selector */}
                    <div className="grid grid-cols-2 gap-4 p-1 bg-black/40 rounded-xl">
                        <button
                            onClick={() => setPaymentMethod('credit_card')}
                            className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${paymentMethod === 'credit_card'
                                    ? 'bg-emerald-500 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <FaCreditCard /> บัตรเครดิต
                        </button>
                        <button
                            onClick={() => setPaymentMethod('qr_code')}
                            className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${paymentMethod === 'qr_code'
                                    ? 'bg-emerald-500 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <FaQrcode /> QR Code
                        </button>
                    </div>

                    {/* Content Based on Method */}
                    {paymentMethod === 'qr_code' ? (
                        <div className="text-center animate-fade-in">
                            <div className="bg-white p-4 rounded-xl inline-block mb-4">
                                {/* Mock QR Code - In real app use a generator lib */}
                                <Image
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PromptPay-${finalAmount}`}
                                    alt="Payment QR"
                                    width={200}
                                    height={200}
                                />
                            </div>
                            <p className="text-white font-bold text-lg mb-2">สแกนเพื่อจ่ายเงิน</p>
                            <p className="text-emerald-400 text-xl font-bold mb-4">{finalAmount.toLocaleString()} THB</p>
                            <p className="text-xs text-gray-400">กรุณาสแกน QR Code ผ่านแอปธนาคารของคุณ<br />เพื่อชำระเงิน (ระบบทดสอบ: กดปุ่มด้านล่างได้เลย)</p>
                        </div>
                    ) : (
                        /* Package Info (Only show here for card, or both? Let's show both but design differs slightly) */
                        /* Actually package info is good to see always, let's move it out of 'method specific' area or duplicate it? */
                        /* The mock above put QR in center. Let's keep Package Info uniform. */
                        <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex justify-between items-center animate-fade-in">
                            <div>
                                <p className="text-sm text-gray-400">แพ็กเกจที่เลือก</p>
                                <p className="text-white font-bold text-lg">{pkg?.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">ราคา</p>
                                <p className="text-emerald-400 font-bold text-xl">{finalAmount.toLocaleString()} THB</p>
                            </div>
                        </div>
                    )}



                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-xs bg-emerald-500/5 py-2 rounded-lg border border-emerald-500/10">
                        <FaLock className="w-3 h-3" />
                        <span>Secured by Omise Payment Gateway</span>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={(!omiseLoaded && paymentMethod === 'credit_card') || loading}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                            <>
                                {paymentMethod === 'credit_card' ? <FaShieldAlt /> : <FaCheck />}
                                {paymentMethod === 'credit_card' ? 'ชำระเงินด้วยบัตรเครดิต' : 'ยืนยันการชำระเงิน'}
                            </>
                        )}
                    </button>


                    <p className="text-center text-gray-600 text-xs">
                        รองรับ Visa, Mastercard, JCB
                    </p>
                </div>
            </div>
        </div>
    );
}
