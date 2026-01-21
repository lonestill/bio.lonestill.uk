"use client";

import { useState, useActionState } from "react";
import { updateProfile } from "@/app/actions/update-profile";
import { Profile } from "@/db/schema";
import { Crown, Palette, Layout as LayoutIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface BadgeSettingsPanelProps {
  profile: Profile;
  userBadges: string[];
}

const BADGE_STYLES = [
  { id: "default", name: "Classic", description: "Классический бейдж с бордером" },
  { id: "gradient", name: "Gradient", description: "Градиент от жёлтого к оранжевому" },
  { id: "glow", name: "Glow", description: "С сияющим эффектом" },
  { id: "animated", name: "Animated", description: "Пульсирующий" },
];

const BADGE_POSITIONS = [
  { id: "before-name", name: "До имени", icon: "←" },
  { id: "after-name", name: "После имени", icon: "→" },
  { id: "below-name", name: "Под именем", icon: "↓" },
];

const FRAME_OPTIONS = [
  { id: "none", name: "Без рамки", emoji: "❌", color: "neutral" },
  { id: "hello_kitty", name: "Hello Kitty", emoji: "🐱🎀", color: "pink", description: "Милая рамка с котиком" },
  { id: "localhost", name: "Localhost", emoji: "💻", color: "green", description: "Терминал хакера" },
  { id: "hacker", name: "Hacker", emoji: "☠️", color: "cyan", description: "Киберпанк с черепом" },
  { id: "bughunter", name: "Bug Hunter", emoji: "🐛", color: "red", description: "Охотник на баги" },
  { id: "early_adopter", name: "Early Adopter", emoji: "🚀", color: "amber", description: "Золотая рамка пионера" },
];

export function BadgeSettingsPanel({ profile, userBadges }: BadgeSettingsPanelProps) {
  const [state, formAction] = useActionState(updateProfile, null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const modules = (profile.modules || {}) as any;
  const badgeConfig = modules.badgeConfigs?.premium || {
    enabled: true,
    style: "default",
    position: "after-name",
    color: "#a855f7",
    glowColor: "#a855f7",
  };

  const currentActiveFrame = modules.badgeConfigs?.activeFrame || null;

  const [enabled, setEnabled] = useState(badgeConfig.enabled ?? true);
  const [style, setStyle] = useState<string>(badgeConfig.style || "default");
  const [position, setPosition] = useState<string>(badgeConfig.position || "after-name");
  const [color, setColor] = useState(badgeConfig.color || "#a855f7");
  const [glowColor, setGlowColor] = useState(badgeConfig.glowColor || "#a855f7");
  const [activeFrame, setActiveFrame] = useState<string | null>(currentActiveFrame);

  const hasPremiumBadge = userBadges.includes("premium");
  
  // Check which frames user can use
  const availableFrames = FRAME_OPTIONS.filter(frame => 
    frame.id === "none" || userBadges.includes(frame.id)
  );
  const hasAnyFrameBadge = availableFrames.length > 1;

  const handleSave = async () => {
    setIsSaving(true);

    const formDataObj = new FormData();
    formDataObj.set("displayName", profile.displayName || "");
    formDataObj.set("bioText", profile.bioText || "");
    formDataObj.set("avatarUrl", profile.avatarUrl || "");
    formDataObj.set("backgroundUrl", profile.backgroundUrl || "");

    const modulesJson = {
      ...modules,
      badgeConfigs: {
        ...(modules.badgeConfigs || {}),
        premium: {
          enabled,
          style,
          position,
          color,
          glowColor,
        },
        activeFrame: activeFrame,
      },
    };

    formDataObj.set("modulesJson", JSON.stringify(modulesJson));
    formDataObj.set("themeConfig", JSON.stringify(profile.themeConfig || {}));

    const result = await updateProfile(null, formDataObj);

    setIsSaving(false);

    if (result?.success) {
      setMessage({ type: "success", text: "Настройки сохранены!" });
      setTimeout(() => setMessage(null), 3000);
      router.refresh();
    } else {
      setMessage({ type: "error", text: "Ошибка при сохранении" });
    }
  };

  // Get frame color class
  const getFrameColorClass = (frameId: string, isSelected: boolean) => {
    const frame = FRAME_OPTIONS.find(f => f.id === frameId);
    if (!frame) return "";
    
    const colorMap: Record<string, { border: string; bg: string }> = {
      neutral: { border: "border-neutral-500", bg: "bg-neutral-500/10" },
      pink: { border: "border-pink-500", bg: "bg-pink-500/10" },
      green: { border: "border-green-500", bg: "bg-green-500/10" },
      cyan: { border: "border-cyan-500", bg: "bg-cyan-500/10" },
      red: { border: "border-red-500", bg: "bg-red-500/10" },
      amber: { border: "border-amber-500", bg: "bg-amber-500/10" },
    };
    
    const colors = colorMap[frame.color] || colorMap.neutral;
    return isSelected ? `${colors.border} ${colors.bg}` : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-600";
  };

  if (!hasPremiumBadge && !hasAnyFrameBadge) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">👑</div>
            <div>
              <h3 className="font-bold text-lg text-amber-400">Вкладка только для избранных</h3>
              <p className="text-neutral-300 mt-3 leading-relaxed">
                Кастомизация бейджей и рамок доступна только пользователям со специальными бейджами.
              </p>
              <p className="text-sm text-neutral-500 mt-3">
                Бейджи присуждаются администрацией за особые заслуги.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar Frame Section */}
      {hasAnyFrameBadge && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-purple-400" />
              Рамка аватара
            </h2>
            <p className="text-sm text-neutral-400">
              Выберите декоративную рамку для вашего аватара
            </p>
          </div>

          {/* Frame Preview */}
          <div className="rounded-xl border border-neutral-700 bg-neutral-900/50 p-6">
            <p className="text-xs text-neutral-500 mb-4 uppercase tracking-wide text-center">Предпросмотр</p>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    "😊"
                  )}
                </div>
                {activeFrame && activeFrame !== "none" && (
                  <FramePreview frameId={activeFrame} />
                )}
              </div>
            </div>
          </div>

          {/* Frame Selector */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableFrames.map((frame) => (
              <button
                key={frame.id}
                onClick={() => setActiveFrame(frame.id === "none" ? "none" : frame.id)}
                className={`p-4 rounded-xl text-left transition-all border ${getFrameColorClass(frame.id, activeFrame === frame.id || (activeFrame === null && frame.id !== "none") ? false : activeFrame === frame.id)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{frame.emoji}</span>
                  <span className="font-medium text-sm">{frame.name}</span>
                </div>
                {frame.description && (
                  <p className="text-xs text-neutral-500">{frame.description}</p>
                )}
              </button>
            ))}
          </div>

          <div className="text-xs text-neutral-500 text-center">
            💡 Рамки доступны только для тех бейджей, которые у вас есть
          </div>
        </div>
      )}

      {/* Divider */}
      {hasAnyFrameBadge && hasPremiumBadge && (
        <div className="border-t border-neutral-800" />
      )}

      {/* Premium Badge Settings */}
      {hasPremiumBadge && (
        <>
          {/* Header */}
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-400" />
              Кастомизация Premium Бейджа
            </h2>
            <p className="text-sm text-neutral-400">
              Настройте внешний вид вашего премиум бейджа на профиле
            </p>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-neutral-700 bg-neutral-900/50 p-6">
            <p className="text-xs text-neutral-500 mb-3 uppercase tracking-wide">Предпросмотр</p>
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2">
                {position === "before-name" && enabled && (
                  <BadgePreview style={style} color={color} glowColor={glowColor} />
                )}
                <span className="text-2xl font-bold">YourName</span>
                {position === "after-name" && enabled && (
                  <BadgePreview style={style} color={color} glowColor={glowColor} />
                )}
              </div>
              {position === "below-name" && enabled && (
                <div className="mt-3">
                  <BadgePreview style={style} color={color} glowColor={glowColor} />
                </div>
              )}
            </div>
          </div>

          {/* Enable/Disable */}
          <div className="rounded-xl border border-neutral-700 bg-neutral-900/50 p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Показывать бейдж на профиле</label>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? "bg-green-500" : "bg-neutral-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Style Selector */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Palette className="w-4 h-4" />
              Стиль бейджа
            </label>
            <div className="grid grid-cols-2 gap-3">
              {BADGE_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`p-3 rounded-lg text-left transition-all border ${
                    style === s.id
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-600"
                  }`}
                >
                  <div className="font-medium text-sm">{s.name}</div>
                  <div className="text-xs text-neutral-500 mt-1">{s.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Position Selector */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <LayoutIcon className="w-4 h-4" />
              Позиция на профиле
            </label>
            <div className="grid grid-cols-3 gap-3">
              {BADGE_POSITIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPosition(p.id)}
                  className={`p-3 rounded-lg text-center transition-all border ${
                    position === p.id
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-600"
                  }`}
                >
                  <div className="text-lg mb-1">{p.icon}</div>
                  <div className="text-xs font-medium">{p.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Settings */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Цвета</label>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 mb-2 block">Основной цвет</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-neutral-900 border border-neutral-700 text-sm font-mono"
                    placeholder="#a855f7"
                  />
                </div>
              </div>

              {style === "glow" && (
                <div>
                  <label className="text-xs text-neutral-400 mb-2 block">Цвет сияния</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={glowColor}
                      onChange={(e) => setGlowColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={glowColor}
                      onChange={(e) => setGlowColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded bg-neutral-900 border border-neutral-700 text-sm font-mono"
                      placeholder="#a855f7"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
      >
        {isSaving ? "Сохранение..." : "Сохранить настройки"}
      </button>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

function FramePreview({ frameId }: { frameId: string }) {
  const frameStyles: Record<string, { border: string; glow: string; icon: string }> = {
    hello_kitty: { border: "border-pink-400", glow: "shadow-pink-400/50", icon: "🐱🎀" },
    localhost: { border: "border-green-500", glow: "shadow-green-500/50", icon: "💻" },
    hacker: { border: "border-cyan-400", glow: "shadow-cyan-400/50", icon: "☠️" },
    bughunter: { border: "border-red-500", glow: "shadow-red-500/50", icon: "🐛" },
    early_adopter: { border: "border-amber-400", glow: "shadow-amber-400/50", icon: "🚀" },
  };

  const style = frameStyles[frameId];
  if (!style) return null;

  return (
    <>
      <div className={`absolute inset-0 border-4 ${style.border} rounded-full shadow-lg ${style.glow}`} />
      <div className="absolute -top-2 -right-2 text-xl animate-bounce">
        {style.icon}
      </div>
    </>
  );
}

function BadgePreview({
  style,
  color,
  glowColor,
}: {
  style: string;
  color: string;
  glowColor: string;
}) {
  const getStyles = () => {
    const base: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 10px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "600",
    };

    if (style === "default") {
      return {
        ...base,
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}60`,
      };
    }

    if (style === "gradient") {
      return {
        ...base,
        background: "linear-gradient(135deg, #fbbf24, #f97316)",
        color: "#000",
      };
    }

    if (style === "glow") {
      return {
        ...base,
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}60`,
        boxShadow: `0 0 15px ${glowColor}60`,
      };
    }

    if (style === "animated") {
      return {
        ...base,
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}60`,
        animation: "pulse 2s infinite",
      };
    }

    return base;
  };

  return (
    <span style={getStyles()}>
      <span>👑</span>
      <span>Premium</span>
    </span>
  );
}
