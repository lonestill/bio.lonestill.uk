"use client";

import { useState, useActionState } from "react";
import { updateProfile } from "@/app/actions/update-profile";
import { Profile } from "@/db/schema";
import { Crown, Palette, Layout as LayoutIcon } from "lucide-react";
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

  const [enabled, setEnabled] = useState(badgeConfig.enabled ?? true);
  const [style, setStyle] = useState<string>(badgeConfig.style || "default");
  const [position, setPosition] = useState<string>(badgeConfig.position || "after-name");
  const [color, setColor] = useState(badgeConfig.color || "#a855f7");
  const [glowColor, setGlowColor] = useState(badgeConfig.glowColor || "#a855f7");

  const hasPremiumBadge = userBadges.includes("premium");

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

  if (!hasPremiumBadge) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">👑</div>
            <div>
              <h3 className="font-bold text-lg text-amber-400">Вкладка только для избранных</h3>
              <p className="text-neutral-300 mt-3 leading-relaxed">
                Кастомизация премиум бейджа доступна лишь самым близким и особым пользователям платформы.
              </p>
              <p className="text-sm text-neutral-500 mt-3">
                Статус Premium присуждается исключительно администрацией за особые заслуги.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-medium rounded-lg transition-colors"
      >
        {isSaving ? "Сохранение..." : "Сохранить"}
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
