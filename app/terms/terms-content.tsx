"use client";

import { 
  ScrollText, 
  AlertTriangle, 
  Shield, 
  Ban, 
  Heart, 
  Skull,
  Flame,
  Users,
  AtSign,
  Lock,
  Bug,
  Bot,
  MessageSquareWarning,
  UserX,
  FileWarning,
  Gavel,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { motion, useScroll, useSpring } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

const sections = [
  { id: "intro", icon: ScrollText },
  { id: "prohibited", icon: Ban },
  { id: "usernames", icon: AtSign },
  { id: "security", icon: Shield },
  { id: "respect", icon: Heart },
  { id: "consequences", icon: Gavel },
];

export function TermsContent() {
  const t = useTranslations("terms");
  const locale = useLocale();
  const [activeSection, setActiveSection] = useState("intro");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative inline-block mb-8"
          >
            {/* Glowing icon container */}
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 rounded-3xl blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/30 flex items-center justify-center backdrop-blur-sm">
                <ScrollText className="w-12 h-12 text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-mono font-black mb-4"
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              {t("title")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-neutral-400 font-mono text-sm"
          >
            {t("lastUpdated")}: {new Date().toLocaleDateString(locale)}
          </motion.p>

          {/* Quick nav pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mt-8"
          >
            {sections.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs transition-all ${
                  activeSection === id
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                    : "bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t(`${id}.title`)}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Intro Section */}
        <motion.section
          id="intro"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20 border border-purple-500/20 p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <p className="relative text-neutral-300 font-mono text-sm md:text-base leading-relaxed">
              {t("intro.text")}
            </p>
          </div>
        </motion.section>

        {/* Prohibited Content */}
        <motion.section
          id="prohibited"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="rounded-3xl bg-gradient-to-br from-red-950/30 to-transparent border border-red-500/20 overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center gap-4 p-6 border-b border-red-500/10 bg-red-500/5">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <Ban className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-mono font-bold text-white">
                  {t("prohibited.title")}
                </h2>
                <p className="text-red-400/70 text-xs font-mono mt-1">ZERO TOLERANCE</p>
              </div>
            </div>

            {/* Items Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Skull, text: t("prohibited.nsfw"), label: "NSFW" },
                { icon: Flame, text: t("prohibited.violence"), label: null },
                { icon: Users, text: t("prohibited.discrimination"), label: null },
                { icon: FileWarning, text: t("prohibited.illegal"), label: null },
                { icon: MessageSquareWarning, text: t("prohibited.spam"), label: null },
                { icon: Lock, text: t("prohibited.phishing"), label: null },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <item.icon className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    {item.label && (
                      <span className="text-xs font-mono font-bold text-red-400 block mb-1">{item.label}</span>
                    )}
                    <span className="text-neutral-300 font-mono text-sm">{item.text}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Usernames */}
        <motion.section
          id="usernames"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="rounded-3xl bg-gradient-to-br from-amber-950/30 to-transparent border border-amber-500/20 overflow-hidden">
            <div className="flex items-center gap-4 p-6 border-b border-amber-500/10 bg-amber-500/5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <AtSign className="w-7 h-7 text-amber-400" />
              </div>
              <h2 className="text-2xl font-mono font-bold text-white">
                {t("usernames.title")}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {[
                { icon: AlertTriangle, text: t("usernames.offensive") },
                { icon: UserX, text: t("usernames.impersonation") },
                { icon: ChevronRight, text: t("usernames.forceChange") },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:translate-x-2 transition-transform"
                >
                  <item.icon className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-neutral-300 font-mono text-sm">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Security */}
        <motion.section
          id="security"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="rounded-3xl bg-gradient-to-br from-purple-950/30 to-transparent border border-purple-500/20 overflow-hidden">
            <div className="flex items-center gap-4 p-6 border-b border-purple-500/10 bg-purple-500/5">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-purple-400" />
              </div>
              <h2 className="text-2xl font-mono font-bold text-white">
                {t("security.title")}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {[
                { icon: Lock, text: t("security.hacking"), highlight: false },
                { icon: Bug, text: t("security.reportBugs"), highlight: true },
                { icon: Bot, text: t("security.automation"), highlight: false },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:translate-x-2 ${
                    item.highlight
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-purple-500/5 border-purple-500/10"
                  }`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${item.highlight ? "text-green-400" : "text-purple-400"}`} />
                  <span className="text-neutral-300 font-mono text-sm">{item.text}</span>
                  {item.highlight && (
                    <span className="ml-auto px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-mono">
                      🏆 Badge!
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Respect */}
        <motion.section
          id="respect"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="rounded-3xl bg-gradient-to-br from-pink-950/30 to-transparent border border-pink-500/20 overflow-hidden">
            <div className="flex items-center gap-4 p-6 border-b border-pink-500/10 bg-pink-500/5">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center">
                <Heart className="w-7 h-7 text-pink-400" />
              </div>
              <h2 className="text-2xl font-mono font-bold text-white">
                {t("respect.title")}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {[
                { text: t("respect.beRespectful"), emoji: "🤝" },
                { text: t("respect.noHarassment"), emoji: "🚫" },
                { text: t("respect.noDoxxing"), emoji: "🔒" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-pink-500/5 border border-pink-500/10 hover:translate-x-2 transition-transform"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-neutral-300 font-mono text-sm">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Consequences - Timeline Style */}
        <motion.section
          id="consequences"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="rounded-3xl bg-gradient-to-br from-neutral-900 to-transparent border border-neutral-800 overflow-hidden">
            <div className="flex items-center gap-4 p-6 border-b border-neutral-800 bg-neutral-900/50">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 flex items-center justify-center">
                <Gavel className="w-7 h-7 text-orange-400" />
              </div>
              <h2 className="text-2xl font-mono font-bold text-white">
                {t("consequences.title")}
              </h2>
            </div>

            <div className="p-6">
              <p className="text-neutral-400 font-mono text-sm mb-6">{t("consequences.intro")}</p>

              {/* Timeline */}
              <div className="relative pl-8 border-l-2 border-neutral-700 space-y-8">
                {/* Warning */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                  className="relative"
                >
                  <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-yellow-500/30 border-2 border-yellow-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  </div>
                  <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">⚠️</span>
                      <span className="font-mono font-bold text-yellow-400">1.</span>
                      <span className="text-neutral-300 font-mono text-sm">{t("consequences.warning")}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Temp Ban */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                  className="relative"
                >
                  <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-orange-500/30 border-2 border-orange-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                  </div>
                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">⏸️</span>
                      <span className="font-mono font-bold text-orange-400">2.</span>
                      <span className="text-neutral-300 font-mono text-sm">{t("consequences.tempBan")}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Perma Ban */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="relative"
                >
                  <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-red-500/30 border-2 border-red-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🚫</span>
                      <span className="font-mono font-bold text-red-400">3.</span>
                      <span className="text-neutral-300 font-mono text-sm">{t("consequences.permaBan")}</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              <p className="text-neutral-600 font-mono text-xs mt-8 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                {t("consequences.note")}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Contact CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center p-8 rounded-3xl bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20 border border-purple-500/20">
            <p className="text-neutral-400 font-mono text-sm mb-4">
              {t("contact")}
            </p>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-sm transition-all hover:shadow-[0_0_30px_rgba(147,51,234,0.4)]"
            >
              Support
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </motion.section>
      </div>
    </>
  );
}
