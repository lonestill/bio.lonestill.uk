"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface HeaderClientProps {
  isAuthenticated: boolean;
}

export function HeaderClient({ isAuthenticated }: HeaderClientProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800/30 backdrop-blur-xl bg-[#050505]/80">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-mono text-lg text-neutral-300 hover:text-white transition-colors">
            <span className="text-purple-400">~</span>
            <span>/bio</span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block w-2 h-5 bg-purple-400 ml-1"
            />
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="#features"
              className="hidden md:block font-mono text-sm text-neutral-400 hover:text-purple-400 transition-colors"
            >
              Возможности
            </Link>
            <Link
              href="#showcase"
              className="hidden md:block font-mono text-sm text-neutral-400 hover:text-purple-400 transition-colors"
            >
              Превью
            </Link>
            <Link
              href="/leaderboard"
              className="hidden md:flex items-center gap-1.5 font-mono text-sm text-neutral-400 hover:text-purple-400 transition-colors"
            >
              <span>🏆</span>
              <span>Топ</span>
            </Link>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="font-mono text-sm px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 hover:border-purple-500/50 transition-all hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] text-purple-400"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-mono text-sm text-neutral-400 hover:text-purple-400 transition-colors"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="font-mono text-sm px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 hover:border-purple-500/50 transition-all hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] text-purple-400"
                >
                  Создать
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
