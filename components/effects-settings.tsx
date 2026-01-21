"use client";

import { useState, useEffect } from "react";
import { Profile } from "@/db/schema";
import { updateProfile } from "@/app/actions/update-profile";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

interface EffectsSettingsProps {
  profile: Profile;
}

export function EffectsSettings({ profile }: EffectsSettingsProps) {
  const [state, formAction] = useActionState(updateProfile, null);
  const router = useRouter();
  const [effects, setEffects] = useState({
    snow: profile.modules?.effects?.snow || false,
    scanlines: profile.modules?.effects?.scanlines || false,
    cursor: profile.modules?.effects?.cursor || "default",
    sakura: profile.modules?.effects?.sakura || false,
    countdown: {
      enabled: profile.modules?.effects?.countdown?.enabled || false,
      targetDate: profile.modules?.effects?.countdown?.targetDate || "",
      title: profile.modules?.effects?.countdown?.title || "Отсчет",
      layout: (profile.modules?.effects?.countdown?.layout || "centered") as "centered" | "compact",
    },
  });

  const [music, setMusic] = useState({
    url: profile.modules?.music?.url || "",
    volume: profile.modules?.music?.volume || 30,
    autoplay: profile.modules?.music?.autoplay !== false,
  });

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  // Note: musicUrl is handled separately in updateProfile action
  // Effects need to be saved via a different method or we need to extend updateProfile
  // For now, we'll use musicUrl for music and note that effects should be saved via API

  return (
    <div className="p-6">
      <h2 className="text-lg font-mono font-bold mb-6">Эффекты и медиа</h2>
      
      <form action={formAction} className="space-y-8">
        {/* Visual Effects */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <h3 className="text-base font-mono font-bold mb-4 text-purple-400">Визуальные эффекты</h3>
          
          <div className="space-y-4">
            {/* Snow Effect */}
            <label className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10 cursor-pointer hover:bg-black/30 transition-colors">
              <div>
                <div className="font-mono text-sm text-white mb-1">Эффект снега</div>
                <div className="font-mono text-xs text-neutral-400">Анимированные частицы снега на странице</div>
              </div>
              <input
                type="checkbox"
                checked={effects.snow}
                onChange={(e) => setEffects({ ...effects, snow: e.target.checked })}
                className="w-5 h-5 accent-purple-500 cursor-pointer"
              />
            </label>

            {/* Scanlines Effect */}
            <label className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10 cursor-pointer hover:bg-black/30 transition-colors">
              <div>
                <div className="font-mono text-sm text-white mb-1">Эффект сканирующих линий</div>
                <div className="font-mono text-xs text-neutral-400">Ретро эффект CRT монитора</div>
              </div>
              <input
                type="checkbox"
                checked={effects.scanlines}
                onChange={(e) => setEffects({ ...effects, scanlines: e.target.checked })}
                className="w-5 h-5 accent-purple-500 cursor-pointer"
              />
            </label>

            {/* Cursor Style */}
            <div>
              <label className="block text-sm font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                Стиль курсора
              </label>
              <select
                value={effects.cursor}
                onChange={(e) => setEffects({ ...effects, cursor: e.target.value })}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white font-mono text-sm"
              >
                <option value="default">По умолчанию</option>
                <option value="pointer">Указатель</option>
                <option value="crosshair">Прицел</option>
                <option value="none">Скрыть</option>
              </select>
            </div>

            {/* Sakura Effect */}
            <label className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10 cursor-pointer hover:bg-black/30 transition-colors">
              <div>
                <div className="font-mono text-sm text-white mb-1">Эффект цветочков сакуры</div>
                <div className="font-mono text-xs text-neutral-400">Падающие лепестки вишни 🌸</div>
              </div>
              <input
                type="checkbox"
                checked={effects.sakura}
                onChange={(e) => setEffects({ ...effects, sakura: e.target.checked })}
                className="w-5 h-5 accent-purple-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Countdown Settings */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <h3 className="text-base font-mono font-bold mb-4 text-purple-400">Отсчет времени</h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10 cursor-pointer hover:bg-black/30 transition-colors">
              <div>
                <div className="font-mono text-sm text-white mb-1">Показать отсчет</div>
                <div className="font-mono text-xs text-neutral-400">Включить отсчет до определенной даты</div>
              </div>
              <input
                type="checkbox"
                checked={effects.countdown.enabled}
                onChange={(e) => setEffects({
                  ...effects,
                  countdown: { ...effects.countdown, enabled: e.target.checked }
                })}
                className="w-5 h-5 accent-purple-500 cursor-pointer"
              />
            </label>

            {effects.countdown.enabled && (
              <>
                <div>
                  <label className="block text-sm font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                    Дата и время окончания
                  </label>
                  <input
                    type="datetime-local"
                    value={effects.countdown.targetDate}
                    onChange={(e) => setEffects({
                      ...effects,
                      countdown: { ...effects.countdown, targetDate: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white font-mono text-sm"
                  />
                  {!effects.countdown.targetDate && (
                    <div className="text-xs text-amber-400 mt-1">⚠️ Выберите дату и время</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                    Название отсчета
                  </label>
                  <input
                    type="text"
                    value={effects.countdown.title}
                    onChange={(e) => setEffects({
                      ...effects,
                      countdown: { ...effects.countdown, title: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white font-mono text-sm"
                    placeholder="Например: До Нового Года"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                    Стиль отсчета
                  </label>
                  <select
                    value={effects.countdown.layout}
                    onChange={(e) => setEffects({
                      ...effects,
                      countdown: { ...effects.countdown, layout: e.target.value as "centered" | "compact" }
                    })}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white font-mono text-sm"
                  >
                    <option value="centered">Большой (по центру)</option>
                    <option value="compact">Компактный (одна строка)</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Music Settings */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <h3 className="text-base font-mono font-bold mb-4 text-purple-400">Фоновая музыка</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                URL музыки (MP3 или YouTube)
              </label>
              <input
                type="url"
                value={music.url}
                onChange={(e) => setMusic({ ...music, url: e.target.value })}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white font-mono text-sm"
                placeholder="https://example.com/music.mp3 или https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                Громкость: {music.volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={music.volume}
                onChange={(e) => setMusic({ ...music, volume: parseInt(e.target.value) })}
                className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <label className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10 cursor-pointer hover:bg-black/30 transition-colors">
              <div>
                <div className="font-mono text-sm text-white mb-1">Автопроигрывание</div>
                <div className="font-mono text-xs text-neutral-400">Начать воспроизведение при загрузке страницы</div>
              </div>
              <input
                type="checkbox"
                checked={music.autoplay}
                onChange={(e) => setMusic({ ...music, autoplay: e.target.checked })}
                className="w-5 h-5 accent-purple-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Hidden inputs */}
        <input type="hidden" name="displayName" value={profile.displayName || ""} />
        <input type="hidden" name="bioText" value={profile.bioText || ""} />
        <input type="hidden" name="avatarUrl" value={profile.avatarUrl || ""} />
        <input type="hidden" name="backgroundUrl" value={profile.backgroundUrl || ""} />
        <input type="hidden" name="musicUrl" value={music.url} />
        <input type="hidden" name="musicVolume" value={music.volume.toString()} />
        <input type="hidden" name="musicAutoplay" value={music.autoplay ? "1" : "0"} />
        <input type="hidden" name="effectsJson" value={JSON.stringify(effects)} />
        <input type="hidden" name="themeConfig" value={JSON.stringify(profile.themeConfig || {})} />

        {/* Messages */}
        {state?.error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm font-mono">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm font-mono">
            Эффекты сохранены!
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 hover:border-purple-500/50 transition-all font-mono text-sm text-purple-400 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
          >
            Сохранить эффекты
          </button>
        </div>
      </form>
    </div>
  );
}
