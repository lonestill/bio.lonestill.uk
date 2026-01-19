"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { motion } from "framer-motion";
import {
  User,
  Palette,
  Link2,
  BarChart3,
  Sparkles,
  LogOut,
  ExternalLink,
  Award,
  Plug,
  Send,
  Key,
  Shield,
  Crown,
} from "lucide-react";

interface SidebarProps {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  userRole?: string;
}

const navigation = [
  { id: "profile", label: "Профиль", icon: User },
  { id: "design", label: "Дизайн", icon: Palette },
  { id: "effects", label: "Эффекты", icon: Sparkles },
  { id: "links", label: "Ссылки", icon: Link2 },
  { id: "connections", label: "Подключения", icon: Plug },
  { id: "badges", label: "Бейджи", icon: Award },
  { id: "api", label: "API", icon: Key },
  { id: "analytics", label: "Аналитика", icon: BarChart3 },
];

export function Sidebar({ username, displayName, avatarUrl, userRole }: SidebarProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] glass flex flex-col z-30">
      {/* Logo Section */}
      <div className="p-6 border-b border-purple-500/10">
        <Link href="/" className="flex items-center gap-3 group font-mono">
          <span className="text-purple-400">~</span>
          <span className="text-neutral-300 group-hover:text-white transition-colors">/lonestill</span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-block w-2 h-5 bg-purple-400"
          />
        </Link>
        <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 mt-2 font-mono">
          Панель управления
        </div>
      </div>

      {/* User Card */}
      <div className="p-4">
        <div className="glass-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName || username}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-500/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
                <User className="w-6 h-6 text-purple-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm text-neutral-200 truncate">
                {displayName || username}
              </div>
              <div className="text-xs text-neutral-500 font-mono truncate">@{username}</div>
            </div>
          </div>
          <Link
            href={`/${username}`}
            target="_blank"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/20 hover:border-purple-500/30 text-purple-400 text-sm font-mono transition-all group hover:shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
            <span>Открыть страницу</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1 stagger-children">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Link
                key={item.id}
                href={`/dashboard?tab=${item.id}`}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-mono transition-all duration-200 group ${
                  isActive
                    ? "bg-purple-600/20 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.15)]"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-purple-400" : "text-neutral-500 group-hover:text-neutral-400"
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-purple-500/10">
        {userRole === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group mb-1"
          >
            <Shield className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors" />
            <span>Админ-панель</span>
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          </Link>
        )}
      <Link
          href="https://t.me/gittyblog"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-3 md:px-4 py-2 rounded-xl text-sm font-mono text-neutral-500 hover:text-sky-400 hover:bg-sky-500/10 transition-all group"
        >
          <Send className="w-4 h-4 text-neutral-600 group-hover:text-sky-400 transition-colors" />
          <span>Блог разработчика</span>
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-mono text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5 text-neutral-500 group-hover:text-red-400 transition-colors" />
            <span>Выйти</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
