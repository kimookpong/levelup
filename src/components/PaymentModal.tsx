import { useState } from 'react';
import { FaTimes, FaCreditCard, FaQrcode } from 'react-icons/fa';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: { name: string; price: number } | null;
}

export default function PaymentModal({ isOpen, onClose, pkg }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'promptpay'>('promptpay');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !pkg) return null;

    const handlePayment = async () => {
        setLoading(true);
        // Simulate payment processing
        setTimeout(() => {
            setLoading(false);
            alert('ชำระเงินสำเร็จ! (จำลอง)');
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
                {/* Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h3 className="text-xl font-display font-bold text-white">ชำระเงิน</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="mb-8 bg-black/30 p-4 rounded-xl border border-white/5">
                        <p className="text-gray-400 text-sm mb-1">แพ็กเกจที่เลือก</p>
                        <div className="flex justify-between items-end">
                            <h4 className="text-xl font-bold text-white font-display">{pkg.name}</h4>
                            <p className="text-2xl font-bold text-primary font-display">{pkg.price.toLocaleString()} THB</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">เลือกช่องทางชำระเงิน</p>

                        <button
                            onClick={() => setPaymentMethod('promptpay')}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 group ${paymentMethod === 'promptpay'
                                ? 'border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(255,0,85,0.2)]'
                                : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className={`p-3 rounded-full ${paymentMethod === 'promptpay' ? 'bg-primary text-white' : 'bg-black/50 text-gray-400 group-hover:text-white'}`}>
                                <FaQrcode className="text-xl" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold">สแกน QR พร้อมเพย์</div>
                                <div className="text-xs opacity-70">สแกนเพื่อจ่ายทันที</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setPaymentMethod('credit_card')}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 group ${paymentMethod === 'credit_card'
                                ? 'border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(255,0,85,0.2)]'
                                : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className={`p-3 rounded-full ${paymentMethod === 'credit_card' ? 'bg-primary text-white' : 'bg-black/50 text-gray-400 group-hover:text-white'}`}>
                                <FaCreditCard className="text-xl" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold">บัตรเครดิต / เดบิต</div>
                                <div className="text-xs opacity-70">Visa, Mastercard, JCB</div>
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,0,85,0.3)] hover:shadow-[0_0_30px_rgba(255,0,85,0.5)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>กำลังดำเนินการ...</>
                        ) : (
                            <>ชำระเงิน <span className="bg-black/20 px-2 py-0.5 rounded text-sm">{pkg.price.toLocaleString()} THB</span></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
