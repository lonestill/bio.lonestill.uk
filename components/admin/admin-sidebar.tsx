"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { motion } from "framer-motion";
import {
  Users,
  BarChart3,
  MessageSquare,
  Key,
  Settings,
  LogOut,
  Shield,
  ArrowLeft,
  Database,
  Activity,
  Headphones,
} from "lucide-react";

interface AdminSidebarProps {
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

const navigation = [
  { id: "overview", label: "Обзор", icon: Activity },
  { id: "users", label: "Пользователи", icon: Users },
  { id: "tickets", label: "Поддержка", icon: Headphones },
  { id: "analytics", label: "Аналитика", icon: BarChart3 },
  { id: "guestbook", label: "Гостевая книга", icon: MessageSquare },
  { id: "tokens", label: "API токены", icon: Key },
  { id: "system", label: "Система", icon: Database },
];

export function AdminSidebar({ username, displayName, avatarUrl }: AdminSidebarProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-gradient-to-b from-red-950/20 to-neutral-950/80 backdrop-blur-xl border-r border-red-500/10 flex flex-col z-30">
      {/* Logo Section */}
      <div className="p-6 border-b border-red-500/10">
        <Link href="/dashboard" className="flex items-center gap-3 group font-mono">
          <ArrowLeft className="w-4 h-4 text-red-400 group-hover:-translate-x-1 transition-transform" />
          <span className="text-neutral-300 group-hover:text-white transition-colors">Назад в панель</span>
        </Link>
        <div className="flex items-center gap-2 mt-4">
          <Shield className="w-5 h-5 text-red-400" />
          <span className="text-lg font-mono font-bold text-white">Админ-панель</span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-red-400/50 mt-1 font-mono">
          Полный доступ
        </div>
      </div>

      {/* Admin Card */}
      <div className="p-4">
        <div className="rounded-xl p-4 bg-red-500/5 border border-red-500/10">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName || username}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-red-500/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm text-neutral-200 truncate">
                {displayName || username}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
                <Shield className="w-3 h-3" />
                <span>Администратор</span>
              </div>
            </div>
          </div>
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
                href={`/admin?tab=${item.id}`}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-mono transition-all duration-200 group ${
                  isActive
                    ? "bg-red-600/20 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-red-400" : "text-neutral-500 group-hover:text-neutral-400"
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400 shadow-lg shadow-red-400/50" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-red-500/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-mono text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-all group mb-2"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-500 group-hover:text-neutral-400 transition-colors" />
          <span>К панели управления</span>
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
