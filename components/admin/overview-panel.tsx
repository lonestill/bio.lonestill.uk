"use client";

import { useEffect, useState } from "react";
import { getGlobalAnalytics } from "@/app/actions/admin";
import {
  Users,
  Eye,
  MousePointerClick,
  MessageSquare,
  Key,
  Music,
  Crown,
  Shield,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  usersToday: number;
  usersThisWeek: number;
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  totalClicks: number;
  clicksToday: number;
  totalMessages: number;
  messagesToday: number;
  activeTokens: number;
  spotifyConnections: number;
  premiumUsers: number;
  adminUsers: number;
  recentRegistrations: { date: string; count: number }[];
  topUsersByViews: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    views: number;
  }[];
}

export function OverviewPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getGlobalAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20 text-neutral-500">
        Не удалось загрузить данные
      </div>
    );
  }

  const mainStats = [
    {
      label: "Всего пользователей",
      value: analytics.totalUsers,
      subValue: `+${analytics.usersToday} сегодня`,
      icon: Users,
      color: "red",
    },
    {
      label: "Просмотров профилей",
      value: analytics.totalViews,
      subValue: `+${analytics.viewsToday} сегодня`,
      icon: Eye,
      color: "orange",
    },
    {
      label: "Кликов по ссылкам",
      value: analytics.totalClicks,
      subValue: `+${analytics.clicksToday} сегодня`,
      icon: MousePointerClick,
      color: "amber",
    },
    {
      label: "Сообщений гостевой",
      value: analytics.totalMessages,
      subValue: `+${analytics.messagesToday} сегодня`,
      icon: MessageSquare,
      color: "yellow",
    },
  ];

  const secondaryStats = [
    { label: "API токенов", value: analytics.activeTokens, icon: Key },
    { label: "Spotify подключений", value: analytics.spotifyConnections, icon: Music },
    { label: "Premium пользователей", value: analytics.premiumUsers, icon: Crown },
    { label: "Администраторов", value: analytics.adminUsers, icon: Shield },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    red: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
      icon: "text-red-500",
    },
    orange: {
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      text: "text-orange-400",
      icon: "text-orange-500",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      icon: "text-amber-500",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      text: "text-yellow-400",
      icon: "text-yellow-500",
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-mono font-semibold text-white">Обзор системы</h2>
          <p className="text-sm font-mono text-neutral-500">Ключевые показатели платформы</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          const colors = colorMap[stat.color];

          return (
            <div
              key={stat.label}
              className={`p-5 rounded-2xl border ${colors.border} ${colors.bg} hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
              </div>
              <div className={`text-2xl font-mono font-bold ${colors.text} mb-1`}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs font-mono text-neutral-500">{stat.label}</div>
              <div className="text-xs font-mono text-green-400 mt-1">{stat.subValue}</div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-neutral-500" />
                <div>
                  <div className="text-lg font-mono font-bold text-neutral-200">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-neutral-500">{stat.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Chart */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h3 className="text-sm font-mono text-neutral-400 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Регистрации за 7 дней
          </h3>
          <div className="flex items-end gap-2 h-32">
            {analytics.recentRegistrations.map((day, index) => {
              const maxCount = Math.max(...analytics.recentRegistrations.map((d) => d.count), 1);
              const height = (day.count / maxCount) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t transition-all duration-500"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-[10px] font-mono text-neutral-600">
                    {new Date(day.date).toLocaleDateString("ru", { weekday: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-center">
            <span className="text-sm font-mono text-neutral-500">
              Всего за неделю:{" "}
              <span className="text-red-400 font-bold">{analytics.usersThisWeek}</span>
            </span>
          </div>
        </div>

        {/* Top Users */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h3 className="text-sm font-mono text-neutral-400 mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Топ пользователей по просмотрам
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {analytics.topUsersByViews.slice(0, 5).map((user, index) => (
              <div
                key={user.username}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 transition-colors"
              >
                <span className="text-sm font-mono text-neutral-600 w-5">{index + 1}.</span>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                    <Users className="w-4 h-4 text-neutral-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-neutral-200 truncate">
                    {user.displayName || user.username}
                  </div>
                  <div className="text-xs font-mono text-neutral-500">@{user.username}</div>
                </div>
                <div className="text-sm font-mono text-red-400 font-bold">
                  {user.views.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
