"use client";

import { useState, useEffect, useRef } from "react";
import { Send, X, User, Shield, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { io, Socket } from "socket.io-client";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/config";

interface Message {
    _id?: string;
    bookingId: string;
    senderId: string;
    content: string;
    timestamp: string;
}

interface BookingChatProps {
    bookingId: string;
    recipientName: string;
    onClose: () => void;
}

export default function BookingChat({ bookingId, recipientName, onClose }: BookingChatProps) {
    const { user, token } = useAuth();
    const [typing, setTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch Chat History
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/chat/${bookingId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setMessages(data);
            } catch (err) {
                console.error("Failed to fetch chat history:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();

        // Initialize Socket
        const newSocket = io("http://localhost:5000");
        setSocket(newSocket);

        newSocket.emit("join_chat", bookingId);

        newSocket.on("new_message", (msg: Message) => {
            if (msg.bookingId === bookingId) {
                setMessages((prev) => {
                    // Dedupe based on _id or optimistic update check if implemented
                    if (prev.some(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
                // Scroll to bottom
                setTimeout(() => {
                    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
                }, 100);
            }
        });

        newSocket.on('typing', () => setTyping(true));
        newSocket.on('stop_typing', () => setTyping(false));

        return () => {
            newSocket.disconnect();
        };
    }, [bookingId, token]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, typing]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);

        if (socket) {
            socket.emit('typing', `chat_${bookingId}`);

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('stop_typing', `chat_${bookingId}`);
            }, 1000);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user) return;

        const content = input.trim();
        setInput(""); // Optimistic clear

        try {
            // 1. Save to DB (Server will emit socket event)
            const res = await fetch(`${API_BASE_URL}/api/chat/${bookingId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (!res.ok) throw new Error("Failed to send");

            // Stop typing immediately
            socket?.emit('stop_typing', `chat_${bookingId}`);

        } catch (err) {
            console.error("Failed to send message:", err);
            // Optionally restore input or show error
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-white">{recipientName}</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-gray-400">Online</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            <MessageSquare className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-400">No messages yet.</p>
                        <p className="text-xs text-gray-600">Start the conversation with {recipientName}!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.id;
                        return (
                            <div
                                key={msg._id || idx}
                                className={cn(
                                    "flex flex-col max-w-[80%]",
                                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-3 rounded-2xl text-sm shadow-md",
                                        isMe
                                            ? "bg-blue-600 text-white rounded-br-none"
                                            : "bg-[#222] text-gray-100 border border-white/5 rounded-bl-none"
                                    )}
                                >
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-gray-600 mt-1 px-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}

                {/* Typing Indicator */}
                {typing && (
                    <div className="flex items-center gap-2 text-gray-500 text-xs ml-2 animate-pulse">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span>Typing...</span>
                    </div>
                )}
            </div>

            {/* Footer / Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-[#111]">
                <div className="flex gap-2 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInput}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20 active:scale-95"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
