import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollText, AlertTriangle, Shield, Ban, Heart } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";

export default async function TermsPage() {
  const t = await getTranslations("terms");
  const locale = await getLocale();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
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
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/20 mb-6">
              <ScrollText className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-mono font-bold text-white mb-4">
              {t("title")}
            </h1>
            <p className="text-neutral-400 font-mono">
              {t("lastUpdated")}: {new Date().toLocaleDateString(locale)}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Intro */}
            <section className="glass rounded-2xl p-6">
              <p className="text-neutral-300 font-mono text-sm leading-relaxed">
                {t("intro")}
              </p>
            </section>

            {/* Prohibited Content */}
            <section className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-xl font-mono font-semibold text-white">
                  {t("prohibited.title")}
                </h2>
              </div>
              <ul className="space-y-3 text-neutral-300 font-mono text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span><strong>NSFW</strong> — {t("prohibited.nsfw")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{t("prohibited.violence")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{t("prohibited.discrimination")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{t("prohibited.illegal")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{t("prohibited.spam")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{t("prohibited.phishing")}</span>
                </li>
              </ul>
            </section>

            {/* Usernames */}
            <section className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-mono font-semibold text-white">
                  {t("usernames.title")}
                </h2>
              </div>
              <ul className="space-y-3 text-neutral-300 font-mono text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>{t("usernames.offensive")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>{t("usernames.impersonation")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>{t("usernames.forceChange")}</span>
                </li>
              </ul>
            </section>

            {/* Security */}
            <section className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-mono font-semibold text-white">
                  {t("security.title")}
                </h2>
              </div>
              <ul className="space-y-3 text-neutral-300 font-mono text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{t("security.hacking")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{t("security.reportBugs")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{t("security.automation")}</span>
                </li>
              </ul>
            </section>

            {/* Respect */}
            <section className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-400" />
                </div>
                <h2 className="text-xl font-mono font-semibold text-white">
                  {t("respect.title")}
                </h2>
              </div>
              <ul className="space-y-3 text-neutral-300 font-mono text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-1">•</span>
                  <span>{t("respect.beRespectful")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-1">•</span>
                  <span>{t("respect.noHarassment")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-1">•</span>
                  <span>{t("respect.noDoxxing")}</span>
                </li>
              </ul>
            </section>

            {/* Consequences */}
            <section className="glass rounded-2xl p-6 border-red-500/20">
              <h2 className="text-xl font-mono font-semibold text-white mb-4">
                {t("consequences.title")}
              </h2>
              <div className="space-y-3 text-neutral-300 font-mono text-sm">
                <p>{t("consequences.intro")}</p>
                <ul className="space-y-2 ml-4">
                  <li>1. <span className="text-yellow-400">{t("consequences.warning")}</span></li>
                  <li>2. <span className="text-orange-400">{t("consequences.tempBan")}</span></li>
                  <li>3. <span className="text-red-400">{t("consequences.permaBan")}</span></li>
                </ul>
                <p className="text-neutral-500 text-xs mt-4">
                  {t("consequences.note")}
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="text-center py-6">
              <p className="text-neutral-500 font-mono text-sm">
                {t("contact")}{" "}
                <a href="/support" className="text-purple-400 hover:text-purple-300 underline">
                  support
                </a>
              </p>
            </section>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
