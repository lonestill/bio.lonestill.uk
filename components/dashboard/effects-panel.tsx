"use client";

import { useState, useEffect } from "react";
import { Profile } from "@/db/schema";
import { updateProfile } from "@/app/actions/update-profile";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  MousePointer2,
  Wand2,
  Loader2,
  Check,
  AlertCircle,
  Zap,
  Music,
  Volume2,
  Play,
  MessageSquare,
} from "lucide-react";

interface EffectsPanelProps {
  profile: Profile;
}

// Эффекты фона - точно такие же как в bio-renderer.tsx
const backgroundEffects = [
  { value: "", label: "Нет", icon: "○" },
  { value: "plasma", label: "Plasma", icon: "🔮" },
  { value: "aurora", label: "Aurora", icon: "🌌" },
  { value: "snowflakes", label: "Снежинки", icon: "❄️" },
  { value: "rain", label: "Дождь", icon: "🌧️" },
  { value: "night", label: "Звёзды", icon: "✨" },
  { value: "oldtv", label: "Retro TV", icon: "📺" },
  { value: "blurred", label: "Размытие", icon: "💫" },
];

// Эффекты никнейма - точно такие же как в bio-renderer.tsx
const nicknameEffects = [
  { value: "none", label: "Нет эффекта" },
  { value: "rainbow", label: "Радуга" },
  { value: "blurred", label: "Размытие" },
  { value: "shift", label: "Переливы" },
  { value: "particles-blue", label: "Частицы", color: "#3b82f6" },
  { value: "particles-green", label: "Частицы", color: "#22c55e" },
  { value: "particles-pink", label: "Частицы", color: "#ec4899" },
  { value: "particles-red", label: "Частицы", color: "#ef4444" },
  { value: "particles-white", label: "Частицы", color: "#ffffff" },
  { value: "particles-yellow", label: "Частицы", color: "#eab308" },
];

const cursorStyles = [
  { value: "default", label: "Стандартный" },
  { value: "pointer", label: "Указатель" },
  { value: "crosshair", label: "Прицел" },
  { value: "none", label: "Скрытый" },
];

