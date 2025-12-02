'use client';

import { useState, useEffect, useRef } from 'react';
import { FaComments, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'admin';
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, text: 'Hello! How can we help you today?', sender: 'admin' }
    ]);
    const [input, setInput] = useState('');
    const [user, setUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Check auth state
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // Load initial messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (data) {
                setMessages(data.map((msg: any) => ({
                    id: msg.id,
                    text: msg.message,
                    sender: msg.sender_id ? 'user' : 'admin' // Simplified logic
                })));
            }
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('public:chat_messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload: any) => {
                const newMessage = payload.new;
                setMessages(prev => [...prev, {
                    id: newMessage.id,
                    text: newMessage.message,
                    sender: newMessage.sender_id ? 'user' : 'admin'
                }]);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, []); // Empty dependency array for initial load and subscription setup

    // Keep this useEffect to scroll to bottom whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Optimistic update
        const tempId = Date.now();
        setMessages(prev => [...prev, { id: tempId, text: input, sender: 'user' }]);
        setInput('');

        const { error } = await supabase
            .from('chat_messages')
            .insert({ message: input, sender_id: (await supabase.auth.getUser()).data.user?.id });

        if (error) {
            console.error('Error sending message:', error);
            // Rollback or show error
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 bg-primary hover:bg-red-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(255,0,85,0.5)] transition-all transform hover:scale-110 ${isOpen ? 'hidden' : 'block'}`}
            >
                <FaComments className="text-2xl" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 h-[500px] bg-card-bg border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-primary p-4 rounded-t-2xl flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <FaComments /> Support Chat
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10">
                        {user ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-primary hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-2">
                                <p className="text-gray-400 text-sm mb-2">กรุณาเข้าสู่ระบบเพื่อติดต่อ Admin</p>
                                <Link
                                    href="/login"
                                    className="inline-block bg-primary/20 text-primary border border-primary/50 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all"
                                >
                                    เข้าสู่ระบบ
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
