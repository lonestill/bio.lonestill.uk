"use client";

import { useState, useEffect } from "react";
import { Profile } from "@/db/schema";
import { updateProfile } from "@/app/actions/update-profile";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

interface DesignSettingsProps {
  profile: Profile;
}

export function DesignSettings({ profile }: DesignSettingsProps) {
  const [state, formAction] = useActionState(updateProfile, null);
  const router = useRouter();
  const [themeConfig, setThemeConfig] = useState({
    colors: {
      primary: profile.themeConfig?.colors?.primary || "#8b5cf6",
      secondary: profile.themeConfig?.colors?.secondary || "#ec4899",
      text: profile.themeConfig?.colors?.text || "#ffffff",
      background: profile.themeConfig?.colors?.background || "#000000",
    },
    opacity: profile.themeConfig?.opacity || 0.95,
    blur: profile.themeConfig?.blur || 0,
  });

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("themeConfig", JSON.stringify(themeConfig));
    formAction(formData);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-mono font-bold mb-6">Настройки дизайна</h2>
      
      <form action={formAction} onSubmit={handleSubmit} className="space-y-8">
        {/* Colors Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <h3 className="text-base font-mono font-bold mb-4 text-purple-400">Цвета</h3>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                Основной цвет
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={themeConfig.colors.primary}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, primary: e.target.value }
                  })}
                  className="w-16 h-12 rounded border border-white/10 cursor-pointer"
                />
                <input
                  type="text"
                  value={themeConfig.colors.primary}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, primary: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white font-mono text-sm"
                  placeholder="#8b5cf6"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                Вторичный цвет
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={themeConfig.colors.secondary}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, secondary: e.target.value }
                  })}
                  className="w-16 h-12 rounded border border-white/10 cursor-pointer"
                />
                <input
                  type="text"
                  value={themeConfig.colors.secondary}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, secondary: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white font-mono text-sm"
                  placeholder="#ec4899"
                />
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                Цвет текста
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={themeConfig.colors.text}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, text: e.target.value }
                  })}
                  className="w-16 h-12 rounded border border-white/10 cursor-pointer"
                />
                <input
                  type="text"
                  value={themeConfig.colors.text}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, text: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white font-mono text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                Цвет фона
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={themeConfig.colors.background}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, background: e.target.value }
                  })}
                  className="w-16 h-12 rounded border border-white/10 cursor-pointer"
                />
                <input
                  type="text"
                  value={themeConfig.colors.background}
                  onChange={(e) => setThemeConfig({
                    ...themeConfig,
                    colors: { ...themeConfig.colors, background: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Effects Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <h3 className="text-base font-mono font-bold mb-4 text-purple-400">Эффекты</h3>
          
          <div className="space-y-4">
            {/* Opacity */}
            <div>
              <label className="block text-sm font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                Прозрачность карточки: {(themeConfig.opacity * 100).toFixed(0)}%
              </label>
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
                className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Blur */}
            <div>
              <label className="block text-sm font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                Размытие: {themeConfig.blur}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={themeConfig.blur}
                onChange={(e) => setThemeConfig({
                  ...themeConfig,
                  blur: parseInt(e.target.value)
                })}
                className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Hidden inputs for other required fields */}
        <input type="hidden" name="displayName" value={profile.displayName || ""} />
        <input type="hidden" name="bioText" value={profile.bioText || ""} />
        <input type="hidden" name="avatarUrl" value={profile.avatarUrl || ""} />
        <input type="hidden" name="backgroundUrl" value={profile.backgroundUrl || ""} />
        <input type="hidden" name="musicUrl" value={profile.modules?.music?.url || ""} />
        <input type="hidden" name="themeConfig" value={JSON.stringify(themeConfig)} />

        {/* Messages */}
        {state?.error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm font-mono">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm font-mono">
            Настройки дизайна сохранены!
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 hover:border-purple-500/50 transition-all font-mono text-sm text-purple-400 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
          >
            Сохранить дизайн
          </button>
        </div>
      </form>
    </div>
  );
}
