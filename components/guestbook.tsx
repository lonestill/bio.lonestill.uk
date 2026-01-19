"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, User, Loader2, LogIn } from "lucide-react";
import Link from "next/link";

interface GuestbookMessage {
  id: number;
  message: string;
  createdAt: string;
  author: {
    username: string;
    displayName: string;
    avatar: string | null;
  };
}

interface GuestbookProps {
  username: string;
  primaryColor?: string;
}

export function Guestbook({ username, primaryColor = "#8b5cf6" }: GuestbookProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Check if user is logged in
  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => setIsLoggedIn(data.authenticated))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Fetch messages when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchMessages();
    }
  }, [isOpen]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guestbook?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    console.log("sendMessage called", { newMessage, sending, username });
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      console.log("Sending to API...");
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, message: newMessage }),
      });

      const data = await res.json();
      console.log("API response:", res.status, data);

      if (!res.ok) {
        setError(data.error || "Error sending message");
        return;
      }

      setMessages([data.message, ...messages]);
      setNewMessage("");
    } catch (err) {
      console.error("Send error:", err);
      setError("Failed to send");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "сейчас";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}м`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}ч`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}д`;
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{ backgroundColor: primaryColor }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Гостевая книга"
      >
        <MessageSquare className="w-5 h-5 text-white" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-xs font-bold flex items-center justify-center"
            style={{ color: primaryColor }}>
            {messages.length > 9 ? "9+" : messages.length}
          </span>
        )}
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-neutral-800 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" style={{ color: primaryColor }} />
                  <h2 className="font-mono font-bold text-white">Гостевая книга</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 text-neutral-700" />
                    <p className="text-neutral-500 font-mono text-sm">Пока пусто</p>
                    <p className="text-neutral-600 font-mono text-xs mt-1">Будь первым!</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <motion.div
                      key={msg.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800"
                    >
                      <div className="flex items-start gap-3">
                        <Link href={`/${msg.author.username}`} className="shrink-0">
                          {msg.author.avatar ? (
                            <img
                              src={msg.author.avatar}
                              alt={msg.author.displayName}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                              <User className="w-4 h-4 text-neutral-500" />
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/${msg.author.username}`}
                              className="font-mono text-sm text-white hover:underline"
                            >
                              {msg.author.displayName}
                            </Link>
                            <span className="text-xs text-neutral-600 font-mono">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-neutral-300 text-sm mt-1 break-words">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-neutral-800">
                {isLoggedIn === null ? (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
                  </div>
                ) : isLoggedIn === false ? (
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-neutral-800 text-neutral-300 font-mono text-sm hover:bg-neutral-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Войдите чтобы написать
                  </Link>
                ) : (
                  <div className="space-y-2">
                    {error && (
                      <p className="text-red-400 text-xs font-mono">{error}</p>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !sending && sendMessage()}
                        placeholder="Оставьте сообщение..."
                        maxLength={280}
                        className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => sendMessage()}
                        disabled={!newMessage.trim() || sending}
                        className="px-4 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-neutral-600 font-mono text-right">
                      {newMessage.length}/280
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
