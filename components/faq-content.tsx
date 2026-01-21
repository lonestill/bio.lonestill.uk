"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  ChevronDown,
  Code2,
  Fingerprint,
  Globe,
  HelpCircle,
  Key,
  LayoutDashboard,
  MessageSquare,
  Palette,
  Sparkles,
  Star,
  User,
  Zap,
} from "lucide-react";

/* ─────────────────────────────────────────── types ─────────────────────────────────────────── */

export interface FaqSection {
  id: string;
  title: string;
  items: Array<{ q: string; a: string }>;
}

export interface FaqProps {
  t: {
    hero: { badge: string; title: string; subtitle: string };
    nav: Record<string, string>;
    sections: FaqSection[];
    showcase: {
      badges: { title: string; items: string[] };
      effects: { title: string; items: string[] };
      modules: { title: string; items: string[] };
      tip: { title: string; text: string };
    };
    cta: { title: string; subtitle: string; button: string };
    quickLinks: { title: string; dashboard: string; apiDocs: string; support: string };
  };
}

/* ─────────────────────────────────────────── icons ─────────────────────────────────────────── */

const NAV_ICONS: Record<string, typeof Key> = {
  account: Key,
  profiles: User,
  badges: Award,
  design: Palette,
  api: Code2,
  analytics: Sparkles,
  interactions: MessageSquare,
  premium: Star,
  support: HelpCircle,
};

const BADGE_COLORS: Record<string, string> = {
  early_adopter: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  hacker: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  premium: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  localhost: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  bughunter: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  hello_kitty: "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

/* ─────────────────────────────────────── components ────────────────────────────────────────── */

function BadgePill({ name }: { name: string }) {
  const colors = BADGE_COLORS[name] || "bg-neutral-800 text-neutral-300 border-neutral-700";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border ${colors}`}>
      <Award className="w-3 h-3" />
      {name}
    </span>
  );
}

function EffectPill({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 border border-violet-500/25 text-violet-200">
      <Zap className="w-3 h-3" />
      {name}
    </span>
  );
}

function ModulePill({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-neutral-900 border border-neutral-700 text-neutral-300">
      <LayoutDashboard className="w-3 h-3" />
      {name}
    </span>
  );
}

function Accordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
      >
        <span className="font-mono text-sm text-white group-hover:text-purple-300 transition-colors">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-500 shrink-0 mt-0.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="pb-4 text-sm font-mono text-neutral-400 leading-relaxed -mt-1">{answer}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────── main ──────────────────────────────────────────── */

export function FaqContent({ t }: FaqProps) {
  const [active, setActive] = useState(t.sections[0]?.id || "account");

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-20 pb-12">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-purple-500/15 border border-purple-500/30 text-purple-300 mb-4">
            {t.hero.badge}
          </span>
          <h1 className="text-3xl md:text-4xl font-mono font-bold text-white">{t.hero.title}</h1>
          <p className="mt-3 text-neutral-400 font-mono text-sm md:text-base max-w-2xl">{t.hero.subtitle}</p>
        </div>
      </section>

      {/* Main */}
      <section className="px-6 md:px-12 lg:px-20 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Content */}
          <div className="space-y-10">
            {/* Showcase cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Badges */}
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="font-mono text-sm font-semibold text-white">{t.showcase.badges.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.showcase.badges.items.map((b) => (
                    <BadgePill key={b} name={b} />
                  ))}
                </div>
              </div>

              {/* Effects */}
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-violet-400" />
                  <h3 className="font-mono text-sm font-semibold text-white">{t.showcase.effects.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.showcase.effects.items.map((e) => (
                    <EffectPill key={e} name={e} />
                  ))}
                </div>
              </div>

              {/* Modules */}
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <div className="flex items-center gap-2 mb-4">
                  <LayoutDashboard className="w-4 h-4 text-sky-400" />
                  <h3 className="font-mono text-sm font-semibold text-white">{t.showcase.modules.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.showcase.modules.items.map((m) => (
                    <ModulePill key={m} name={m} />
                  ))}
                </div>
              </div>

              {/* Tip */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Fingerprint className="w-4 h-4 text-purple-400" />
                  <h3 className="font-mono text-sm font-semibold text-white">{t.showcase.tip.title}</h3>
                </div>
                <p className="text-sm font-mono text-neutral-400 leading-relaxed">{t.showcase.tip.text}</p>
              </div>
            </div>

            {/* Sections */}
            {t.sections.map((section) => {
              const Icon = NAV_ICONS[section.id] || Globe;
              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="rounded-2xl bg-neutral-900/40 border border-neutral-800 overflow-hidden scroll-mt-24"
                >
                  <div className="px-5 py-4 border-b border-neutral-800 flex items-center gap-3 bg-neutral-900/60">
                    <Icon className="w-5 h-5 text-purple-400" />
                    <h2 className="font-mono font-semibold text-white">{section.title}</h2>
                  </div>
                  <div className="px-5">
                    {section.items.map((item) => (
                      <Accordion key={item.q} question={item.q} answer={item.a} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* CTA */}
            <div className="rounded-2xl bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-pink-600/20 border border-purple-500/25 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-mono font-semibold text-white text-lg">{t.cta.title}</h3>
                <p className="text-sm font-mono text-neutral-300 mt-1">{t.cta.subtitle}</p>
              </div>
              <Link
                href="/support"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-sm transition-colors shrink-0"
              >
                {t.cta.button}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
