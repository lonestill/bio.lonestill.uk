"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("hero");
  const texts = [t("texts.0"), t("texts.1"), t("texts.2")];
  
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const currentText = texts[currentTextIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentText.length) {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(currentText.slice(0, displayedText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 40 : 80);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentTextIndex, texts]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto w-full text-center space-y-10">
        {/* Main heading with typewriter */}
        <div className="h-20 md:h-28 flex items-center justify-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-mono font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            {displayedText}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-1 h-8 md:h-12 bg-purple-400 ml-2 align-middle"
            />
          </h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-base md:text-lg text-neutral-400 font-mono max-w-xl mx-auto"
        >
          {t("subtitle")}
        </motion.p>

        {/* Interactive URL input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center max-w-xl mx-auto"
        >
          <div className="flex-1 flex items-center font-mono text-lg md:text-xl bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 w-full backdrop-blur-sm">
            <span className="text-neutral-500">bio.lonestill.uk/</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder={t("placeholder")}
              className="bg-transparent border-none outline-none text-purple-400 flex-1 placeholder:text-neutral-600 min-w-0"
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && username.trim()) {
                  window.location.href = `/register?username=${encodeURIComponent(username.trim())}`;
                }
              }}
            />
          </div>
          <Link
            href={username.trim() ? `/register?username=${encodeURIComponent(username.trim())}` : '/register'}
            className="group font-mono text-base px-6 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] whitespace-nowrap text-white font-medium"
          >
            {t("cta")}
            <motion.span
              className="inline-block ml-2"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-8 text-sm font-mono text-neutral-500 pt-8"
        >
          <div className="flex items-center gap-2">
            <span className="text-purple-400">✦</span>
            <span>{t("stats.backgrounds")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">✦</span>
            <span>{t("stats.nickEffects")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">✦</span>
            <span>{t("stats.linkStyles")}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
