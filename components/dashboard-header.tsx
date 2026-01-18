"use client";

import Link from "next/link";
import { logout } from "@/app/actions/auth";

interface DashboardHeaderProps {
  username: string;
  displayName?: string;
}

export function DashboardHeader({ username, displayName }: DashboardHeaderProps) {
  return (
    <header className="border-b border-white/10 p-4 md:p-6 flex items-center justify-between bg-black/40 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Link href="/" className="block">
          <div className="font-mono text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            BIO
          </div>
        </Link>
        <div className="h-6 w-px bg-white/10" />
        <div className="font-mono text-sm text-neutral-400">
          Панель управления
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="hidden md:flex flex-col items-end mr-4">
          <div className="font-mono text-sm text-white">
            {displayName || username}
          </div>
          <div className="font-mono text-xs text-neutral-500">
            @{username}
          </div>
        </div>
        
        {/* View Page Button */}
        <Link
          href={`/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 hover:border-purple-500/50 transition-all font-mono text-sm text-purple-400 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
        >
          Посмотреть страницу
        </Link>
        
        {/* Logout Button */}
        <form action={logout}>
          <button
            type="submit"
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 hover:border-red-500/50 transition-all font-mono text-xs text-red-400"
          >
            LOGOUT
          </button>
        </form>
      </div>
    </header>
  );
}
