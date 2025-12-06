'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { FaTimes, FaCreditCard, FaLock, FaShieldAlt, FaQrcode, FaCheck, FaSpinner } from 'react-icons/fa';
import { createTransaction } from '@/actions/transactions';
import { processCreditCardPayment, createPromptPayCharge, checkChargeStatus } from '@/actions/payments';
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

    // QR State
    const [qrImage, setQrImage] = useState<string | null>(null);
    const [qrChargeId, setQrChargeId] = useState<string | null>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const pollInterval = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        if (isOpen && omiseLoaded && window.OmiseCard) {
            window.OmiseCard.configure({
                publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || 'pkey_test_5wvisbxphp1636s887z',
            });
        }

        // Cleanup polling on close or unmount
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [isOpen, omiseLoaded]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setQrImage(null);
            setQrChargeId(null);
            setIsCheckingStatus(false);
            if (pollInterval.current) clearInterval(pollInterval.current);
        }
    }, [isOpen]);

    const finalAmount = amount || (pkg ? pkg.price : 0);

    const startPolling = (chargeId: string) => {
        setIsCheckingStatus(true);
        if (pollInterval.current) clearInterval(pollInterval.current);

        pollInterval.current = setInterval(async () => {
            const res = await checkChargeStatus(chargeId);
            // @ts-ignore
            if (res.data?.status === 'successful') {
                if (pollInterval.current) clearInterval(pollInterval.current);
                setIsCheckingStatus(false);
                alert('ชำระเงินสำเร็จ!');
                onClose();
                // @ts-ignore
            } else if (res.data?.status === 'failed') {
                if (pollInterval.current) clearInterval(pollInterval.current);
                setIsCheckingStatus(false);
                alert('การชำระเงินล้มเหลว');
            }
        }, 5000); // Poll every 5 seconds
    };

    const handleGenerateQR = async () => {
        if (!transactionId) {
            alert('ไม่พบข้อมูลธุรกรรม (Transaction ID missing)');
            return;
        }

        setLoading(true);
        try {
            const res = await createPromptPayCharge(transactionId);
            // @ts-ignore
            if (res.data) {
                // @ts-ignore
                setQrImage(res.data.qrImage);
                // @ts-ignore
                const chargeId = res.data.chargeId;
                setQrChargeId(chargeId);
                startPolling(chargeId);
            } else {
                // @ts-ignore
                alert('สร้าง QR Code ไม่สำเร็จ: ' + res.error);
            }
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการสร้าง QR Code');
        } finally {
            setLoading(false);
        }
    };

    const handleCreditCardPayment = () => {
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
                    if (transactionId) {
                        const res = await processCreditCardPayment(transactionId, nonce);
                        // @ts-ignore
                        if (res.data?.success) {
                            alert('ชำระเงินสำเร็จ!');
                            onClose();
                        } else {
                            // @ts-ignore
                            alert('ชำระเงินไม่สำเร็จ: ' + res.error);
                        }
                    } else {
                        // Handle case where transactionId is missing (create one first? logic in page.tsx usually ensures it exists)
                        alert('Transaction ID not found. Please try again.');
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

    // If switched to QR, we might want to auto generate?
    // Let's require a click to generate for now to be explicit.

    if (!isOpen) return null;

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
                            onClick={() => { setPaymentMethod('credit_card'); setQrImage(null); }}
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
                            {qrImage ? (
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl inline-block">
                                        <Image
                                            src={qrImage}
                                            alt="PromptPay QR"
                                            width={200}
                                            height={200}
                                            unoptimized // External URL
                                        />
                                    </div>
                                    <p className="text-white font-bold text-lg">สแกนเพื่อจ่ายเงิน</p>
                                    <p className="text-emerald-400 text-xl font-bold">{finalAmount.toLocaleString()} THB</p>

                                    <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm animate-pulse">
                                        <FaSpinner className="animate-spin" />
                                        <span>กำลังตรวจสอบสถานะการชำระเงิน...</span>
                                    </div>
                                    <p className="text-xs text-gray-400">ระบบจะตรวจสอบยอดเงินอัตโนมัติ</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center gap-4">
                                        <FaQrcode className="text-5xl text-gray-600" />
                                        <p className="text-gray-400 text-sm">กดปุ่มด้านล่างเพื่อสร้าง QR Code</p>
                                    </div>
                                    <p className="text-emerald-400 font-bold text-xl">{finalAmount.toLocaleString()} THB</p>
                                </div>
                            )}
                        </div>
                    ) : (
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

                    {paymentMethod === 'credit_card' ? (
                        <button
                            onClick={handleCreditCardPayment}
                            disabled={!omiseLoaded || loading}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <FaShieldAlt /> ชำระเงินด้วยบัตรเครดิต
                                </>
                            )}
                        </button>
                    ) : (
                        !qrImage && (
                            <button
                                onClick={handleGenerateQR}
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <FaQrcode /> สร้าง QR Code
                                    </>
                                )}
                            </button>
                        )
                    )}

                    <p className="text-center text-gray-600 text-xs">
                        รองรับ Visa, Mastercard, JCB และ PromptPay
                    </p>
                </div>
            </div>
        </div>
    );
}
