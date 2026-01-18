"use client";

import { useState, useEffect } from "react";
import { Profile } from "@/db/schema";
import { updateProfile } from "@/app/actions/update-profile";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  Droplets,
  Layers,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface DesignPanelProps {
  profile: Profile;
}

const presetColors = [
  { name: "Purple", primary: "#9333ea", secondary: "#a855f7" },
  { name: "Violet", primary: "#7c3aed", secondary: "#8b5cf6" },
  { name: "Fuchsia", primary: "#d946ef", secondary: "#e879f9" },
  { name: "Rose", primary: "#f43f5e", secondary: "#fb7185" },
  { name: "Cyan", primary: "#06b6d4", secondary: "#22d3ee" },
  { name: "Emerald", primary: "#10b981", secondary: "#34d399" },
];

export function DesignPanel({ profile }: DesignPanelProps) {
  const [state, formAction] = useActionState(updateProfile, null);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  
  const [themeConfig, setThemeConfig] = useState({
    colors: {
      primary: profile.themeConfig?.colors?.primary || "#9333ea",
      secondary: profile.themeConfig?.colors?.secondary || "#a855f7",
      text: profile.themeConfig?.colors?.text || "#ffffff",
      background: profile.themeConfig?.colors?.background || "#050505",
    },
    opacity: profile.themeConfig?.opacity || 0.8,
    blur: profile.themeConfig?.blur || 12,
  });

  useEffect(() => {
    if (state?.success) {
      setIsPending(false);
      router.refresh();
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
    formDataObj.set("themeConfig", JSON.stringify(themeConfig));
    
    formAction(formDataObj);
  };

  const applyPreset = (preset: typeof presetColors[0]) => {
    setThemeConfig({
      ...themeConfig,
      colors: {
        ...themeConfig.colors,
        primary: preset.primary,
        secondary: preset.secondary,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
          <Palette className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-mono font-semibold text-white">Дизайн</h2>
          <p className="text-sm font-mono text-neutral-500">Настройте внешний вид страницы</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Color Presets */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-500" />
            Цветовые схемы
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {presetColors.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`p-4 rounded-xl border transition-all hover:scale-105 ${
                  themeConfig.colors.primary === preset.primary
                    ? "border-purple-500/50 bg-purple-500/10 ring-2 ring-purple-500/20"
                    : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                }`}
              >
                <div className="flex gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-lg shadow-lg"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-lg shadow-lg"
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>
                <span className="text-xs font-mono text-neutral-400">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-neutral-500" />
            Пользовательские цвета
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Primary Color */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-500">Основной</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeConfig.colors.primary}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, primary: e.target.value }
                  })}
                  className="w-12 h-12 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={themeConfig.colors.primary}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, primary: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-300 text-sm font-mono focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-500">Вторичный</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeConfig.colors.secondary}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, secondary: e.target.value }
                  })}
                  className="w-12 h-12 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={themeConfig.colors.secondary}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, secondary: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-300 text-sm font-mono focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-500">Текст</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeConfig.colors.text}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, text: e.target.value }
                  })}
                  className="w-12 h-12 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={themeConfig.colors.text}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, text: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-300 text-sm font-mono focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-500">Фон</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeConfig.colors.background}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, background: e.target.value }
                  })}
                  className="w-12 h-12 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={themeConfig.colors.background}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, background: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-300 text-sm font-mono focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Effects */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-500" />
            Эффекты карточки
          </h3>
          
          {/* Opacity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-neutral-500">Прозрачность</label>
              <span className="text-xs font-mono text-purple-400">
                {Math.round(themeConfig.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={themeConfig.opacity}
              onChange={(e) => setThemeConfig({
                ...themeConfig,
                opacity: parseFloat(e.target.value)
              })}
              className="w-full"
            />
          </div>

          {/* Blur */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-neutral-500">Размытие</label>
              <span className="text-xs font-mono text-purple-400">
                {themeConfig.blur}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={themeConfig.blur}
              onChange={(e) => setThemeConfig({
                ...themeConfig,
                blur: parseInt(e.target.value)
              })}
              className="w-full"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-mono text-neutral-400">Предпросмотр</h3>
          <div 
            className="p-6 rounded-2xl border border-neutral-800"
            style={{
              background: `${themeConfig.colors.background}${Math.round(themeConfig.opacity * 255).toString(16).padStart(2, '0')}`,
              backdropFilter: `blur(${themeConfig.blur}px)`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${themeConfig.colors.primary}, ${themeConfig.colors.secondary})` }}
              />
              <div>
                <div className="font-mono font-semibold" style={{ color: themeConfig.colors.text }}>
                  {profile.displayName || "Ваше имя"}
                </div>
                <div className="text-sm font-mono opacity-70" style={{ color: themeConfig.colors.text }}>
                  Описание профиля
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {state?.error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 animate-scale-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-mono">{state.error}</span>
          </div>
        )}

        {state?.success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 animate-scale-in">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-mono">Дизайн сохранён!</span>
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
              <Palette className="w-5 h-5" />
              <span>Применить дизайн</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
