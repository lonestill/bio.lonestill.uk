"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
  Eye, 
  MousePointerClick,
  ExternalLink
} from "lucide-react";

export function LiveDemo() {
  return (
    <section id="showcase" className="py-24 px-6 border-t border-neutral-800/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center order-2 lg:order-1"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-purple-500/20 rounded-[3rem] blur-3xl" />
              
              {/* Phone frame */}
              <div className="relative w-72 h-[580px] bg-neutral-900 rounded-[3rem] p-3 border-4 border-neutral-800 shadow-2xl">
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-[#050505] rounded-b-2xl z-10" />
                
                {/* Screen content */}
                <div className="w-full h-full bg-gradient-to-b from-[#0a0a0a] to-[#050505] rounded-[2.5rem] overflow-hidden relative">
                  {/* Aurora effect in background */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 via-transparent to-pink-500/20" />
                  </div>
                  
                  {/* Profile content */}
                  <div className="relative p-6 pt-10 space-y-5">
                    {/* Avatar */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                          <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-2xl">
                            👨‍💻
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Name with glow effect */}
                    <div className="text-center">
                      <h3 
                        className="font-mono text-xl font-bold"
                        style={{
                          color: "#ec4899",
                          textShadow: "0 0 10px #ec4899, 0 0 20px #ec4899",
                        }}
                      >
                        username
                      </h3>
                      <p className="text-neutral-500 text-sm font-mono mt-1">@username</p>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-4 text-xs font-mono text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> 1,234
                      </span>
                      <span>#1000</span>
                    </div>

                    {/* Bio */}
                    <p className="text-center text-neutral-400 text-sm font-mono">
                      Делаю крутые штуки ✨
                    </p>

                    {/* Links */}
                    <div className="space-y-2.5 pt-2">
                      {[
                        { url: "https://github.com", label: "GitHub" },
                        { url: "https://twitter.com", label: "Twitter" },
                        { url: "https://telegram.org", label: "Telegram" },
                      ].map((link, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 cursor-pointer hover:border-purple-500/30 transition-colors"
                        >
                          <img 
                            src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`}
                            alt=""
                            className="w-4 h-4 rounded"
                          />
                          <span className="font-mono text-sm text-white flex-1">{link.label}</span>
                          <ExternalLink className="w-3 h-3 text-neutral-500" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Floating snow particles */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                      style={{ left: `${20 + i * 15}%` }}
                      animate={{ 
                        y: [0, 500],
                        opacity: [0.6, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "linear",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">
              <Sparkles className="w-3 h-3" />
              Полная кастомизация
            </div>

            <h2 className="text-3xl md:text-4xl font-mono font-bold text-white leading-tight">
              Настрой каждую
              <br />
              <span className="text-purple-400">деталь</span> своей страницы
            </h2>
            
            <p className="text-neutral-400 text-base leading-relaxed">
              Визуальный редактор позволяет настроить цвета, эффекты, музыку и стиль ссылок 
              без единой строчки кода. Просто выбирай и сохраняй.
            </p>
            
            {/* Feature list */}
            <div className="space-y-4 pt-4">
              {[
                { icon: "🎨", text: "Кастомные цвета темы" },
                { icon: "✨", text: "Анимированные эффекты фона" },
                { icon: "🎵", text: "Фоновая музыка с YouTube" },
                { icon: "📊", text: "Статистика в реальном времени" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-mono text-neutral-300">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.a
              href="/register"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 font-mono text-sm px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] text-white font-medium mt-4"
            >
              Попробовать бесплатно
              <MousePointerClick className="w-4 h-4" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
