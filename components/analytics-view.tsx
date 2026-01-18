"use client";

import { Profile } from "@/db/schema";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnalyticsViewProps {
  profile: Profile;
}

interface AnalyticsData {
  totalViews: number;
  uniqueVisitorsToday: number;
  uniqueVisitorsAllTime: number;
  ctr: number;
  linkClicks: Record<number, number>;
}

export function AnalyticsView({ profile }: AnalyticsViewProps) {
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

  // Ensure all values are numbers
  const totalViews = Number(analytics?.totalViews ?? profile.views ?? 0) || 0;
  const uniqueVisitorsToday = Number(analytics?.uniqueVisitorsToday ?? 0) || 0;
  const uniqueVisitorsAllTime = Number(analytics?.uniqueVisitorsAllTime ?? 0) || 0;
  const ctr = Number(analytics?.ctr ?? 0) || 0;
  const linkClicks = analytics?.linkClicks || {};

  const stats = [
    { label: "Всего просмотров", value: totalViews.toLocaleString(), color: "purple" },
    { label: "Уникальных сегодня", value: uniqueVisitorsToday.toLocaleString(), color: "blue" },
    { label: "Уникальных всего", value: uniqueVisitorsAllTime.toLocaleString(), color: "indigo" },
    { label: "CTR", value: `${ctr}%`, color: "green" },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-mono font-bold mb-6">Аналитика</h2>
        <div className="text-center py-12 text-neutral-400 font-mono">
          Загрузка данных...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-mono font-bold mb-6">Аналитика</h2>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4"
          >
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
              {stat.label}
            </div>
            <div 
              className={`text-2xl font-mono font-bold ${
                stat.color === "purple" ? "text-purple-400" :
                stat.color === "blue" ? "text-blue-400" :
                stat.color === "indigo" ? "text-indigo-400" :
                stat.color === "green" ? "text-green-400" :
                "text-orange-400"
              }`}
            >
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Link Performance */}
      {profile.modules?.socials && profile.modules.socials.length > 0 && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <h3 className="text-base font-mono font-bold mb-4 text-purple-400">Статистика ссылок</h3>
          
          <div className="space-y-3">
            {profile.modules.socials.map((link, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <div className="font-mono text-sm text-white">{link.label || link.platform}</div>
                  <div className="font-mono text-xs text-neutral-400 truncate max-w-md">{link.url}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-purple-400">
                    {linkClicks[index] || 0}
                  </div>
                  <div className="font-mono text-xs text-neutral-500">кликов сегодня</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coming Soon */}
      <div className="mt-8 p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-center">
        <div className="font-mono text-sm text-neutral-400 mb-2">
          📊 Детальная аналитика в разработке
        </div>
        <div className="font-mono text-xs text-neutral-500">
          Скоро будут доступны графики, временные периоды и экспорт данных
        </div>
      </div>
    </div>
  );
}
