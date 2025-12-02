'use client';

import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import { useState, useEffect, useRef } from 'react';
import { FaUser, FaPaperPlane } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';

interface Message {
    id: number | string; // Supabase IDs are numbers, but temp IDs can be numbers too
    text: string;
    sender: 'user' | 'admin';
    created_at: string;
}

interface Conversation {
    id: string; // User ID
    user: string; // Email or a derived name
    lastMessage: string;
    time: string;
    unread: number;
}

export default function AdminChat() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Fetch conversations (users who have chatted)
    useEffect(() => {
        const fetchConversations = async () => {
            // This is a simplified query. In a real app, you'd use a view or a more complex query
            // to get the latest message for each unique sender and their unread status.
            const { data, error } = await supabase
                .from('chat_messages')
                .select('sender_id, message, created_at, is_read')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching conversations:', error);
                return;
            }

            if (data) {
                // Group by sender_id to simulate conversations list
                const uniqueSenders = new Map<string, Conversation>();
                data.forEach((msg: any) => {
                    if (msg.sender_id && !uniqueSenders.has(msg.sender_id)) {
                        uniqueSenders.set(msg.sender_id, {
                            id: msg.sender_id,
                            user: 'User ' + msg.sender_id.slice(0, 4), // Mock email/name
                            lastMessage: msg.message,
                            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            unread: msg.is_read ? 0 : 1 // This logic needs refinement for actual unread counts
                        });
                    }
                });
                setConversations(Array.from(uniqueSenders.values()));
            }
        };

        fetchConversations();

        // Optional: Subscribe to new messages to update conversation list in real-time
        const channel = supabase
            .channel('conversations_list')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload: any) => {
                // Re-fetch conversations or update the list more intelligently
                fetchConversations();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Fetch messages for selected chat and subscribe to real-time updates
    useEffect(() => {
        if (!selectedChat) {
            setMessages([]); // Clear messages if no chat is selected
            return;
        }

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .or(`sender_id.eq.${selectedChat},receiver_id.eq.${selectedChat}`)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching messages:', error);
                return;
            }

            if (data) {
                const adminId = (await supabase.auth.getUser()).data.user?.id;
                setMessages(data.map((msg: any) => ({
                    id: msg.id,
                    text: msg.message,
                    sender: msg.sender_id === selectedChat ? 'user' : 'admin', // Assuming admin is the current user
                    created_at: msg.created_at
                })));
            }
        };

        fetchMessages();

        // Subscribe to new messages for this specific chat
        const channel = supabase
            .channel(`chat:${selectedChat}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `sender_id=eq.${selectedChat}` // Only listen for messages from the selected user
            }, (payload: any) => {
                const newMsg = payload.new;
                setMessages(prev => [...prev, {
                    id: newMsg.id,
                    text: newMsg.message,
                    sender: 'user', // New message from the user
                    created_at: newMsg.created_at
                }]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedChat]);

    const handleSend = async () => {
        if (!input.trim() || !selectedChat) return;

        const adminUser = await supabase.auth.getUser();
        const adminId = adminUser.data.user?.id;

        if (!adminId) {
            console.error('Admin user not logged in.');
            return;
        }

        const tempId = Date.now(); // Temporary ID for optimistic UI update
        setMessages(prev => [...prev, {
            id: tempId,
            text: input,
            sender: 'admin',
            created_at: new Date().toISOString()
        }]);
        setInput('');

        const { error } = await supabase.from('chat_messages').insert({
            message: input,
            receiver_id: selectedChat,
            sender_id: adminId, // Admin ID
            is_read: true // Admin messages are considered read by admin
        });

        if (error) {
            console.error('Error sending message:', error);
            // Optionally, revert the optimistic update or show an error
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <AdminSidebar />

            <main className="ml-64 pt-24 px-8 h-screen pb-8 flex flex-col">
                <h1 className="text-3xl font-bold mb-8">แชทช่วยเหลือ</h1>

                <div className="flex-1 bg-card-bg border border-white/10 rounded-2xl overflow-hidden flex">
                    {/* Chat List */}
                    <div className="w-1/3 border-r border-white/10 flex flex-col">
                        <div className="p-4 border-b border-white/10">
                            <input
                                type="text"
                                placeholder="ค้นหาผู้ใช้..."
                                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {conversations.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => setSelectedChat(chat.id)}
                                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedChat === chat.id ? 'bg-white/5 border-l-4 border-l-primary' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-white">{chat.user}</span>
                                        <span className="text-xs text-gray-500">{chat.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                                    {chat.unread > 0 && (
                                        <span className="inline-block bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full mt-2">
                                            {chat.unread}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-black/20">
                        {selectedChat ? (
                            <>
                                {/* Header */}
                                <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-card-bg">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <FaUser />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">User {selectedChat.slice(0, 8)}</h3>
                                        <span className="text-xs text-green-500">ออนไลน์</span>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`${msg.sender === 'admin' ? 'bg-primary text-white rounded-br-none' : 'bg-white/10 text-gray-200 rounded-bl-none'} p-3 rounded-xl max-w-[70%]`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-4 bg-card-bg border-t border-white/10">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="พิมพ์ข้อความ..."
                                            className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                        />
                                        <button
                                            onClick={handleSend}
                                            className="bg-primary hover:bg-red-600 text-white px-6 rounded-lg transition-colors font-bold flex items-center gap-2"
                                        >
                                            <FaPaperPlane /> ส่ง
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                เลือกการสนทนาเพื่อเริ่มแชท
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
