"use client";

import { logout } from "@/app/actions/auth";
import Link from "next/link";

interface DashboardSidebarProps {
  username: string;
  displayName?: string;
}

export function DashboardSidebar({ username, displayName }: DashboardSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[250px] bg-black/40 backdrop-blur-md border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="block">
          <div className="font-mono text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            BIO
          </div>
          <div className="text-xs font-mono text-neutral-500 mt-1">
            Панель управления
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          <div className="px-4 py-2 text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">
            Основное
          </div>
          <Link
            href="/dashboard"
            className="block px-4 py-2 font-mono text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            Профиль
          </Link>
          <Link
            href="/dashboard/change-password"
            className="block px-4 py-2 font-mono text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            Смена пароля
          </Link>
          
          <div className="px-4 py-2 text-xs font-mono text-neutral-500 uppercase tracking-wider mt-4 mb-2">
            Кастомизация
          </div>
          <Link
            href="/dashboard?tab=design"
            className="block px-4 py-2 font-mono text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            Дизайн
          </Link>
          <Link
            href="/dashboard?tab=effects"
            className="block px-4 py-2 font-mono text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            Эффекты
          </Link>
          
          <div className="px-4 py-2 text-xs font-mono text-neutral-500 uppercase tracking-wider mt-4 mb-2">
            Контент
          </div>
          <Link
            href="/dashboard?tab=links"
            className="block px-4 py-2 font-mono text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            Ссылки
          </Link>
          
          <div className="px-4 py-2 text-xs font-mono text-neutral-500 uppercase tracking-wider mt-4 mb-2">
            Аналитика
          </div>
          <Link
            href="/dashboard?tab=analytics"
            className="block px-4 py-2 font-mono text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            Статистика
          </Link>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="mb-4">
          <div className="font-mono text-sm text-neutral-400 mb-1">
            Пользователь
          </div>
          <div className="font-mono text-base text-white">
            {displayName || username}
          </div>
          <div className="font-mono text-xs text-neutral-500 mt-1">
            @{username}
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 hover:border-red-500/50 transition-all font-mono text-xs text-red-400"
          >
            LOGOUT
          </button>
        </form>
      </div>
    </aside>
  );
}
