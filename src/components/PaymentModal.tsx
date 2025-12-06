'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { FaTimes, FaCreditCard, FaLock, FaShieldAlt, FaQrcode, FaCheck, FaSpinner, FaMobileAlt, FaUniversity, FaWallet } from 'react-icons/fa';
import { createTransaction } from '@/actions/transactions';
import { processCreditCardPayment, createSourceCharge, checkChargeStatus } from '@/actions/payments';
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

type MethodCategory = 'credit_card' | 'qr_code' | 'truemoney' | 'mobile_banking' | 'internet_banking' | 'others';

export default function PaymentModal({ isOpen, onClose, pkg, transactionId, amount }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [omiseLoaded, setOmiseLoaded] = useState(false);
    const [category, setCategory] = useState<MethodCategory>('credit_card');

    // QR State
    const [qrImage, setQrImage] = useState<string | null>(null);
    const [qrChargeId, setQrChargeId] = useState<string | null>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const pollInterval = useRef<NodeJS.Timeout>(null);

    // Form States
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedBank, setSelectedBank] = useState('');

    useEffect(() => {
        if (isOpen && omiseLoaded && window.OmiseCard) {
            window.OmiseCard.configure({
                publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || 'pkey_test_5wvisbxphp1636s887z',
            });
        }

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [isOpen, omiseLoaded]);

    useEffect(() => {
        if (!isOpen) {
            setQrImage(null);
            setQrChargeId(null);
            setIsCheckingStatus(false);
            setPhoneNumber('');
            setSelectedBank('');
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
        }, 5000);
    };

    const handleSourcePayment = async (sourceType: string, options: any = {}) => {
        if (!transactionId) {
            alert('ไม่พบข้อมูลธุรกรรม (Transaction ID missing)');
            return;
        }

        setLoading(true);
        try {
            const res = await createSourceCharge(transactionId, sourceType, options);
            // @ts-ignore
            if (res.data) {
                // @ts-ignore
                const { type, chargeId, qrImage: img, authorizeUri } = res.data;

                if (type === 'qr') {
                    setQrImage(img);
                    setQrChargeId(chargeId);
                    startPolling(chargeId);
                } else if (type === 'redirect' && authorizeUri) {
                    window.location.href = authorizeUri;
                } else {
                    alert('Unknown Payment Type Response');
                }
            } else {
                // @ts-ignore
                alert('ทำรายการไม่สำเร็จ: ' + res.error);
            }
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการทำรายการ');
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
            amount: finalAmount * 100,
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
                        alert('Transaction ID not found. Please try again.');
                    }
                } catch (err) {
                    console.error(err);
                    alert('เกิดข้อผิดพลาด');
                } finally {
                    setLoading(false);
                }
            },
            onFormClosed: () => { },
        });
    };

    const renderMethodGrid = () => (
        <div className="grid grid-cols-3 gap-3">
            {[
                { id: 'credit_card', icon: FaCreditCard, label: 'บัตรเครดิต' },
                { id: 'qr_code', icon: FaQrcode, label: 'PromptPay' },
                { id: 'truemoney', icon: FaWallet, label: 'TrueMoney' },
                { id: 'mobile_banking', icon: FaMobileAlt, label: 'Mobile App' },
                { id: 'internet_banking', icon: FaUniversity, label: 'iBanking' },
                { id: 'others', icon: FaShieldAlt, label: 'ช่องทางอื่น' },
            ].map((m) => (
                <button
                    key={m.id}
                    onClick={() => { setCategory(m.id as MethodCategory); setQrImage(null); }}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-semibold ${category === m.id
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <m.icon size={20} />
                    {m.label}
                </button>
            ))}
        </div>
    );

    const renderPaymentContent = () => {
        switch (category) {
            case 'qr_code':
                return (
                    <div className="text-center animate-fade-in space-y-4">
                        {qrImage ? (
                            <>
                                <div className="bg-white p-4 rounded-xl inline-block">
                                    <Image src={qrImage} alt="QR" width={200} height={200} unoptimized />
                                </div>
                                <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm animate-pulse">
                                    <FaSpinner className="animate-spin" />
                                    <span>กำลังตรวจสอบสถานะ...</span>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => handleSourcePayment('promptpay')}
                                disabled={loading}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-white flex items-center justify-center gap-2"
                            >
                                <FaQrcode /> สร้าง QR Code PromptPay
                            </button>
                        )}
                    </div>
                );
            case 'truemoney':
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">เบอร์โทรศัพท์ TrueMoney Wallet</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="08xxxxxxxx"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={() => handleSourcePayment('truemoney', { phone_number: phoneNumber })}
                            disabled={!phoneNumber || loading}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold text-white"
                        >
                            ยืนยันการจ่ายด้วย TrueMoney
                        </button>
                    </div>
                );
            case 'mobile_banking':
                return (
                    <div className="space-y-3 animate-fade-in">
                        <p className="text-sm text-gray-400">เลือกธนาคาร (แอปเป๋าตัง / KPlus / SCB / Etc)</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'mobile_banking_scb', label: 'SCB Easy', color: 'bg-purple-600' },
                                { id: 'mobile_banking_kbank', label: 'K PLUS', color: 'bg-green-600' },
                                { id: 'mobile_banking_bbl', label: 'Bualuang', color: 'bg-blue-600' },
                                { id: 'mobile_banking_bay', label: 'Krungsri', color: 'bg-yellow-600' },
                                { id: 'mobile_banking_ktb', label: 'Krungthai', color: 'bg-cyan-600' },
                            ].map(bank => (
                                <button
                                    key={bank.id}
                                    onClick={() => handleSourcePayment(bank.id)}
                                    disabled={loading}
                                    className={`${bank.color} hover:opacity-90 py-3 rounded-lg text-white text-sm font-bold flex items-center justify-center gap-2`}
                                >
                                    {bank.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'internet_banking':
                return (
                    <div className="space-y-3 animate-fade-in">
                        <p className="text-sm text-gray-400">เลือกธนาคาร (iBanking)</p>
                        <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                        >
                            <option value="">-- กรุณาเลือก --</option>
                            <option value="internet_banking_scb">SCB Easy Net</option>
                            <option value="internet_banking_ktb">KTB Netbank</option>
                            <option value="internet_banking_bay">Krungsri Online</option>
                            <option value="internet_banking_bbl">Bualuang iBanking</option>
                        </select>
                        <button
                            onClick={() => handleSourcePayment(selectedBank)}
                            disabled={!selectedBank || loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white"
                        >
                            ไปที่หน้าธนาคาร
                        </button>
                    </div>
                );
            case 'others':
                return (
                    <div className="space-y-3 animate-fade-in">
                        <button
                            onClick={() => handleSourcePayment('rabbit_linepay')}
                            disabled={loading}
                            className="w-full py-3 bg-green-500 hover:bg-green-400 rounded-lg font-bold text-white"
                        >
                            Rabbit LINE Pay
                        </button>
                        <button
                            onClick={() => handleSourcePayment('alipay')}
                            disabled={loading}
                            className="w-full py-3 bg-blue-400 hover:bg-blue-500 rounded-lg font-bold text-white"
                        >
                            Alipay
                        </button>
                        <button
                            onClick={() => handleSourcePayment('wechat')}
                            disabled={loading}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-white"
                        >
                            WeChat Pay
                        </button>
                    </div>
                );
            case 'credit_card':
            default:
                return (
                    <button
                        onClick={handleCreditCardPayment}
                        disabled={!omiseLoaded || loading}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaShieldAlt />}
                        ชำระเงินด้วยบัตรเครดิต
                    </button>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <Script
                src="https://cdn.omise.co/omise.js"
                onLoad={() => setOmiseLoaded(true)}
            />

            <div className="bg-[#1a1b26] rounded-3xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1a1b26] to-[#2a2b36] p-6 border-b border-white/5 relative sticky top-0 z-10">
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

                <div className="p-6 space-y-6">
                    {/* Amount Info */}
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-400">ยอดชำระสุทธิ</p>
                            <p className="text-white font-bold text-sm">{pkg?.name}</p>
                        </div>
                        <p className="text-emerald-400 font-bold text-2xl">{finalAmount.toLocaleString()} ฿</p>
                    </div>

                    {/* Method Selector */}
                    {renderMethodGrid()}

                    {/* Dynamic Content */}
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 min-h-[150px] flex flex-col justify-center">
                        {renderPaymentContent()}
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-xs text-center">
                        <FaLock className="w-3 h-3" />
                        Secured by Omise Payment Gateway
                    </div>
                </div>
            </div>
        </div>
    );
}
