'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaComments, FaPaperPlane, FaTimes, FaSync } from 'react-icons/fa';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'admin';
    created_at: string;
}

const POLLING_INTERVAL = 5000; // 5 seconds

export default function ChatWidget() {
    const { user, loading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastMessageCount, setLastMessageCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    // Fetch messages function
    const fetchMessages = useCallback(async (showLoading = false) => {
        if (!user) return;

        if (showLoading) setMessagesLoading(true);

        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching messages:', error);
                return;
            }

            if (data && data.length > 0) {
                const newMessages = data.map((msg: any) => ({
                    id: msg.id,
                    text: msg.message,
                    sender: msg.sender_id === user.id ? 'user' : 'admin',
                    created_at: msg.created_at
                }));

                // Check for new messages from admin (for unread count)
                if (!isOpen && data.length > lastMessageCount) {
                    const newAdminMessages = data.slice(lastMessageCount).filter(
                        (msg: any) => msg.sender_id !== user.id
                    );
                    if (newAdminMessages.length > 0) {
                        setUnreadCount(prev => prev + newAdminMessages.length);
                    }
                }

                setMessages(newMessages as ChatMessage[]);
                setLastMessageCount(data.length);
            } else {
                // Add welcome message if no messages
                setMessages([{
                    id: 'welcome',
                    text: 'สวัสดีครับ มีอะไรให้เราช่วยไหมครับ?',
                    sender: 'admin',
                    created_at: new Date().toISOString()
                }]);
                setLastMessageCount(0);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            if (showLoading) setMessagesLoading(false);
        }
    }, [user, isOpen, lastMessageCount]);

    // Initial fetch and polling
    useEffect(() => {
        if (!user) return;

        // Initial fetch with loading indicator
        fetchMessages(true);

        // Polling for new messages (without loading indicator)
        const intervalId = setInterval(() => {
            fetchMessages(false);
        }, POLLING_INTERVAL);

        return () => {
            clearInterval(intervalId);
        };
    }, [user, fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || !user) return;

        const messageText = input.trim();
        const tempId = Date.now().toString();

        // Optimistic update
        setMessages(prev => [...prev, {
            id: tempId,
            text: messageText,
            sender: 'user',
            created_at: new Date().toISOString()
        }]);
        setInput('');

        const { error } = await supabase
            .from('chat_messages')
            .insert({
                message: messageText,
                sender_id: user.id,
                // receiver_id is NULL for admin/support
            });

        if (error) {
            console.error('Error sending message:', error);
            // Remove the optimistic message if failed
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            alert('ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        } else {
            // Refresh messages after successful send
            fetchMessages();
        }
    };

    // Manual refresh
    const handleRefresh = () => {
        fetchMessages(true);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 bg-primary hover:bg-red-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(255,0,85,0.5)] transition-all transform hover:scale-110 ${isOpen ? 'hidden' : 'block'}`}
            >
                <FaComments className="text-2xl" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-primary text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-primary">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 h-[500px] bg-[#1a1b26] border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-primary p-4 rounded-t-2xl flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <FaComments /> Support Chat
                        </h3>
                        <div className="flex items-center gap-2">
                            {user && (
                                <button
                                    onClick={handleRefresh}
                                    disabled={messagesLoading}
                                    className="text-white/80 hover:text-white p-1 disabled:opacity-50"
                                    title="รีเฟรช"
                                >
                                    <FaSync className={`text-sm ${messagesLoading ? 'animate-spin' : ''}`} />
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loading ? (
                            <div className="flex justify-center items-center h-full text-gray-400">
                                <FaSync className="animate-spin mr-2" /> กำลังโหลด...
                            </div>
                        ) : !user ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <FaComments className="text-4xl text-gray-600" />
                                <p className="text-gray-400">กรุณาเข้าสู่ระบบเพื่อแชทกับทีมงาน</p>
                                <Link
                                    href="/login"
                                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full font-bold transition-all"
                                >
                                    เข้าสู่ระบบ
                                </Link>
                            </div>
                        ) : messagesLoading && messages.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-gray-400">
                                <FaSync className="animate-spin mr-2" /> กำลังโหลดข้อความ...
                            </div>
                        ) : (
                            <>
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'user'
                                                ? 'bg-primary text-white rounded-br-none'
                                                : 'bg-white/10 text-gray-200 rounded-bl-none'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    {user && (
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="พิมพ์ข้อความ..."
                                    className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-primary hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
