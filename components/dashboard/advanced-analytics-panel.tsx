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
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";

interface AdvancedAnalyticsData {
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    totalEvents: number;
    totalSessions: number;
    avgSessionDuration: number;
    avgPageViewsPerSession: string;
    avgEventsPerSession: string;
  };
  pageViews: Array<{
    path: string;
    views: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
  }>;
  devices: Array<{ device: string; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
  operatingSystems: Array<{ os: string; count: number }>;
  geographic: Array<{ country: string; count: number }>;
  timeSeries: Array<{
    period: string;
    pageViews: number;
    uniqueVisitors: number;
  }>;
  topEvents: Array<{
    eventName: string;
    eventType: string;
    count: number;
  }>;
  referrers: Array<{ referrer: string; count: number }>;
}

export function AdvancedAnalyticsPanel() {
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
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
        `/api/analytics/advanced?timeRange=${timeRange}&groupBy=${groupBy}`
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-mono font-semibold text-white">
              Расширенная аналитика
            </h2>
            <p className="text-sm font-mono text-neutral-500">
              Детальная статистика посещений
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
            <MousePointerClick className="w-4 h-4 text-fuchsia-400" />
            <span className="text-xs font-mono text-neutral-400 uppercase">
              События
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {data.overview.totalEvents.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-pink-500/20 bg-pink-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-mono text-neutral-400 uppercase">
              Ср. время сессии
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {formatDuration(data.overview.avgSessionDuration)}
          </div>
        </div>
      </div>

      {/* Time Series Chart (simplified bar chart) */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-lg font-mono font-semibold text-white mb-4">
          Динамика посещений
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
                    {item.pageViews} просмотров, {item.uniqueVisitors}{" "}
                    посетителей
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
            Популярные страницы
          </h3>
          <div className="space-y-3">
            {data.pageViews.slice(0, 10).map((page, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-mono text-white">
                    {page.path}
                  </div>
                  <div className="text-xs font-mono text-neutral-400 mt-1">
                    {page.views} просмотров • {page.uniqueVisitors} посетителей
                    • {formatDuration(page.avgTimeOnPage)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-mono font-semibold text-white mb-4">
            Топ событий
          </h3>
          <div className="space-y-3">
            {data.topEvents.slice(0, 10).map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div className="flex-1">
                  <div className="text-sm font-mono text-white">
                    {event.eventName}
                  </div>
                  <div className="text-xs font-mono text-neutral-400 mt-1">
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

        {/* Devices */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-mono font-semibold text-white mb-4">
            Устройства
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

        {/* Browsers */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-mono font-semibold text-white mb-4">
            Браузеры
          </h3>
          <div className="space-y-3">
            {data.browsers.slice(0, 5).map((browser, index) => {
              const total = data.browsers.reduce((sum, b) => sum + b.count, 0);
              const percentage = ((browser.count / total) * 100).toFixed(1);

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-mono text-white">
                      {browser.browser}
                    </div>
                    <div className="text-sm font-mono text-neutral-400">
                      {browser.count} ({percentage}%)
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-fuchsia-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic */}
        {data.geographic.length > 0 && (
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <h3 className="text-lg font-mono font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              География
            </h3>
            <div className="space-y-3">
              {data.geographic.map((geo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
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

        {/* Referrers */}
        {data.referrers.length > 0 && (
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <h3 className="text-lg font-mono font-semibold text-white mb-4">
              Источники трафика
            </h3>
            <div className="space-y-3">
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
        )}
      </div>

      {/* Session Stats */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-lg font-mono font-semibold text-white mb-4">
          Статистика сессий
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-purple-400">
              {data.overview.totalSessions}
            </div>
            <div className="text-sm font-mono text-neutral-400 mt-1">
              Всего сессий
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-violet-400">
              {data.overview.avgPageViewsPerSession}
            </div>
            <div className="text-sm font-mono text-neutral-400 mt-1">
              Страниц за сессию
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-fuchsia-400">
              {data.overview.avgEventsPerSession}
            </div>
            <div className="text-sm font-mono text-neutral-400 mt-1">
              Событий за сессию
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
