'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FaPaperPlane, FaUser, FaSearch, FaSync } from 'react-icons/fa';
import Image from 'next/image';

interface ChatMessage {
    id: string;
    text: string;
    sender_id: string;
    receiver_id: string;
    created_at: string;
    sender_role?: 'user' | 'admin';
}

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    last_message_at?: string;
}

const POLLING_INTERVAL = 5000; // 5 seconds

export default function AdminChat() {
    const [conversations, setConversations] = useState<UserProfile[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [adminId, setAdminId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);

    // Get Admin ID
    useEffect(() => {
        const getAdmin = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setAdminId(user?.id || null);
            } catch (error) {
                console.error('Error getting admin:', error);
            } finally {
                isInitialized.current = true;
            }
        };
        getAdmin();
    }, []);

    // Fetch conversations using RPC
    const fetchConversations = useCallback(async (showLoading = false) => {
        if (!adminId) return;

        if (showLoading) setLoading(true);

        try {
            const { data, error } = await supabase.rpc('get_chat_users');

            if (error) {
                console.error('Error fetching conversations:', error);
                // Fallback: fetch from chat_messages directly
                const { data: fallbackData } = await supabase
                    .from('chat_messages')
                    .select('sender_id, receiver_id, created_at')
                    .order('created_at', { ascending: false });

                if (fallbackData) {
                    // Get unique user IDs (excluding admin)
                    const userIds = new Set<string>();
                    fallbackData.forEach((msg: any) => {
                        if (msg.sender_id && msg.sender_id !== adminId) userIds.add(msg.sender_id);
                        if (msg.receiver_id && msg.receiver_id !== adminId) userIds.add(msg.receiver_id);
                    });

                    // Fetch user profiles
                    if (userIds.size > 0) {
                        const { data: usersData } = await supabase
                            .from('users')
                            .select('id, full_name, email, avatar_url')
                            .in('id', Array.from(userIds));

                        if (usersData) {
                            setConversations(usersData);
                        }
                    }
                }
            } else if (data) {
                // Filter out the admin themselves if they appear in the list
                const filtered = data.filter((u: any) => u.id !== adminId);
                // Sort by last_message_at desc
                filtered.sort((a: any, b: any) =>
                    new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
                );
                setConversations(filtered);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [adminId]);

    // Fetch messages for selected user
    const fetchMessages = useCallback(async (showLoading = false) => {
        if (!selectedUser || !adminId) return;

        if (showLoading) setMessagesLoading(true);

        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .or(`sender_id.eq.${selectedUser.id},receiver_id.eq.${selectedUser.id}`)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching messages:', error);
                return;
            }

            if (data) {
                setMessages(data.map((msg: any) => ({
                    id: msg.id,
                    text: msg.message,
                    sender_id: msg.sender_id,
                    receiver_id: msg.receiver_id,
                    created_at: msg.created_at,
                    sender_role: msg.sender_id === adminId ? 'admin' : 'user'
                })));
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            if (showLoading) setMessagesLoading(false);
        }
    }, [selectedUser, adminId]);

    // Initial fetch and polling for conversations
    useEffect(() => {
        if (!adminId) return;

        fetchConversations(true);

        // Polling for new conversations (without loading indicator)
        const intervalId = setInterval(() => {
            fetchConversations(false);
        }, POLLING_INTERVAL);

        return () => {
            clearInterval(intervalId);
        };
    }, [adminId, fetchConversations]);

    // Fetch messages when selected user changes and polling
    useEffect(() => {
        if (!selectedUser || !adminId) return;

        fetchMessages(true);

        // Polling for new messages (without loading indicator)
        const intervalId = setInterval(() => {
            fetchMessages(false);
        }, POLLING_INTERVAL);

        return () => {
            clearInterval(intervalId);
        };
    }, [selectedUser, adminId, fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Manual refresh function
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([fetchConversations(false), fetchMessages(false)]);
        setIsRefreshing(false);
    };

    const handleSend = async () => {
        if (!input.trim() || !selectedUser || !adminId) return;

        const messageText = input.trim();
        const tempId = Date.now().toString();

        setMessages(prev => [...prev, {
            id: tempId,
            text: messageText,
            sender_id: adminId,
            receiver_id: selectedUser.id,
            created_at: new Date().toISOString(),
            sender_role: 'admin'
        }]);
        setInput('');

        try {
            const { error } = await supabase.from('chat_messages').insert({
                message: messageText,
                sender_id: adminId,
                receiver_id: selectedUser.id
            });

            if (error) {
                console.error('Error sending message:', error);
                // Remove optimistic message on error
                setMessages(prev => prev.filter(m => m.id !== tempId));
                alert('ส่งข้อความไม่สำเร็จ กรุณาลองใหม่');
            } else {
                // Refresh conversations to update timestamp
                fetchConversations(false);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert('ส่งข้อความไม่สำเร็จ กรุณาลองใหม่');
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 animate-fade-in">
            {/* Sidebar List */}
            <div className="w-80 glass rounded-3xl overflow-hidden flex flex-col border border-white/10">
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">แชทลูกค้า</h2>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                            title="รีเฟรช"
                        >
                            <FaSync className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="ค้นหา..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50"
                        />
                        <FaSearch className="absolute left-3.5 top-2.5 text-gray-500 text-sm" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-32 text-gray-400">
                            <FaSync className="animate-spin mr-2" /> กำลังโหลด...
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex justify-center items-center h-32 text-gray-500 text-sm">
                            ยังไม่มีแชท
                        </div>
                    ) : (
                        conversations.map(user => (
                            <button
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 ${selectedUser?.id === user.id ? 'bg-primary/10 border-primary/20' : ''}`}
                            >
                                <div className="relative w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                                    {user.avatar_url ? (
                                        <Image src={user.avatar_url} alt={user.full_name} fill sizes="40px" className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <FaUser />
                                        </div>
                                    )}
                                </div>
                                <div className="text-left overflow-hidden flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-white truncate">{user.full_name || 'User'}</h3>
                                        {user.last_message_at && (
                                            <span className="text-[10px] text-gray-500">
                                                {new Date(user.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col border border-white/10">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                                {selectedUser.avatar_url ? (
                                    <Image src={selectedUser.avatar_url} alt={selectedUser.full_name} fill sizes="40px" className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FaUser />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{selectedUser.full_name || 'User'}</h3>
                                <p className="text-xs text-gray-400">{selectedUser.email}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messagesLoading ? (
                                <div className="flex justify-center items-center h-full text-gray-400">
                                    <FaSync className="animate-spin mr-2" /> กำลังโหลดข้อความ...
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex justify-center items-center h-full text-gray-500 text-sm">
                                    ยังไม่มีข้อความ
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.sender_role === 'admin'
                                                ? 'bg-primary text-white rounded-br-none'
                                                : 'bg-white/10 text-gray-200 rounded-bl-none'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="พิมพ์ข้อความ..."
                                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-primary hover:bg-red-600 text-white p-3 rounded-xl transition-colors"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <FaPaperPlane className="text-4xl mb-4 opacity-20" />
                        <p>เลือกแชทเพื่อเริ่มสนทนา</p>
                    </div>
                )}
            </div>
        </div>
    );
}
