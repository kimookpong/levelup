'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { FaTimes, FaCreditCard, FaLock, FaShieldAlt } from 'react-icons/fa';
import { createTransaction } from '@/actions/transactions';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: any;
}

declare global {
    interface Window {
        OmiseCard: any;
    }
}

export default function PaymentModal({ isOpen, onClose, pkg }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [omiseLoaded, setOmiseLoaded] = useState(false);

    useEffect(() => {
        if (isOpen && omiseLoaded && window.OmiseCard) {
            window.OmiseCard.configure({
                publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || 'pkey_test_5wvisbxphp1636s887z', // Fallback for dev if env missing
            });
        }
    }, [isOpen, omiseLoaded]);

    if (!isOpen) return null;

    const handlePayment = () => {
        if (!omiseLoaded) {
            alert('ระบบชำระเงินยังไม่พร้อม กรุณารอสักครู่');
            return;
        }

        window.OmiseCard.open({
            amount: pkg.price * 100, // Amount in Satang
            currency: pkg.currency || 'THB',
            defaultPaymentMethod: 'credit_card',
            onCreateTokenSuccess: async (nonce: string) => {
                setLoading(true);
                try {
                    // Here we send the token (nonce) to our server to charge/create transaction
                    // For this MVP, we just create the transaction record
                    // In real app, we would verify payment with Omise API on server side

                    const res = await createTransaction({
                        gameId: pkg.game_id,
                        packageId: pkg.id,
                        price: pkg.price,
                        paymentId: 'tok_' + nonce // Store token as payment ref
                    });

                    if (res.data) {
                        alert('ชำระเงินสำเร็จ! (Demo Mode)');
                        onClose();
                    } else {
                        alert('เกิดข้อผิดพลาดในการบันทึกรายการ: ' + res.error);
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
                        <FaCreditCard className="text-emerald-400" />
                        ชำระเงิน
                    </h3>
                </div>

                <div className="p-8 space-y-6">
                    {/* Package Info */}
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-400">แพ็กเกจที่เลือก</p>
                            <p className="text-white font-bold text-lg">{pkg?.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">ราคา</p>
                            <p className="text-emerald-400 font-bold text-xl">{pkg?.price.toLocaleString()} THB</p>
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-xs bg-emerald-500/5 py-2 rounded-lg border border-emerald-500/10">
                        <FaLock className="w-3 h-3" />
                        <span>Secured by Omise Payment Gateway</span>
                    </div>

                    <button
                        onClick={handlePayment}
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

                    <p className="text-center text-gray-600 text-xs">
                        รองรับ Visa, Mastercard, JCB
                    </p>
                </div>
            </div>
        </div>
    );
}