export function EffectsPanel({ profile }: EffectsPanelProps) {
  const [state, formAction] = useActionState(updateProfile, null);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  
  const modules = (profile.modules || {}) as any;
  
  const [effects, setEffects] = useState({
    backgroundEffect: modules.backgroundEffect || "",
    nicknameEffect: modules.nicknameEffect || "none",
    cursor: modules.effects?.cursor || "default",
    snow: modules.effects?.snow || false,
    scanlines: modules.effects?.scanlines || false,
    // Music settings
    musicUrl: modules.music?.url || "",
    musicVolume: modules.music?.volume || 50,
    musicAutoplay: modules.music?.autoplay !== false,
    // Guestbook
    guestbookEnabled: modules.guestbook?.enabled || false,
  });

  useEffect(() => {
    if (state?.success) {
      setIsPending(false);
      setShowSuccess(true);
      setSaveCount(c => c + 1);
      router.refresh();
      
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    if (state?.error) {
      setIsPending(false);
    }
  }, [state, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    
    const formDataObj = new FormData();
    formDataObj.set("displayName", profile.displayName || "");
    formDataObj.set("bioText", profile.bioText || "");
    formDataObj.set("avatarUrl", profile.avatarUrl || "");
    formDataObj.set("backgroundUrl", profile.backgroundUrl || "");
    formDataObj.set("themeConfig", JSON.stringify(profile.themeConfig || {}));
    
    const modulesJson = {
      ...modules,
      backgroundEffect: effects.backgroundEffect,
      nicknameEffect: effects.nicknameEffect,
      effects: {
        cursor: effects.cursor,
        snow: effects.snow,
        scanlines: effects.scanlines,
      },
      music: {
        url: effects.musicUrl,
        volume: effects.musicVolume,
        autoplay: effects.musicAutoplay,
      },
      guestbook: {
        enabled: effects.guestbookEnabled,
      },
    };
    formDataObj.set("modulesJson", JSON.stringify(modulesJson));
    
    formAction(formDataObj);
  };

  // Стиль превью для эффектов ника (точно как в bio-renderer)
  const getNickPreviewStyle = (effect: typeof nicknameEffects[0]): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      fontWeight: "bold",
      fontSize: "14px",
      fontFamily: "monospace",
    };

    if (effect.value === "none") {
      return { ...baseStyle, color: "#f5f5f5" };
    }
    
    if (effect.value === "rainbow") {
      return {
        ...baseStyle,
        background: "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      };
    }
    
    if (effect.value === "blurred") {
      return {
        ...baseStyle,
        color: "#f5f5f5",
        filter: "blur(2px)",
      };
    }
    
    if (effect.value === "shift") {
      return {
        ...baseStyle,
        animation: "colorShift 3s infinite",
      };
    }
    
    if (effect.value.startsWith("particles-")) {
      return {
        ...baseStyle,
        color: effect.color,
        textShadow: `0 0 10px ${effect.color}, 0 0 20px ${effect.color}, 0 0 30px ${effect.color}`,
        animation: "particleGlow 2s infinite",
      };
    }

    return baseStyle;
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-mono font-semibold text-white">Эффекты</h2>
          <p className="text-sm font-mono text-neutral-500">Визуальные эффекты и музыка</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Background Effects */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-neutral-500" />
            Эффект фона
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {backgroundEffects.map((effect) => (
              <button
                key={effect.value}
                type="button"
                onClick={() => setEffects({ ...effects, backgroundEffect: effect.value })}
                className={`relative p-4 rounded-xl border text-center transition-all hover:scale-105 ${
                  effects.backgroundEffect === effect.value
                    ? "border-purple-500/50 bg-purple-500/10 ring-2 ring-purple-500/20"
                    : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                }`}
              >
                <div className="text-2xl mb-2">{effect.icon}</div>
                <span className="text-xs font-mono text-neutral-400">{effect.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Nickname Effects */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-neutral-500" />
            Эффект никнейма
          </h3>
          
          {/* Preview */}
          <div className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 text-center">
            <span className="text-xs font-mono text-neutral-500 block mb-3">Предпросмотр</span>
            <div 
              className="text-2xl inline-block"
              style={getNickPreviewStyle(nicknameEffects.find(e => e.value === effects.nicknameEffect) || nicknameEffects[0])}
            >
              {profile.displayName || "Username"}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {nicknameEffects.map((effect) => (
              <button
                key={effect.value}
                type="button"
                onClick={() => setEffects({ ...effects, nicknameEffect: effect.value })}
                className={`p-3 rounded-xl border text-center transition-all hover:scale-105 ${
                  effects.nicknameEffect === effect.value
                    ? "border-purple-500/50 bg-purple-500/10 ring-2 ring-purple-500/20"
                    : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                }`}
              >
                <div 
                  className="text-sm font-bold mb-1 h-6 flex items-center justify-center"
                  style={getNickPreviewStyle(effect)}
                >
                  Aa
                </div>
                <span className="text-[9px] font-mono text-neutral-500 block truncate">{effect.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Effects */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-500" />
            Дополнительные эффекты
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 cursor-pointer hover:bg-neutral-800/50 transition-colors">
              <div>
                <div className="text-sm font-mono text-neutral-200">❄️ Падающий снег</div>
                <div className="text-xs font-mono text-neutral-500">Снежинки поверх контента</div>
              </div>
              <div
                className={`toggle-switch ${effects.snow ? "active" : ""}`}
                onClick={() => setEffects({ ...effects, snow: !effects.snow })}
              />
            </label>
            
            <label className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 cursor-pointer hover:bg-neutral-800/50 transition-colors">
              <div>
                <div className="text-sm font-mono text-neutral-200">📺 CRT Сканлайны</div>
                <div className="text-xs font-mono text-neutral-500">Ретро-эффект старого монитора</div>
              </div>
              <div
                className={`toggle-switch ${effects.scanlines ? "active" : ""}`}
                onClick={() => setEffects({ ...effects, scanlines: !effects.scanlines })}
              />
            </label>
          </div>
        </div>

        {/* Cursor Style */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <MousePointer2 className="w-4 h-4 text-neutral-500" />
            Стиль курсора
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {cursorStyles.map((cursor) => (
              <button
                key={cursor.value}
                type="button"
                onClick={() => setEffects({ ...effects, cursor: cursor.value })}
                className={`p-3 rounded-xl border text-center transition-all ${
                  effects.cursor === cursor.value
                    ? "border-purple-500/50 bg-purple-500/10 ring-2 ring-purple-500/20"
                    : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                }`}
              >
                <span className="text-xs font-mono text-neutral-400">{cursor.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Music Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <Music className="w-4 h-4 text-neutral-500" />
            Фоновая музыка
          </h3>
          
          <div className="space-y-4 p-4 rounded-xl bg-neutral-900/30 border border-neutral-800">
            <input
              type="url"
              value={effects.musicUrl}
              onChange={(e) => setEffects({ ...effects, musicUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-white font-mono text-sm placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="https://example.com/music.mp3 или YouTube URL"
            />
            
            <div className="flex items-center gap-4">
              <Volume2 className="w-4 h-4 text-neutral-500" />
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={effects.musicVolume}
                onChange={(e) => setEffects({ ...effects, musicVolume: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-xs font-mono text-purple-400 w-10">{effects.musicVolume}%</span>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`toggle-switch ${effects.musicAutoplay ? "active" : ""}`}
                onClick={() => setEffects({ ...effects, musicAutoplay: !effects.musicAutoplay })}
              />
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-mono text-neutral-400">Автовоспроизведение</span>
              </div>
            </label>
            
            <p className="text-xs font-mono text-neutral-600">
              Поддерживаются MP3 и YouTube ссылки
            </p>
          </div>
        </div>

        {/* Guestbook */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-neutral-500" />
            Гостевая книга
          </h3>
          
          <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-mono text-neutral-300">Включить гостевую книгу</span>
                <p className="text-xs font-mono text-neutral-600 mt-1">
                  Посетители смогут оставлять сообщения на вашей странице
                </p>
              </div>
              <div
                className={`toggle-switch ${effects.guestbookEnabled ? "active" : ""}`}
                onClick={() => setEffects({ ...effects, guestbookEnabled: !effects.guestbookEnabled })}
              />
            </label>
          </div>
        </div>

        {/* Status Messages */}
        {state?.error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 animate-scale-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-mono">{state.error}</span>
          </div>
        )}

        {showSuccess && (
          <div key={saveCount} className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 animate-scale-in">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-mono">Эффекты сохранены!</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 px-6 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 font-mono font-medium hover:bg-purple-600/30 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Сохранение...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Применить эффекты</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
