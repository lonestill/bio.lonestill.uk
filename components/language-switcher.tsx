"use client";

import { useTransition } from "react";
import { setLocale } from "@/app/actions/locale";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  currentLocale: string;
  variant?: "default" | "compact";
}

const languages = [
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

export function LanguageSwitcher({ currentLocale, variant = "default" }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (locale: string) => {
    startTransition(() => {
      setLocale(locale);
    });
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            disabled={isPending}
            className={`px-2 py-1 rounded text-xs font-mono transition-all ${
              currentLocale === lang.code
                ? "bg-purple-600/20 text-purple-400 border border-purple-500/20"
                : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
            }`}
          >
            {lang.flag}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-all"
        disabled={isPending}
      >
        <Globe className="w-4 h-4" />
        <span>{languages.find((l) => l.code === currentLocale)?.flag}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-1 py-1 rounded-lg bg-neutral-900 border border-neutral-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[140px]">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            disabled={isPending}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-mono transition-colors ${
              currentLocale === lang.code
                ? "bg-purple-600/10 text-purple-400"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
