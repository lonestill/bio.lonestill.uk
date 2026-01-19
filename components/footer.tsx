"use client";

import Link from "next/link";
import { Github, Heart } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-neutral-800/30 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono text-sm text-neutral-500 flex items-center gap-1">
            <span>{t("madeWith")}</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span>{t("by")}</span>
            <Link 
              href="https://github.com/lonestill" 
              target="_blank"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              lonestill
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/lonestill/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-neutral-500 hover:text-purple-400 transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
