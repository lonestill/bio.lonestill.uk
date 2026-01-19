"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getAllApiTokens,
  deleteApiToken,
  updateApiTokenRateLimit,
} from "@/app/actions/admin";
import {
  Key,
  Search,
  Loader2,
  Trash2,
  User,
  Calendar,
  Clock,
  Activity,
  Edit,
  X,
  Check,
} from "lucide-react";

interface ApiToken {
  id: string;
  userId: string;
  name: string;
  lastUsedAt: Date | null;
  createdAt: Date | null;
  expiresAt: Date | null;
  rateLimit: number;
  requestCount: number;
  username: string | null;
}

export function TokensPanel() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [newRateLimit, setNewRateLimit] = useState<number>(1000);

  async function fetchTokens() {
    try {
      setLoading(true);
      const data = await getAllApiTokens();
      setTokens(data);
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTokens();
  }, []);

  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (tokenId: string) => {
    if (!confirm("Удалить этот API токен?")) return;

    startTransition(async () => {
      try {
        await deleteApiToken(tokenId);
        await fetchTokens();
      } catch (error) {
        console.error("Failed to delete token:", error);
        alert(error instanceof Error ? error.message : "Ошибка удаления");
      }
    });
  };

  const handleUpdateRateLimit = async (tokenId: string) => {
    startTransition(async () => {
      try {
        await updateApiTokenRateLimit(tokenId, newRateLimit);
        setEditingToken(null);
        await fetchTokens();
      } catch (error) {
        console.error("Failed to update rate limit:", error);
        alert(error instanceof Error ? error.message : "Ошибка обновления");
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
          <Key className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-mono font-semibold text-white">API токены</h2>
          <p className="text-sm font-mono text-neutral-500">
            Всего: {tokens.length} токенов
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
        <input
          type="text"
          placeholder="Поиск по названию или пользователю..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-neutral-200 font-mono text-sm placeholder-neutral-600 focus:outline-none focus:border-red-500/30 transition-colors"
        />
      </div>

      {/* Tokens List */}
      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-900/50 border-b border-neutral-800">
                <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  Токен
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  Лимит
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  Использовано
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  Последняя активность
                </th>
                <th className="px-4 py-3 text-right text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-500 font-mono">
                    Токенов не найдено
                  </td>
                </tr>
              ) : (
                filteredTokens.map((token) => (
                  <tr
                    key={token.id}
                    className="hover:bg-neutral-900/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-mono text-sm text-neutral-200">{token.name}</div>
                        <div className="text-xs font-mono text-neutral-600">
                          ID: {token.id.slice(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-neutral-600" />
                        <span className="font-mono text-sm text-red-400">
                          @{token.username || "unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {editingToken === token.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={newRateLimit}
                            onChange={(e) => setNewRateLimit(parseInt(e.target.value) || 0)}
                            className="w-24 px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-sm"
                          />
                          <button
                            onClick={() => handleUpdateRateLimit(token.id)}
                            disabled={isPending}
                            className="p-1 rounded hover:bg-green-500/20 text-green-400"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingToken(null)}
                            className="p-1 rounded hover:bg-neutral-800 text-neutral-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-neutral-400">
                            {token.rateLimit.toLocaleString()}/день
                          </span>
                          <button
                            onClick={() => {
                              setEditingToken(token.id);
                              setNewRateLimit(token.rateLimit);
                            }}
                            className="p-1 rounded hover:bg-neutral-800 text-neutral-600 hover:text-neutral-400"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-neutral-600" />
                        <span className="font-mono text-sm text-neutral-400">
                          {token.requestCount.toLocaleString()}
                        </span>
                        <div className="w-20 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-500"
                            style={{
                              width: `${Math.min((token.requestCount / token.rateLimit) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-500">
                        <Clock className="w-3.5 h-3.5" />
                        {token.lastUsedAt
                          ? new Date(token.lastUsedAt).toLocaleString("ru")
                          : "Никогда"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleDelete(token.id)}
                          disabled={isPending}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                          title="Удалить токен"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
