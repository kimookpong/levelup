'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FaPaperPlane, FaUser, FaSearch } from 'react-icons/fa';

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

export default function AdminChat() {
    const [conversations, setConversations] = useState<UserProfile[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [adminId, setAdminId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get Admin ID
    useEffect(() => {
        const getAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setAdminId(user?.id || null);
        };
        getAdmin();
    }, []);

    // Fetch conversations using RPC
    const fetchConversations = async () => {
        const { data, error } = await supabase.rpc('get_chat_users');
        if (error) {
            console.error('Error fetching conversations:', error);
        } else if (data) {
            // Filter out the admin themselves if they appear in the list
            const filtered = data.filter((u: any) => u.id !== adminId);
            // Sort by last_message_at desc
            filtered.sort((a: any, b: any) =>
                new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
            );
            setConversations(filtered);
        }
    };

    useEffect(() => {
        if (adminId) {
            fetchConversations();

            // Subscribe to ALL new messages to update the conversation list order
            const globalChannel = supabase
                .channel('global_chat_updates')
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                    () => {
                        fetchConversations();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(globalChannel);
            };
        }
    }, [adminId]);

    // Fetch messages for selected user
    useEffect(() => {
        if (!selectedUser || !adminId) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('chat_messages')
                .select('*')
                .or(`sender_id.eq.${selectedUser.id},receiver_id.eq.${selectedUser.id}`)
                .order('created_at', { ascending: true });

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
        };

        fetchMessages();

        const channel = supabase
            .channel(`chat:${selectedUser.id}`)
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `sender_id=eq.${selectedUser.id}`
                },
                (payload: any) => {
                    const newMessage = payload.new;
                    setMessages(prev => [...prev, {
                        id: newMessage.id,
                        text: newMessage.message,
                        sender_id: newMessage.sender_id,
                        receiver_id: newMessage.receiver_id,
                        created_at: newMessage.created_at,
                        sender_role: 'user'
                    }]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedUser, adminId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

        await supabase.from('chat_messages').insert({
            message: messageText,
            sender_id: adminId,
            receiver_id: selectedUser.id
        });

        // Refresh conversations to update timestamp
        fetchConversations();
    };

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 animate-fade-in">
            {/* Sidebar List */}
            <div className="w-80 glass rounded-3xl overflow-hidden flex flex-col border border-white/10">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4">แชทลูกค้า</h2>
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
                    {conversations.map(user => (
                        <button
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 ${selectedUser?.id === user.id ? 'bg-primary/10 border-primary/20' : ''}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
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
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col border border-white/10">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                                {selectedUser.avatar_url ? (
                                    <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="w-full h-full object-cover" />
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
                            {messages.map((msg) => (
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
                            ))}
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
