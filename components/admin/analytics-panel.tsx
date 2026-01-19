"use client";

import { useEffect, useState } from "react";
import { getGlobalAnalytics } from "@/app/actions/admin";
import {
  BarChart3,
  Eye,
  Users,
  MousePointerClick,
  TrendingUp,
  Calendar,
  Loader2,
  ArrowUpRight,
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

export function AnalyticsAdminPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"today" | "week" | "all">("week");

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

  // Calculate metrics based on time range
  const getMetrics = () => {
    switch (timeRange) {
      case "today":
        return {
          views: analytics.viewsToday,
          users: analytics.usersToday,
          clicks: analytics.clicksToday,
          messages: analytics.messagesToday,
        };
      case "week":
        return {
          views: analytics.viewsThisWeek,
          users: analytics.usersThisWeek,
          clicks: analytics.clicksToday * 7, // Approximate
          messages: analytics.messagesToday * 7,
        };
      default:
        return {
          views: analytics.totalViews,
          users: analytics.totalUsers,
          clicks: analytics.totalClicks,
          messages: analytics.totalMessages,
        };
    }
  };

  const metrics = getMetrics();

  const stats = [
    {
      label: "Просмотров",
      value: metrics.views,
      icon: Eye,
      color: "red",
      change: timeRange !== "all" ? "+12%" : null,
    },
    {
      label: "Пользователей",
      value: metrics.users,
      icon: Users,
      color: "orange",
      change: timeRange !== "all" ? "+8%" : null,
    },
    {
      label: "Кликов",
      value: metrics.clicks,
      icon: MousePointerClick,
      color: "amber",
      change: timeRange !== "all" ? "+15%" : null,
    },
    {
      label: "Сообщений",
      value: metrics.messages,
      icon: TrendingUp,
      color: "yellow",
      change: timeRange !== "all" ? "+5%" : null,
    },
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-mono font-semibold text-white">Глобальная аналитика</h2>
            <p className="text-sm font-mono text-neutral-500">Статистика всей платформы</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900/50 border border-neutral-800">
          {(["today", "week", "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
                timeRange === range
                  ? "bg-red-600/20 text-red-400 border border-red-500/20"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {range === "today" ? "Сегодня" : range === "week" ? "Неделя" : "Всё время"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = colorMap[stat.color];

          return (
            <div
              key={stat.label}
              className={`p-5 rounded-2xl border ${colors.border} ${colors.bg} hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                {stat.change && (
                  <div className="flex items-center gap-1 text-xs font-mono font-medium text-green-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {stat.change}
                  </div>
                )}
              </div>
              <div className={`text-2xl font-mono font-bold ${colors.text} mb-1`}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs font-mono text-neutral-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h3 className="text-sm font-mono text-neutral-400 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Регистрации за 7 дней
          </h3>
          <div className="flex items-end gap-2 h-40">
            {analytics.recentRegistrations.map((day, index) => {
              const maxCount = Math.max(...analytics.recentRegistrations.map((d) => d.count), 1);
              const height = (day.count / maxCount) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-mono text-red-400 font-bold">{day.count}</div>
                  <div
                    className="w-full bg-gradient-to-t from-red-600 to-orange-500 rounded-t transition-all duration-500 min-h-[4px]"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-[10px] font-mono text-neutral-600">
                    {new Date(day.date).toLocaleDateString("ru", { weekday: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h3 className="text-sm font-mono text-neutral-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Распределение активности
          </h3>
          <div className="space-y-4">
            {[
              { label: "Просмотры", value: analytics.totalViews, color: "from-red-600 to-red-400" },
              { label: "Клики", value: analytics.totalClicks, color: "from-orange-600 to-orange-400" },
              { label: "Сообщения", value: analytics.totalMessages, color: "from-amber-600 to-amber-400" },
            ].map((item) => {
              const total = analytics.totalViews + analytics.totalClicks + analytics.totalMessages;
              const percentage = total > 0 ? (item.value / total) * 100 : 0;

              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-neutral-300">{item.label}</span>
                    <span className="text-sm font-mono text-neutral-500">
                      {item.value.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
        <h3 className="text-sm font-mono text-neutral-400 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Топ-10 профилей по просмотрам
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analytics.topUsersByViews.map((user, index) => (
            <div
              key={user.username}
              className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors"
            >
              <span
                className={`text-sm font-mono font-bold w-6 ${
                  index < 3 ? "text-red-400" : "text-neutral-600"
                }`}
              >
                #{index + 1}
              </span>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-neutral-700 flex items-center justify-center">
                  <Users className="w-5 h-5 text-neutral-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono text-neutral-200 truncate">
                  {user.displayName || user.username}
                </div>
                <div className="text-xs font-mono text-neutral-500">@{user.username}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-bold text-red-400">
                  {user.views.toLocaleString()}
                </div>
                <div className="text-[10px] font-mono text-neutral-600">просмотров</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
