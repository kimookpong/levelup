'use client';

import { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaUserShield } from 'react-icons/fa';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import Image from 'next/image';

interface Message {
    id: string;
    message: string;
    sender_id: string;
    receiver_id: string;
    createdAt: Date;
    is_admin: boolean;
}

export default function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [supportUser, setSupportUser] = useState<any>(null);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && isOpen && !supportUser) {
            import('@/actions/chat').then(m => m.getSupportUser()).then(res => {
                if (res.data) setSupportUser(res.data);
            });
        }
    }, [user, isOpen, supportUser]);

    useEffect(() => {
        if (!isOpen || !user || !supportUser) return;

        const fetchMessages = async () => {
            try {
                const { data } = await import('@/actions/chat').then(m => m.getMessages(supportUser.id));
                // @ts-ignore
                if (data) setMessages(data as Message[]);
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [isOpen, user, supportUser]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !supportUser) return;

        const text = newMessage;
        setNewMessage('');
        setSending(true);

        try {
            await import('@/actions/chat').then(m => m.sendMessage(text, supportUser.id));
            const { data } = await import('@/actions/chat').then(m => m.getMessages(supportUser.id));
            // @ts-ignore
            if (data) setMessages(data as Message[]);
        } catch (error) {
            console.error("Failed to send message", error);
            setNewMessage(text); // Restore on failure
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-gradient-to-r from-primary to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform duration-300"
                >
                    <FaComments className="text-white text-2xl animate-pulse" />
                    {/* Badge could go here */}
                </button>
            )}

            {isOpen && (
                <div className="bg-[#1a1b26] border border-white/10 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] animate-fade-in-up">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-[#1a1b26] to-[#2a2b36] border-b border-white/5 flex items-center justify-between">
                        <div className="font-bold text-white flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <FaUserShield />
                            </div>
                            <div>
                                <p className="text-sm">ฝ่ายบริการลูกค้า</p>
                                <p className="text-xs text-green-400 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col relative bg-black/20">
                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                        >
                            {!user ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                                    <FaComments className="text-4xl text-gray-700" />
                                    <p className="text-gray-400 text-sm">กรุณาเข้าสู่ระบบเพื่อเริ่มสนทนา</p>
                                    <Link
                                        href="/login"
                                        className="px-6 py-2 bg-primary hover:bg-red-600 text-white text-sm font-bold rounded-full transition-colors"
                                    >
                                        เข้าสู่ระบบ
                                    </Link>
                                </div>
                            ) : !supportUser ? (
                                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                    <div className="animate-spin mr-2 w-4 h-4 border-2 border-white/20 border-t-primary rounded-full"></div>
                                    กำลังเชื่อมต่อกับเจ้าหน้าที่...
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm mt-10">
                                    <p>ยังไม่มีข้อความ</p>
                                    <p className="text-xs mt-1">สอบถามข้อมูลเพิ่มเติมได้เลยครับ</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <div
                                            key={msg.id || idx}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isMe
                                                        ? 'bg-primary text-white rounded-br-none'
                                                        : 'bg-white/10 text-gray-200 rounded-bl-none'
                                                    }`}
                                            >
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        {user && (
                            <div className="p-4 bg-[#1a1b26] border-t border-white/5">
                                <form onSubmit={handleSend} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="พิมพ์ข้อความ..."
                                        disabled={!supportUser || sending}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-primary/50 placeholder-gray-500 disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || !supportUser || sending}
                                        className="w-10 h-10 bg-primary hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sending ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <FaPaperPlane className="text-sm" />
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
