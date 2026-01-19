"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  Sparkles, 
  Music, 
  BarChart3, 
  Palette,
  Link as LinkIcon,
  Snowflake,
  Play,
  Eye
} from "lucide-react";

const featureKeys = [
  { key: "backgrounds", icon: Sparkles, color: "purple" },
  { key: "nickname", icon: Palette, color: "violet" },
  { key: "music", icon: Music, color: "fuchsia" },
  { key: "linkStyles", icon: LinkIcon, color: "pink" },
  { key: "analytics", icon: BarChart3, color: "purple" },
  { key: "clickToEnter", icon: Play, color: "violet" },
  { key: "stats", icon: Eye, color: "fuchsia" },
  { key: "snow", icon: Snowflake, color: "pink" },
];

const colorClasses = {
  purple: {
    bg: "bg-purple-500/10",
    border: "hover:border-purple-500/50",
    icon: "text-purple-400",
    glow: "from-purple-600/0 via-purple-600/10 to-purple-600/0",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "hover:border-violet-500/50",
    icon: "text-violet-400",
    glow: "from-violet-600/0 via-violet-600/10 to-violet-600/0",
  },
  fuchsia: {
    bg: "bg-fuchsia-500/10",
    border: "hover:border-fuchsia-500/50",
    icon: "text-fuchsia-400",
    glow: "from-fuchsia-600/0 via-fuchsia-600/10 to-fuchsia-600/0",
  },
  pink: {
    bg: "bg-pink-500/10",
    border: "hover:border-pink-500/50",
    icon: "text-pink-400",
    glow: "from-pink-600/0 via-pink-600/10 to-pink-600/0",
  },
};

export function FeaturesGrid() {
  const t = useTranslations("features");

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-4">
            {t("title")} <span className="text-purple-400">{t("titleHighlight")}</span> {t("titleEnd")}
          </h2>
          <p className="text-neutral-400 font-mono max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {featureKeys.map((feature, index) => {
            const colors = colorClasses[feature.color as keyof typeof colorClasses];
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`group relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6 ${colors.border} transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.15)]`}
              >
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="text-lg font-mono font-semibold mb-2 text-white">
                  {t(`items.${feature.key}.title`)}
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  {t(`items.${feature.key}.description`)}
                </p>
                
                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colors.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
