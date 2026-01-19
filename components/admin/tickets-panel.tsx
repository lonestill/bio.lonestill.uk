"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getAllTickets,
  updateTicketStatus,
  respondToTicket,
  closeTicket,
  deleteTicket,
} from "@/app/actions/support";
import { TicketStatus, TicketCategory } from "@/db/schema";
import {
  MessageSquare,
  Search,
  Loader2,
  Trash2,
  User,
  Mail,
  Calendar,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";

interface Ticket {
  id: number;
  userId: string | null;
  email: string;
  username: string | null;
  category: TicketCategory | null;
  subject: string;
  message: string;
  status: TicketStatus | null;
  adminId: string | null;
  adminResponse: string | null;
  respondedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  adminUsername: string | null;
}

const STATUS_CONFIG = {
  open: { label: "Открыт", icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  in_progress: { label: "В работе", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  resolved: { label: "Решён", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  closed: { label: "Закрыт", icon: XCircle, color: "text-neutral-400", bg: "bg-neutral-500/10", border: "border-neutral-500/20" },
};

const CATEGORY_LABELS: Record<string, string> = {
  ban_appeal: "Апелляция бана",
  bug_report: "Баг-репорт",
  feature_request: "Предложение",
  account_issue: "Проблема с аккаунтом",
  other: "Другое",
};

export function TicketsPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState("");

  async function fetchTickets() {
    try {
      setLoading(true);
      const data = await getAllTickets();
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (ticketId: number, status: TicketStatus) => {
    startTransition(async () => {
      try {
        await updateTicketStatus(ticketId, status);
        await fetchTickets();
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    });
  };

  const handleRespond = async () => {
    if (!selectedTicket || !response.trim()) return;

    startTransition(async () => {
      try {
        await respondToTicket(selectedTicket.id, response);
        setSelectedTicket(null);
        setResponse("");
        await fetchTickets();
      } catch (error) {
        console.error("Failed to respond:", error);
      }
    });
  };

  const handleClose = async (ticketId: number) => {
    startTransition(async () => {
      try {
        await closeTicket(ticketId);
        await fetchTickets();
      } catch (error) {
        console.error("Failed to close ticket:", error);
      }
    });
  };

  const handleDelete = async (ticketId: number) => {
    if (!confirm("Удалить этот тикет?")) return;

    startTransition(async () => {
      try {
        await deleteTicket(ticketId);
        await fetchTickets();
      } catch (error) {
        console.error("Failed to delete ticket:", error);
      }
    });
  };

  // Count by status
  const statusCounts = tickets.reduce(
    (acc, t) => {
      if (t.status) acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

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
          <h2 className="text-xl font-mono font-semibold text-white">Тикеты поддержки</h2>
          <p className="text-sm font-mono text-neutral-500">
            Всего: {tickets.length} обращений
          </p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map((status) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          const count = statusCounts[status] || 0;

          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
              className={`p-4 rounded-xl border transition-all ${
                statusFilter === status
                  ? `${config.bg} ${config.border}`
                  : "bg-neutral-900/30 border-neutral-800 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${config.color}`} />
                <span className="text-2xl font-mono font-bold text-white">{count}</span>
              </div>
              <p className="text-xs font-mono text-neutral-500 mt-1">{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
        <input
          type="text"
          placeholder="Поиск по теме, email или сообщению..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-neutral-200 font-mono text-sm placeholder-neutral-600 focus:outline-none focus:border-red-500/30 transition-colors"
        />
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 font-mono">
            Тикетов не найдено
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const status = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
            const StatusIcon = status.icon;

            return (
              <div
                key={ticket.id}
                className={`p-5 rounded-xl border transition-colors ${status.bg} ${status.border}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-neutral-500 px-2 py-0.5 rounded bg-neutral-800">
                        #{ticket.id}
                      </span>
                      <span className="text-xs font-mono text-neutral-600">
                        {CATEGORY_LABELS[ticket.category || "other"]}
                      </span>
                    </div>
                    <h3 className="font-mono text-white font-medium">{ticket.subject}</h3>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${status.bg} border ${status.border}`}>
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    <span className={`text-sm font-mono ${status.color}`}>{status.label}</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-xs font-mono text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {ticket.email}
                  </div>
                  {ticket.username && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      @{ticket.username}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString("ru") : "—"}
                  </div>
                </div>

                {/* Message */}
                <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 mb-4">
                  <p className="text-sm text-neutral-300 font-mono whitespace-pre-wrap">
                    {ticket.message}
                  </p>
                </div>

                {/* Admin Response */}
                {ticket.adminResponse && (
                  <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 mb-4">
                    <div className="flex items-center gap-2 mb-2 text-xs font-mono text-neutral-500">
                      <span>Ответ от @{ticket.adminUsername}</span>
                      {ticket.respondedAt && (
                        <span>• {new Date(ticket.respondedAt).toLocaleString("ru")}</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-300 font-mono whitespace-pre-wrap">
                      {ticket.adminResponse}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setResponse(ticket.adminResponse || "");
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/20 text-purple-400 text-sm font-mono transition-all"
                  >
                    <Send className="w-4 h-4" />
                    {ticket.adminResponse ? "Изменить ответ" : "Ответить"}
                  </button>

                  <select
                    value={ticket.status || "open"}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                    disabled={isPending}
                    className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm font-mono cursor-pointer"
                  >
                    <option value="open">Открыт</option>
                    <option value="in_progress">В работе</option>
                    <option value="resolved">Решён</option>
                    <option value="closed">Закрыт</option>
                  </select>

                  {ticket.status !== "closed" && (
                    <button
                      onClick={() => handleClose(ticket.id)}
                      disabled={isPending}
                      className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 transition-colors"
                      title="Закрыть тикет"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(ticket.id)}
                    disabled={isPending}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                    title="Удалить тикет"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-mono font-semibold text-white">
                Ответ на #{selectedTicket.id}
              </h3>
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setResponse("");
                }}
                className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
              <p className="text-xs font-mono text-neutral-500 mb-1">Тема:</p>
              <p className="text-sm font-mono text-neutral-300">{selectedTicket.subject}</p>
            </div>

            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={6}
              placeholder="Введите ваш ответ..."
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-sm placeholder-neutral-600 focus:outline-none focus:border-purple-500/30 resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setResponse("");
                }}
                className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleRespond}
                disabled={isPending || !response.trim()}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-medium transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Отправить"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
