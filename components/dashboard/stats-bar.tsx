"use client";

import { Eye, Users, MousePointerClick, TrendingUp } from "lucide-react";

interface StatsBarProps {
  totalViews: number;
  uniqueVisitors: number;
  linkClicks: number;
  ctr: number;
}

export function StatsBar({ totalViews, uniqueVisitors, linkClicks, ctr }: StatsBarProps) {
  // Ensure all values are numbers
  const views = Number(totalViews) || 0;
  const visitors = Number(uniqueVisitors) || 0;
  const clicks = Number(linkClicks) || 0;
  const clickRate = Number(ctr) || 0;

  const stats = [
    {
      label: "Просмотры",
      value: views.toLocaleString(),
      icon: Eye,
      color: "purple",
      description: "Всего заходов",
    },
    {
      label: "Посетители",
      value: visitors.toLocaleString(),
      icon: Users,
      color: "violet",
      description: "Уникальных",
    },
    {
      label: "Клики",
      value: clicks.toLocaleString(),
      icon: MousePointerClick,
      color: "fuchsia",
      description: "По ссылкам",
    },
    {
      label: "CTR",
      value: `${clickRate}%`,
      icon: TrendingUp,
      color: "pink",
      description: "Конверсия",
    },
  ];

  const colorClasses = {
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color as keyof typeof colorClasses];
        
        return (
          <div
            key={stat.label}
            className={`glass-subtle rounded-2xl p-5 border ${colors.border} hover:scale-[1.02] transition-transform duration-300`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">
                  {stat.label}
                </p>
                <p className={`text-2xl font-mono font-bold ${colors.text}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xs font-mono text-neutral-500">{stat.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
