"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  MousePointerClick,
  Users,
  Eye,
  Activity,
  TrendingUp,
  Loader2,
  User,
  Calendar,
} from "lucide-react";

interface GlobalAnalyticsData {
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    totalEvents: number;
    totalSessions: number;
    avgSessionDuration: number;
    avgPageViewsPerSession: string;
    totalUsers: number;
    activeUsers: number;
  };
  timeSeries: Array<{
    period: string;
    pageViews: number;
    uniqueVisitors: number;
  }>;
  topPages: Array<{
    path: string;
    views: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
  }>;
  topProfiles: Array<{
    userId: string;
    username: string;
    displayName: string | null;
    views: number;
    uniqueVisitors: number;
  }>;
  devices: Array<{ device: string; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
  operatingSystems: Array<{ os: string; count: number }>;
  geographic: Array<{ country: string; count: number }>;
  topEvents: Array<{
    eventName: string;
    eventType: string;
    count: number;
  }>;
  referrers: Array<{ referrer: string; count: number }>;
  recentSessions: Array<{
    sessionId: string;
    startedAt: Date;
    duration: number | null;
    pageViews: number;
    events: number;
    device: string | null;
    browser: string | null;
    country: string | null;
    entryPage: string | null;
  }>;
}

export function GlobalAnalyticsPanel() {
  const [data, setData] = useState<GlobalAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [groupBy, setGroupBy] = useState("day");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, groupBy]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/analytics?timeRange=${timeRange}&groupBy=${groupBy}`
      );
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-neutral-400">
        Нет данных для отображения
      </div>
    );
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}м ${secs}с`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-mono font-semibold text-white">
              Глобальная аналитика сайта
            </h2>
            <p className="text-sm font-mono text-neutral-500">
              Статистика всех посещений и пользователей
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono"
          >
            <option value="24h">24 часа</option>
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
            <option value="90d">90 дней</option>
            <option value="all">Всё время</option>
          </select>

          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono"
          >
            <option value="hour">По часам</option>
            <option value="day">По дням</option>
            <option value="week">По неделям</option>
            <option value="month">По месяцам</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono text-neutral-400 uppercase">
              Просмотры
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {data.overview.totalPageViews.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-violet-500/20 bg-violet-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-mono text-neutral-400 uppercase">
              Посетители
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {data.overview.uniqueVisitors.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-fuchsia-400" />
            <span className="text-xs font-mono text-neutral-400 uppercase">
              Активные юзеры
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {data.overview.activeUsers} / {data.overview.totalUsers}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-pink-500/20 bg-pink-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-mono text-neutral-400 uppercase">
              Ср. время
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {formatDuration(data.overview.avgSessionDuration)}
          </div>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-lg font-mono font-semibold text-white mb-4">
          📈 Динамика трафика
        </h3>
        <div className="space-y-2">
          {data.timeSeries.slice(-14).map((item, index) => {
            const maxViews = Math.max(
              ...data.timeSeries.map((d) => d.pageViews)
            );
            const percentage = (item.pageViews / maxViews) * 100;

            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-24 text-xs font-mono text-neutral-400">
                  {item.period}
                </div>
                <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3 text-xs font-mono text-white">
                    {item.pageViews} просм., {item.uniqueVisitors} уник.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-mono font-semibold text-white mb-4">
            🔥 Популярные страницы
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.topPages.map((page, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-white truncate">
                    {page.path}
                  </div>
                  <div className="text-xs font-mono text-neutral-400 mt-1">
                    {page.views} просм. • {page.uniqueVisitors} уник.
                    {page.avgTimeOnPage > 0 && ` • ${formatDuration(page.avgTimeOnPage)}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Profiles */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-mono font-semibold text-white mb-4">
            👥 Топ профилей
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.topProfiles.map((profile, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-white">
                    {profile.displayName || profile.username}
                  </div>
                  <div className="text-xs font-mono text-neutral-400">
                    @{profile.username} • {profile.views} просм. • {profile.uniqueVisitors} уник.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-mono font-semibold text-white mb-4">
            🎯 События пользователей
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.topEvents.slice(0, 15).map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div className="flex-1">
                  <div className="text-sm font-mono text-white">
                    {event.eventName}
                  </div>
                  <div className="text-xs font-mono text-neutral-400">
                    {event.eventType}
                  </div>
                </div>
                <div className="text-sm font-mono font-semibold text-purple-400">
                  {event.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referrers */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-mono font-semibold text-white mb-4">
            🔗 Источники трафика
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.referrers.map((ref, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div className="text-sm font-mono text-white truncate flex-1 mr-2">
                  {ref.referrer}
                </div>
                <div className="text-sm font-mono font-semibold text-purple-400">
                  {ref.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Devices, Browsers, OS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-mono font-semibold text-white mb-4">
            📱 Устройства
          </h3>
          <div className="space-y-3">
            {data.devices.map((device, index) => {
              const total = data.devices.reduce((sum, d) => sum + d.count, 0);
              const percentage = ((device.count / total) * 100).toFixed(1);

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-mono text-white">
                      {getDeviceIcon(device.device)}
                      {device.device}
                    </div>
                    <div className="text-sm font-mono text-neutral-400">
                      {device.count} ({percentage}%)
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-mono font-semibold text-white mb-4">
            🌐 Браузеры
          </h3>
          <div className="space-y-2">
            {data.browsers.slice(0, 5).map((browser, index) => {
              const total = data.browsers.reduce((sum, b) => sum + b.count, 0);
              const percentage = ((browser.count / total) * 100).toFixed(1);

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm font-mono text-white">
                    {browser.browser}
                  </div>
                  <div className="text-sm font-mono text-neutral-400">
                    {browser.count} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-mono font-semibold text-white mb-4">
            💻 Операционные системы
          </h3>
          <div className="space-y-2">
            {data.operatingSystems.slice(0, 5).map((os, index) => {
              const total = data.operatingSystems.reduce((sum, o) => sum + o.count, 0);
              const percentage = ((os.count / total) * 100).toFixed(1);

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm font-mono text-white">{os.os}</div>
                  <div className="text-sm font-mono text-neutral-400">
                    {os.count} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-lg font-mono font-semibold text-white mb-4">
          ⏱️ Последние сессии
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-left text-neutral-400 border-b border-white/10">
                <th className="pb-3 px-2">Время</th>
                <th className="pb-3 px-2">Длительность</th>
                <th className="pb-3 px-2">Страницы</th>
                <th className="pb-3 px-2">События</th>
                <th className="pb-3 px-2">Устройство</th>
                <th className="pb-3 px-2">Браузер</th>
                <th className="pb-3 px-2">Страна</th>
                <th className="pb-3 px-2">Вход</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {data.recentSessions.slice(0, 20).map((session, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-2 px-2">
                    {formatDate(session.startedAt)}
                  </td>
                  <td className="py-2 px-2">
                    {session.duration ? formatDuration(session.duration) : "-"}
                  </td>
                  <td className="py-2 px-2">{session.pageViews}</td>
                  <td className="py-2 px-2">{session.events}</td>
                  <td className="py-2 px-2">{session.device || "-"}</td>
                  <td className="py-2 px-2">{session.browser || "-"}</td>
                  <td className="py-2 px-2">{session.country || "-"}</td>
                  <td className="py-2 px-2 truncate max-w-xs">
                    {session.entryPage || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geographic */}
      {data.geographic.length > 0 && (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-mono font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            География посетителей
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.geographic.map((geo, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-white/5 flex items-center justify-between"
              >
                <div className="text-sm font-mono text-white">
                  {geo.country}
                </div>
                <div className="text-sm font-mono font-semibold text-purple-400">
                  {geo.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
