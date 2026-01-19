import Link from "next/link";
import { Header } from "@/components/header";
import { Ban, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function BannedPage() {
  const t = await getTranslations("banned");

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(239, 68, 68, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(239, 68, 68, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Gradient orbs - red theme */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-red-600/15 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Banned Content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
          {/* Ban Icon */}
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center animate-pulse">
              <Ban className="w-16 h-16 text-red-500" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-red-500/20 blur-xl -z-10" />
          </div>

          {/* Message */}
          <h1 className="text-3xl md:text-4xl font-mono font-bold text-white mb-4 text-center">
            {t("title")}
          </h1>

          <div className="glass rounded-2xl p-6 md:p-8 max-w-lg w-full mb-8 border-red-500/20">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-red-500/10">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm font-mono text-red-400">{t("status")}</span>
            </div>

            <div className="font-mono text-sm space-y-4">
              <p className="text-neutral-300">
                {t("message")}
              </p>

              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <p className="text-neutral-500 text-xs mb-2">{t("reasons.title")}</p>
                <ul className="text-neutral-400 text-xs space-y-1">
                  <li>• {t("reasons.spam")}</li>
                  <li>• {t("reasons.rules")}</li>
                  <li>• {t("reasons.suspicious")}</li>
                  <li>• {t("reasons.reports")}</li>
                </ul>
              </div>

              <p className="text-neutral-500 text-xs">
                {t("appealInfo")}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="px-8 py-4 rounded-xl font-mono text-sm font-medium bg-neutral-900/50 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 hover:bg-neutral-800/50 transition-all duration-300"
            >
              {t("goHome")}
            </Link>

            <Link
              href="/support"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-mono text-sm font-medium bg-red-600/20 border border-red-500/20 text-red-400 hover:bg-red-600/30 hover:border-red-500/30 transition-all duration-300"
            >
              <Mail className="w-4 h-4" />
              {t("contactSupport")}
            </Link>
          </div>

          {/* Decorative elements */}
          <div className="mt-16 flex items-center gap-4 text-neutral-600 font-mono text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <span>status: banned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scanlines effect */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] z-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />
    </main>
  );
}
