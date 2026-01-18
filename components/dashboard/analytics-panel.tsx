"use client";

import { Profile } from "@/db/schema";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Eye,
  Users,
  MousePointerClick,
  TrendingUp,
  Calendar,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface AnalyticsPanelProps {
  profile: Profile;
}

interface AnalyticsData {
  totalViews: number;
  uniqueVisitorsToday: number;
  uniqueVisitorsAllTime: number;
  ctr: number;
  linkClicks: Record<number, number>;
}

export function AnalyticsPanel({ profile }: AnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics");
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const totalViews = Number(analytics?.totalViews ?? profile.views ?? 0) || 0;
  const uniqueVisitorsToday = Number(analytics?.uniqueVisitorsToday ?? 0) || 0;
  const uniqueVisitorsAllTime = Number(analytics?.uniqueVisitorsAllTime ?? 0) || 0;
  const ctr = Number(analytics?.ctr ?? 0) || 0;
  const linkClicks = analytics?.linkClicks || {};

  const stats = [
    { 
      label: "Всего просмотров", 
      value: totalViews, 
      icon: Eye, 
      color: "purple",
      change: 12,
      positive: true,
    },
    { 
      label: "Посетителей сегодня", 
      value: uniqueVisitorsToday, 
      icon: Calendar, 
      color: "violet",
      change: 8,
      positive: true,
    },
    { 
      label: "Всего посетителей", 
      value: uniqueVisitorsAllTime, 
      icon: Users, 
      color: "fuchsia",
      change: 15,
      positive: true,
    },
    { 
      label: "Конверсия (CTR)", 
      value: `${ctr}%`, 
      icon: MousePointerClick, 
      color: "pink",
      change: 3,
      positive: false,
    },
  ];

  const colorMap = {
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400",
      icon: "text-purple-500",
    },
    violet: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      text: "text-violet-400",
      icon: "text-violet-500",
    },
    fuchsia: {
      bg: "bg-fuchsia-500/10",
      border: "border-fuchsia-500/20",
      text: "text-fuchsia-400",
      icon: "text-fuchsia-500",
    },
    pink: {
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
      text: "text-pink-400",
      icon: "text-pink-500",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-mono font-semibold text-white">Аналитика</h2>
          <p className="text-sm font-mono text-neutral-500">Статистика вашей страницы</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 stagger-children">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = colorMap[stat.color as keyof typeof colorMap];
          
          return (
            <div
              key={stat.label}
              className={`p-5 rounded-2xl border ${colors.border} ${colors.bg} hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-mono font-medium ${
                  stat.positive ? "text-green-400" : "text-red-400"
                }`}>
                  {stat.positive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {stat.change}%
                </div>
              </div>
              <div className={`text-2xl font-mono font-bold ${colors.text} mb-1`}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-xs font-mono text-neutral-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Link Performance */}
      {profile.modules?.socials && profile.modules.socials.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neutral-500" />
            Статистика ссылок
          </h3>
          
          <div className="space-y-3 stagger-children">
            {profile.modules.socials.map((link, index) => {
              const clicks = linkClicks[index] || 0;
              const totalClicks = Object.values(linkClicks).reduce((a, b) => a + b, 0);
              const percentage = totalClicks > 0 ? Math.round((clicks / totalClicks) * 100) : 0;
              
              return (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-mono text-neutral-200">{link.label || link.platform}</div>
                      <div className="text-xs font-mono text-neutral-500 truncate max-w-xs">{link.url}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono font-bold text-purple-400">{clicks}</div>
                      <div className="text-xs font-mono text-neutral-500">кликов</div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs font-mono text-neutral-500 mt-1 text-right">{percentage}% от всех кликов</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coming Soon */}
      
    </div>
  );
}
