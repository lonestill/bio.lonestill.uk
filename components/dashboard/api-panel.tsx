"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Clock,
  Activity,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface ApiToken {
  id: string;
  name: string;
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  rateLimit: number;
  requestCount: number;
}

export function ApiPanel() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchTokens = async () => {
    try {
      const res = await fetch("/api/v1/tokens");
      const data = await res.json();
      setTokens(data.tokens || []);
    } catch (err) {
      setError("Failed to load tokens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const createToken = async () => {
    if (!newTokenName.trim()) return;
    
    setCreating(true);
    setError(null);
    
    try {
      const res = await fetch("/api/v1/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTokenName }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error);
        return;
      }
      
      setNewToken(data.token);
      setNewTokenName("");
      fetchTokens();
    } catch (err) {
      setError("Failed to create token");
    } finally {
      setCreating(false);
    }
  };

  const deleteToken = async (tokenId: string) => {
    setDeletingId(tokenId);
    
    try {
      await fetch("/api/v1/tokens", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId }),
      });
      
      setTokens(tokens.filter(t => t.id !== tokenId));
    } catch (err) {
      setError("Failed to delete token");
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-3">
            <Key className="w-5 h-5 text-purple-400" />
            API Tokens
          </h2>
          <p className="text-sm font-mono text-neutral-500 mt-1">
            Управляйте токенами для доступа к API
          </p>
        </div>
        <Link
          href="/api-docs"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800/50 border border-neutral-700 text-neutral-300 font-mono text-sm hover:bg-neutral-800 hover:border-neutral-600 transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span>Документация</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* New Token Display */}
      <AnimatePresence>
        {newToken && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
          >
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-green-400 font-mono font-medium">Токен создан!</p>
                  <p className="text-green-400/70 font-mono text-xs mt-1">
                    Скопируйте и сохраните токен — он больше не будет показан.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-black/50 text-green-400 font-mono text-sm break-all">
                    {newToken}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newToken)}
                    className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-green-400" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setNewToken(null)}
                  className="text-xs font-mono text-green-400/50 hover:text-green-400 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-mono">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400/50 hover:text-red-400">
            ✕
          </button>
        </div>
      )}

      {/* Create Token */}
      <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800">
        <h3 className="text-sm font-mono text-neutral-400 mb-4">Создать новый токен</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            placeholder="Название токена (например: My App)"
            className="flex-1 px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
          <button
            onClick={createToken}
            disabled={creating || !newTokenName.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-mono transition-all"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Создать</span>
          </button>
        </div>
        <p className="text-xs font-mono text-neutral-600 mt-3">
          Максимум 5 токенов на аккаунт • 1,000 запросов/день
        </p>
      </div>

      {/* Tokens List */}
      <div className="space-y-3">
        <h3 className="text-sm font-mono text-neutral-400">Ваши токены ({tokens.length}/5)</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-12 text-neutral-600 font-mono">
            <Key className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>Нет созданных токенов</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <motion.div
                key={token.id}
                layout
                className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-purple-400" />
                      <span className="font-mono text-white">{token.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Создан: {formatDate(token.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Использован: {formatDate(token.lastUsedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-neutral-500">
                        Запросов сегодня: <span className="text-purple-400">{token.requestCount}</span>/{token.rateLimit}
                      </span>
                      {token.expiresAt && (
                        <span className="text-amber-400">
                          Истекает: {formatDate(token.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteToken(token.id)}
                    disabled={deletingId === token.id}
                    className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    {deletingId === token.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Start */}
      <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800">
        <h3 className="text-sm font-mono text-neutral-400 mb-4">Быстрый старт</h3>
        <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto">
          <code className="text-green-400 font-mono text-sm">
{`curl -H "Authorization: Bearer YOUR_TOKEN" \\
     https://bio.lonestill.uk/api/v1/profile/username`}
          </code>
        </pre>
        <Link
          href="/api-docs"
          className="inline-flex items-center gap-2 mt-4 text-sm font-mono text-purple-400 hover:text-purple-300 transition-colors"
        >
          <span>Полная документация</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
