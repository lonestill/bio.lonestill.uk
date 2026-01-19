import Link from "next/link";
import { Header } from "@/components/header";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10">
        <Header />

        {/* 404 Content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
          {/* Glitch 404 Number */}
          <div className="relative mb-8">
            <h1 className="text-[12rem] md:text-[16rem] font-mono font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-purple-400 via-purple-600 to-purple-900 select-none">
              404
            </h1>
            {/* Glitch layers */}
            <h1 
              className="absolute inset-0 text-[12rem] md:text-[16rem] font-mono font-black leading-none tracking-tighter text-purple-500/20 select-none animate-pulse"
              style={{ 
                transform: "translate(-4px, -2px)",
                animationDuration: "3s"
              }}
            >
              404
            </h1>
            <h1 
              className="absolute inset-0 text-[12rem] md:text-[16rem] font-mono font-black leading-none tracking-tighter text-violet-500/20 select-none animate-pulse"
              style={{ 
                transform: "translate(4px, 2px)",
                animationDuration: "2.5s",
                animationDelay: "0.5s"
              }}
            >
              404
            </h1>
          </div>

          {/* Terminal-style message */}
          <div className="glass rounded-2xl p-6 md:p-8 max-w-lg w-full mb-8">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-purple-500/10">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-mono text-neutral-600">terminal</span>
            </div>
            
            <div className="font-mono text-sm space-y-2">
              <p className="text-neutral-500">
                <span className="text-purple-400">$</span> find /page
              </p>
              <p className="text-red-400">
                error: страница не найдена
              </p>
              <p className="text-neutral-600 text-xs mt-4">
                Возможные причины:
              </p>
              <ul className="text-neutral-500 text-xs space-y-1 ml-4">
                <li>• Страница была удалена или перемещена</li>
                <li>• Пользователь не существует</li>
                <li>• Ссылка введена неверно</li>
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="group relative px-8 py-4 rounded-xl font-mono text-sm font-medium overflow-hidden transition-all duration-300 hover:scale-105"
            >
              {/* Button gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              
              <span className="relative z-10 flex items-center gap-2 text-white">
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                На главную
              </span>
            </Link>

            <Link
              href="/register"
              className="px-8 py-4 rounded-xl font-mono text-sm font-medium bg-neutral-900/50 border border-purple-500/20 text-neutral-300 hover:text-white hover:border-purple-500/40 hover:bg-neutral-800/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(147,51,234,0.15)]"
            >
              Создать страницу
            </Link>
          </div>

          {/* Decorative elements */}
          <div className="mt-16 flex items-center gap-4 text-neutral-600 font-mono text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500/50 animate-pulse" />
              <span>lonestill.uk</span>
            </div>
            <span className="text-neutral-700">|</span>
            <span>bio pages</span>
          </div>
        </div>
      </div>

      {/* Scanlines effect */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015] z-50"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />
    </main>
  );
}
