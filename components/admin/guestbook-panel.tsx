"use client";

import { useEffect, useState, useTransition } from "react";
import { getAllGuestbookMessages, deleteGuestbookMessage } from "@/app/actions/admin";
import {
  MessageSquare,
  Search,
  Loader2,
  Trash2,
  User,
  Calendar,
  ExternalLink,
} from "lucide-react";

interface GuestbookMessage {
  id: number;
  profileUserId: string;
  authorId: string;
  message: string;
  createdAt: Date | null;
  profileUsername: string | null;
  authorUsername: string | null;
}

export function GuestbookPanel() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  async function fetchMessages() {
    try {
      setLoading(true);
      const data = await getAllGuestbookMessages();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(
    (msg) =>
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.authorUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.profileUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (messageId: number) => {
    startTransition(async () => {
      try {
        await deleteGuestbookMessage(messageId);
        await fetchMessages();
      } catch (error) {
        console.error("Failed to delete message:", error);
        alert(error instanceof Error ? error.message : "Ошибка удаления");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-mono font-semibold text-white">Гостевая книга</h2>
          <p className="text-sm font-mono text-neutral-500">
            Всего: {messages.length} сообщений
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
        <input
          type="text"
          placeholder="Поиск по сообщению или пользователю..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-neutral-200 font-mono text-sm placeholder-neutral-600 focus:outline-none focus:border-red-500/30 transition-colors"
        />
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 font-mono">
            Сообщений не найдено
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Author and Target */}
                  <div className="flex items-center gap-2 text-sm font-mono mb-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <User className="w-4 h-4" />
                      <span className="text-red-400">@{msg.authorUsername || "unknown"}</span>
                    </div>
                    <span className="text-neutral-600">→</span>
                    <a
                      href={`/${msg.profileUsername || ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                      <span>{msg.profileUsername || "unknown"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Message */}
                  <p className="text-neutral-200 text-sm mb-2 break-words">
                    {msg.message}
                  </p>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-600">
                    <Calendar className="w-3.5 h-3.5" />
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleString("ru")
                      : "—"}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(msg.id)}
                  disabled={isPending}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors shrink-0"
                  title="Удалить сообщение"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
