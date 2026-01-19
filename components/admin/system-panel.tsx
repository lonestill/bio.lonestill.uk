"use client";

import { useEffect, useState, useTransition } from "react";
import { getSystemStats, cleanupOldAnalytics } from "@/app/actions/admin";
import {
  Database,
  Loader2,
  Trash2,
  HardDrive,
  Table,
  RefreshCw,
  AlertTriangle,
  Check,
} from "lucide-react";

interface SystemStats {
  tables: {
    users: number;
    profiles: number;
    sessions: number;
    profileViews: number;
    linkClicks: number;
    guestbookMessages: number;
    apiTokens: number;
    spotifyTokens: number;
  };
}

export function SystemPanel() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [cleanupDays, setCleanupDays] = useState(90);
  const [cleanupSuccess, setCleanupSuccess] = useState(false);

  async function fetchStats() {
    try {
      setLoading(true);
      const data = await getSystemStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCleanup = async () => {
    if (
      !confirm(
        `Вы уверены, что хотите удалить аналитику старше ${cleanupDays} дней? Это действие необратимо.`
      )
    )
      return;

    startTransition(async () => {
      try {
        await cleanupOldAnalytics(cleanupDays);
        setCleanupSuccess(true);
        setTimeout(() => setCleanupSuccess(false), 3000);
        await fetchStats();
      } catch (error) {
        console.error("Failed to cleanup:", error);
        alert(error instanceof Error ? error.message : "Ошибка очистки");
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

  if (!stats) {
    return (
      <div className="text-center py-20 text-neutral-500">
        Не удалось загрузить данные
      </div>
    );
  }

  const tableData = [
    { name: "users", label: "Пользователи", count: stats.tables.users },
    { name: "profiles", label: "Профили", count: stats.tables.profiles },
    { name: "sessions", label: "Сессии", count: stats.tables.sessions },
    { name: "profileViews", label: "Просмотры профилей", count: stats.tables.profileViews },
    { name: "linkClicks", label: "Клики по ссылкам", count: stats.tables.linkClicks },
    { name: "guestbookMessages", label: "Гостевая книга", count: stats.tables.guestbookMessages },
    { name: "apiTokens", label: "API токены", count: stats.tables.apiTokens },
    { name: "spotifyTokens", label: "Spotify токены", count: stats.tables.spotifyTokens },
  ];

  const totalRecords = Object.values(stats.tables).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
          <Database className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-mono font-semibold text-white">Система</h2>
          <p className="text-sm font-mono text-neutral-500">
            Статистика базы данных и инструменты
          </p>
        </div>
      </div>

      {/* Database Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20">
          <div className="flex items-center gap-3 mb-3">
            <HardDrive className="w-6 h-6 text-red-400" />
            <span className="text-sm font-mono text-neutral-400">База данных</span>
          </div>
          <div className="text-3xl font-mono font-bold text-red-400">SQLite</div>
          <div className="text-xs font-mono text-neutral-500 mt-1">Turso/LibSQL</div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center gap-3 mb-3">
            <Table className="w-6 h-6 text-neutral-500" />
            <span className="text-sm font-mono text-neutral-400">Таблиц</span>
          </div>
          <div className="text-3xl font-mono font-bold text-neutral-200">
            {Object.keys(stats.tables).length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-6 h-6 text-neutral-500" />
            <span className="text-sm font-mono text-neutral-400">Всего записей</span>
          </div>
          <div className="text-3xl font-mono font-bold text-neutral-200">
            {totalRecords.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tables Stats */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
        <h3 className="text-sm font-mono text-neutral-400 mb-4 flex items-center gap-2">
          <Table className="w-4 h-4" />
          Статистика таблиц
        </h3>
        <div className="space-y-3">
          {tableData.map((table) => {
            const percentage = totalRecords > 0 ? (table.count / totalRecords) * 100 : 0;

            return (
              <div
                key={table.name}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm text-neutral-300">{table.label}</span>
                    <span className="font-mono text-sm text-neutral-500">
                      {table.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 1)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-mono text-neutral-600 w-12 text-right">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cleanup Tools */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 border border-red-500/20">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-mono text-neutral-400">Очистка данных</h3>
        </div>

        <p className="text-sm text-neutral-500 mb-4">
          Удалите старые записи аналитики (просмотры профилей и клики по ссылкам) для
          оптимизации базы данных.
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-mono text-neutral-400">Старше чем:</label>
            <select
              value={cleanupDays}
              onChange={(e) => setCleanupDays(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-sm"
            >
              <option value={30}>30 дней</option>
              <option value={60}>60 дней</option>
              <option value={90}>90 дней</option>
              <option value={180}>180 дней</option>
              <option value={365}>1 год</option>
            </select>
          </div>

          <button
            onClick={handleCleanup}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-400 font-mono text-sm transition-all disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : cleanupSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {cleanupSuccess ? "Очищено!" : "Очистить"}
          </button>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-sm transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Обновить статистику
        </button>
      </div>
    </div>
  );
}
