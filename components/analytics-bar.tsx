"use client";

interface AnalyticsBarProps {
  totalViews: number;
  uniqueVisitors: number;
  ctr: number;
}

export function AnalyticsBar({ totalViews, uniqueVisitors, ctr }: AnalyticsBarProps) {
  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      {/* Total Views */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
          Всего просмотров
        </div>
        <div className="text-2xl font-mono font-bold text-white mb-1">
          {totalViews.toLocaleString()}
        </div>
        <div className="text-xs font-mono text-green-400 flex items-center gap-1">
          <span>+5%</span>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Unique Visitors */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
          Уникальных посетителей
        </div>
        <div className="text-2xl font-mono font-bold text-white">
          {uniqueVisitors.toLocaleString()}
        </div>
      </div>

      {/* CTR */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
          Переходы по ссылкам
        </div>
        <div className="text-2xl font-mono font-bold text-white">
          {ctr}%
        </div>
      </div>
    </div>
  );
}
