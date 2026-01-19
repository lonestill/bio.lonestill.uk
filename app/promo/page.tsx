"use client";

import { motion, useScroll, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Music, 
  BarChart3, 
  Palette,
  Link as LinkIcon,
  Snowflake,
  Play,
  Eye,
  Zap,
  Code,
  Github,
  ArrowRight,
  CheckCircle2,
  Star,
  Rocket
} from "lucide-react";

const features = [
  { icon: Sparkles, title: "8+ эффектов фона", desc: "Снег, дождь, северное сияние, звёзды, plasma и retro TV" },
  { icon: Palette, title: "10+ эффектов ника", desc: "Радужный градиент, неоновое свечение, частицы" },
  { icon: Music, title: "Фоновая музыка", desc: "MP3 или YouTube трек с автовоспроизведением" },
  { icon: LinkIcon, title: "4 стиля ссылок", desc: "Glass, cards, pills или minimal" },
  { icon: BarChart3, title: "Аналитика", desc: "Просмотры, уникальные посетители, клики" },
  { icon: Code, title: "REST API", desc: "Программный доступ к данным" },
];

const stats = [
  { value: "∞", label: "Бесплатно", icon: Star },
  { value: "100%", label: "Кастомизация", icon: Zap },
  { value: "24/7", label: "Доступность", icon: Rocket },
];

export default function PromoPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  // Auto-play sections
  useEffect(() => {
    if (!isPlaying) return;

    const intervals = [
      3000, // Hero
      4000, // Features intro
      5000, // Features grid
      4000, // Stats
      4000, // CTA
    ];

    let timeout: NodeJS.Timeout;
    let current = 0;

    const nextSection = () => {
      if (current < intervals.length) {
        timeout = setTimeout(() => {
          setCurrentSection(current + 1);
          current++;
          if (current < intervals.length) {
            nextSection();
          }
        }, intervals[current]);
      }
    };

    nextSection();

    return () => clearTimeout(timeout);
  }, [isPlaying]);

  const scrollToSection = (index: number) => {
    setCurrentSection(index);
    const section = document.getElementById(`section-${index}`);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="h-screen bg-[#050505] text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[180px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Play Button Overlay */}
      {!isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-sm"
        >
          <motion.button
            onClick={() => setIsPlaying(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-purple-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-4 border-white/20">
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center font-mono text-sm text-neutral-400"
            >
              Нажмите для начала
            </motion.p>
          </motion.button>
        </motion.div>
      )}

      {/* Main Content */}
      <div ref={containerRef} className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        {/* Section 1: Hero */}
        <section
          id="section-0"
          className="h-screen flex items-center justify-center snap-start relative"
        >
          <div className="max-w-5xl mx-auto px-6 text-center">
            <AnimatePresence mode="wait">
              {currentSection === 0 && (
                <motion.div
                  key="hero"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 1 }}
                  className="space-y-8"
                >
                  {/* Logo/Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="inline-block"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500/30 rounded-3xl blur-3xl animate-pulse" />
                      <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/30 flex items-center justify-center backdrop-blur-sm">
                        <Sparkles className="w-16 h-16 text-purple-400" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-6xl md:text-8xl font-mono font-black"
                  >
                    <span className="bg-gradient-to-r from-white via-purple-200 to-pink-400 bg-clip-text text-transparent">
                      bio.lonestill.uk
                    </span>
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-2xl md:text-3xl font-mono text-neutral-400"
                  >
                    Создай свою идеальную био-страницу
                  </motion.p>

                  {/* Animated dots */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="flex justify-center gap-2"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 rounded-full bg-purple-400"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Section 2: Features Intro */}
        <section
          id="section-1"
          className="h-screen flex items-center justify-center snap-start"
        >
          <AnimatePresence mode="wait">
            {currentSection >= 1 && (
              <motion.div
                key="features-intro"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto px-6 text-center"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-7xl font-mono font-bold mb-6"
                >
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Всё что нужно
                  </span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl md:text-2xl font-mono text-neutral-400"
                >
                  для идеальной страницы
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 3: Features Grid */}
        <section
          id="section-2"
          className="min-h-screen flex items-center justify-center snap-start py-20"
        >
          <AnimatePresence mode="wait">
            {currentSection >= 2 && (
              <motion.div
                key="features-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-6xl mx-auto px-6 w-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.15, duration: 0.6 }}
                        className="group relative"
                      >
                        <div className="relative h-full p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all hover:shadow-[0_0_30px_rgba(147,51,234,0.3)]">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Icon className="w-6 h-6 text-purple-400" />
                          </div>
                          <h3 className="text-lg font-mono font-semibold mb-2 text-white">
                            {feature.title}
                          </h3>
                          <p className="text-neutral-400 text-sm font-mono">
                            {feature.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 4: Stats */}
        <section
          id="section-3"
          className="h-screen flex items-center justify-center snap-start"
        >
          <AnimatePresence mode="wait">
            {currentSection >= 3 && (
              <motion.div
                key="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-5xl mx-auto px-6 w-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.2, type: "spring" }}
                        className="text-center"
                      >
                        <div className="relative inline-block mb-6">
                          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl" />
                          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/30 flex items-center justify-center">
                            <Icon className="w-10 h-10 text-purple-400" />
                          </div>
                        </div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.2 + 0.3 }}
                          className="text-5xl font-mono font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                        >
                          {stat.value}
                        </motion.div>
                        <p className="text-neutral-400 font-mono text-lg">
                          {stat.label}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 5: CTA */}
        <section
          id="section-4"
          className="h-screen flex items-center justify-center snap-start"
        >
          <AnimatePresence mode="wait">
            {currentSection >= 4 && (
              <motion.div
                key="cta"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto px-6 text-center space-y-8"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-7xl font-mono font-black mb-4"
                >
                  <span className="bg-gradient-to-r from-white via-purple-200 to-pink-400 bg-clip-text text-transparent">
                    Готов начать?
                  </span>
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <motion.a
                    href="/register"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-8 py-4 rounded-xl font-mono text-lg font-medium overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2 text-white">
                      Создать страницу
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </motion.a>

                  <motion.a
                    href="/"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl font-mono text-lg font-medium bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:border-purple-500/40 hover:bg-white/10 transition-all"
                  >
                    Узнать больше
                  </motion.a>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-center gap-2 text-neutral-500 font-mono text-sm mt-8"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Бесплатно навсегда</span>
                  <span>•</span>
                  <span>Без регистрации карты</span>
                  <span>•</span>
                  <span>Без ограничений</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Progress Indicator */}
      {isPlaying && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => scrollToSection(i)}
              className={`h-2 rounded-full transition-all ${
                currentSection >= i
                  ? "w-8 bg-purple-400"
                  : "w-2 bg-neutral-600"
              }`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
