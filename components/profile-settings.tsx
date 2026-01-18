"use client";

import { updateProfile } from "@/app/actions/update-profile";
import { useActionState } from "react";
import { Profile } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Type, MapPin, Sparkles, HelpCircle, 
  Star, Palette, Settings, X, Lock
} from "lucide-react";

interface ProfileSettingsProps {
  profile: Profile;
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const [state, formAction] = useActionState(updateProfile, null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "colors" | "other">("general");
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  
  const backgroundEffects = [
    { value: "", label: "Выберите вариант" },
    { value: "plasma", label: "Plasma (Только Premium)", premium: true },
    { value: "aurora", label: "Aurora" },
    { value: "snowflakes", label: "Снежинки" },
    { value: "rain", label: "Дождь" },
    { value: "blurred", label: "Размытый фон" },
    { value: "night", label: "Ночь" },
    { value: "oldtv", label: "Старый TV" },
  ];
  
  const nicknameEffects = [
    { value: "none", label: "Нет", icon: "X" },
    { value: "effect", label: "Эффе", premium: true, icon: "sparkle" },
    { value: "rainbow", label: "Радуга", premium: true, icon: "rainbow" },
    { value: "blurred", label: "Размытый", icon: "blur" },
    { value: "shift", label: "Смена", icon: "shift" },
    { value: "particles-blue", label: "", icon: "particles", color: "blue" },
    { value: "particles-green", label: "", icon: "particles", color: "green" },
    { value: "particles-pink", label: "", icon: "particles", color: "pink" },
    { value: "particles-red", label: "", icon: "particles", color: "red" },
    { value: "particles-white", label: "", icon: "particles", color: "white" },
    { value: "particles-yellow", label: "", icon: "particles", color: "yellow" },
  ];
  
  const modules = (profile.modules || {}) as any;
  const themeConfig = (profile.themeConfig || {}) as any;
  
  const [formData, setFormData] = useState({
    displayName: profile.displayName || "",
    bioText: profile.bioText || "",
    avatarUrl: profile.avatarUrl || "",
    backgroundUrl: profile.backgroundUrl || "",
    musicUrl: modules.music?.url || "",
    location: modules.location || "",
    backgroundEffect: modules.backgroundEffect || "",
      nicknameEffect: modules.nicknameEffect || "none",
    glowNick: modules.glow?.nick || false,
    glowSocials: modules.glow?.socials || false,
    glowBadges: modules.glow?.badges || false,
    opacity: themeConfig.opacity || 0.5,
    blur: themeConfig.blur || 0,
    iconColor: themeConfig.colors?.icon || "#ffffff",
    gradientEnabled: modules.gradientEnabled || false,
    monochromeIcons: modules.monochromeIcons || false,
    animatedHeader: modules.animatedHeader || false,
    changeBlockColors: modules.changeBlockColors || false,
  });

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  useEffect(() => {
    const modules = (profile.modules || {}) as any;
    const themeConfig = (profile.themeConfig || {}) as any;
    setFormData({
      displayName: profile.displayName || "",
      bioText: profile.bioText || "",
      avatarUrl: profile.avatarUrl || "",
      backgroundUrl: profile.backgroundUrl || "",
      musicUrl: modules.music?.url || "",
      location: modules.location || "",
      backgroundEffect: modules.backgroundEffect || "",
      nicknameEffect: modules.nicknameEffect || "none",
      glowNick: modules.glow?.nick || false,
      glowSocials: modules.glow?.socials || false,
      glowBadges: modules.glow?.badges || false,
      opacity: themeConfig.opacity || 0.5,
      blur: themeConfig.blur || 0,
      iconColor: themeConfig.colors?.icon || "#ffffff",
      gradientEnabled: modules.gradientEnabled || false,
      monochromeIcons: modules.monochromeIcons || false,
      animatedHeader: modules.animatedHeader || false,
      changeBlockColors: modules.changeBlockColors || false,
    });
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataObj = new FormData(e.currentTarget as HTMLFormElement);
    
    // Prepare modules JSON
    const modulesJson = {
      ...modules,
      location: formData.location,
      backgroundEffect: formData.backgroundEffect,
      nicknameEffect: formData.nicknameEffect,
      glow: {
        nick: formData.glowNick,
        socials: formData.glowSocials,
        badges: formData.glowBadges,
      },
      gradientEnabled: formData.gradientEnabled,
      monochromeIcons: formData.monochromeIcons,
      animatedHeader: formData.animatedHeader,
      changeBlockColors: formData.changeBlockColors,
      music: {
        ...modules.music,
        url: formData.musicUrl,
      },
    };
    
    // Prepare themeConfig JSON
    const themeConfigJson = {
      ...themeConfig,
      opacity: formData.opacity,
      blur: formData.blur,
      colors: {
        ...themeConfig.colors,
        icon: formData.iconColor,
      },
    };
    
    formDataObj.set("modulesJson", JSON.stringify(modulesJson));
    formDataObj.set("themeConfig", JSON.stringify(themeConfigJson));
    
    formAction(formDataObj);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-mono font-bold mb-4">Настройки профиля</h2>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 font-mono text-sm transition-colors ${
            activeTab === "general"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Общие настройки
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("colors")}
          className={`px-4 py-2 font-mono text-sm transition-colors ${
            activeTab === "colors"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Настройка цветов
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("other")}
          className={`px-4 py-2 font-mono text-sm transition-colors ${
            activeTab === "other"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Другие настройки
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Общие настройки Tab */}
        {activeTab === "general" && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 space-y-4">
          <h3 className="text-base font-mono font-bold mb-4 text-purple-400">Общие настройки</h3>
          
          {/* Описание */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-white/60">
              <Type className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-mono text-neutral-400 mb-1">Описание</label>
              <textarea
                name="bioText"
                value={formData.bioText}
                onChange={(e) => setFormData({ ...formData, bioText: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-white font-mono text-sm"
                rows={2}
                placeholder="Это мое описание"
              />
            </div>
          </div>

          {/* Эффекты фона */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-white/60">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-mono text-neutral-400 mb-1">Эффекты фона</label>
              <select
                name="backgroundEffect"
                value={formData.backgroundEffect}
                onChange={(e) => setFormData({ ...formData, backgroundEffect: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-white font-mono text-sm"
              >
                {backgroundEffects.map((effect) => (
                  <option key={effect.value} value={effect.value}>
                    {effect.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Эффекты ника */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowNicknameModal(true)}
                className={`w-8 h-8 flex items-center justify-center rounded border ${
                  formData.nicknameEffect && formData.nicknameEffect !== "none"
                    ? "bg-purple-600/30 border-purple-500/50 text-purple-400"
                    : "bg-black/40 border-white/10 text-white/60"
                }`}
              >
                <Star className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <label className="text-xs font-mono text-neutral-400">Эффекты ника</label>
            </div>
          </div>

          {/* Прозрачность профиля */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-white/60">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-mono text-neutral-400 mb-2">Прозрачность профиля</label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={formData.opacity}
                  onChange={(e) => setFormData({ ...formData, opacity: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs font-mono text-neutral-500 mt-1">
                  <span>20%</span>
                  <span>50%</span>
                  <span>80%</span>
                </div>
                <input type="hidden" name="opacity" value={formData.opacity} />
              </div>
            </div>
          </div>

          {/* Размытие профиля */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-white/60">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-mono text-neutral-400 mb-2">Размытие профиля</label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="1"
                  value={formData.blur}
                  onChange={(e) => setFormData({ ...formData, blur: parseInt(e.target.value) })}
                  className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs font-mono text-neutral-500 mt-1">
                  <span>20px</span>
                  <span>50px</span>
                  <span>80px</span>
                </div>
                <input type="hidden" name="blur" value={formData.blur} />
              </div>
            </div>
          </div>

          {/* Местоположение */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-white/60">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-mono text-neutral-400 mb-1">Местоположение</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-white font-mono text-sm"
                placeholder="Мое местоположение"
              />
            </div>
          </div>

          {/* Настройки свечения */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-white/60">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-mono text-neutral-400 mb-2">Настройки свечения</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, glowNick: !formData.glowNick })}
                  className={`px-3 py-1 rounded border font-mono text-xs ${
                    formData.glowNick
                      ? "bg-purple-600/30 border-purple-500/50 text-purple-400"
                      : "bg-black/40 border-white/10 text-white/60"
                  }`}
                >
                  <Star className="w-3 h-3 mr-1" /> Ник
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, glowSocials: !formData.glowSocials })}
                  className={`px-3 py-1 rounded border font-mono text-xs ${
                    formData.glowSocials
                      ? "bg-purple-600/30 border-purple-500/50 text-purple-400"
                      : "bg-black/40 border-white/10 text-white/60"
                  }`}
                >
                  <Star className="w-3 h-3 mr-1" /> Соцсети
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, glowBadges: !formData.glowBadges })}
                  className={`px-3 py-1 rounded border font-mono text-xs ${
                    formData.glowBadges
                      ? "bg-purple-600/30 border-purple-500/50 text-purple-400"
                      : "bg-black/40 border-white/10 text-white/60"
                  }`}
                >
                  <Star className="w-3 h-3 mr-1" /> Бейджи
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Настройка цветов Tab */}
        {activeTab === "colors" && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 space-y-4">
          <h3 className="text-base font-mono font-bold mb-4 text-purple-400">Настройка цветов</h3>
          
          {/* Акцентный цвет - will be handled by DesignSettings */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-mono text-neutral-400 w-32">Акцентный цвет</label>
            <div className="flex gap-2 items-center flex-1">
              <input
                type="text"
                value={themeConfig.colors?.primary || "#1b1b1b"}
                readOnly
                className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white font-mono text-sm flex-1"
              />
              <span className="text-xs font-mono text-neutral-500">Настраивается в Дизайн</span>
            </div>
          </div>

          {/* Цвет текста - will be handled by DesignSettings */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-mono text-neutral-400 w-32">Цвет текста</label>
            <div className="flex gap-2 items-center flex-1">
              <input
                type="text"
                value={themeConfig.colors?.text || "#ffffff"}
                readOnly
                className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white font-mono text-sm flex-1"
              />
              <span className="text-xs font-mono text-neutral-500">Настраивается в Дизайн</span>
            </div>
          </div>

          {/* Цвет фона - will be handled by DesignSettings */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-mono text-neutral-400 w-32">Цвет фона</label>
            <div className="flex gap-2 items-center flex-1">
              <input
                type="text"
                value={themeConfig.colors?.background || "#080808"}
                readOnly
                className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white font-mono text-sm flex-1"
              />
              <span className="text-xs font-mono text-neutral-500">Настраивается в Дизайн</span>
            </div>
          </div>

          {/* Цвет иконок */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-mono text-neutral-400 w-32">Цвет иконок</label>
            <div className="flex gap-2 items-center flex-1">
              <input
                type="color"
                value={formData.iconColor}
                onChange={(e) => setFormData({ ...formData, iconColor: e.target.value })}
                className="w-12 h-12 rounded border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={formData.iconColor}
                readOnly
                className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white font-mono text-sm flex-1"
              />
            </div>
          </div>

          {/* Включить градиент профиля */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gradientEnabled: !formData.gradientEnabled })}
              className={`px-4 py-2 rounded border font-mono text-sm ${
                formData.gradientEnabled
                  ? "bg-purple-600/30 border-purple-500/50 text-purple-400"
                  : "bg-black/40 border-white/10 text-white/60"
              }`}
            >
              Включить градиент профиля
            </button>
          </div>
        </div>
        )}

        {/* Другие настройки Tab */}
        {activeTab === "other" && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 space-y-4">
          <h3 className="text-base font-mono font-bold mb-4 text-purple-400">Другие настройки</h3>
          
          {/* Монохромные иконки */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-white/60">
                <HelpCircle className="w-5 h-5" />
              </div>
              <label className="text-xs font-mono text-neutral-400">Монохромные иконки</label>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, monochromeIcons: !formData.monochromeIcons })}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.monochromeIcons ? "bg-purple-600" : "bg-white/20"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                formData.monochromeIcons ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          {/* Анимированный заголовок */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-neutral-400">Анимированный заголовок</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, animatedHeader: !formData.animatedHeader })}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.animatedHeader ? "bg-purple-600" : "bg-white/20"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                formData.animatedHeader ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          {/* Поменять цвета блоков */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-white/60">
                <HelpCircle className="w-5 h-5" />
              </div>
              <label className="text-xs font-mono text-neutral-400">Поменять цвета блоков</label>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, changeBlockColors: !formData.changeBlockColors })}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.changeBlockColors ? "bg-purple-600" : "bg-white/20"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                formData.changeBlockColors ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>
        </div>
        )}

        {/* Hidden inputs */}
        <input type="hidden" name="displayName" value={formData.displayName} />
        <input type="hidden" name="avatarUrl" value={formData.avatarUrl} />
        <input type="hidden" name="backgroundUrl" value={formData.backgroundUrl} />
        <input type="hidden" name="musicUrl" value={formData.musicUrl} />

        {/* Messages */}
        {state?.error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm font-mono">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm font-mono">
            Настройки успешно сохранены!
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 hover:border-purple-500/50 transition-all font-mono text-sm text-purple-400 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
          >
            Сохранить изменения
          </button>
        </div>
      </form>

      {/* Nickname Effect Modal */}
      {showNicknameModal && (
        <>
          <style jsx>{`
            @keyframes colorShift {
              0%, 100% { color: #ff0000; }
              16% { color: #ff7f00; }
              33% { color: #ffff00; }
              50% { color: #00ff00; }
              66% { color: #0000ff; }
              83% { color: #9400d3; }
            }
            @keyframes particleGlow {
              0%, 100% { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor; }
              50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor; }
            }
          `}</style>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0F0F0F] border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-mono font-bold text-white">Эффекты ника</h3>
              <button
                type="button"
                onClick={() => setShowNicknameModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mb-4">
              {/* Preview (large rectangle) */}
              <div className="col-span-4 md:col-span-2 lg:col-span-1 row-span-2 bg-black/40 border border-white/10 rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                <div 
                  className="text-xl font-mono font-bold"
                  style={{
                    color: formData.nicknameEffect === "rainbow" 
                      ? "transparent"
                      : formData.nicknameEffect.startsWith("particles-blue")
                        ? "#3b82f6"
                        : formData.nicknameEffect.startsWith("particles-green")
                          ? "#22c55e"
                          : formData.nicknameEffect.startsWith("particles-pink")
                            ? "#ec4899"
                            : formData.nicknameEffect.startsWith("particles-red")
                              ? "#ef4444"
                              : formData.nicknameEffect.startsWith("particles-white")
                                ? "#ffffff"
                                : formData.nicknameEffect.startsWith("particles-yellow")
                                  ? "#eab308"
                                  : "#ffffff",
                    background: formData.nicknameEffect === "rainbow" 
                      ? "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)"
                      : undefined,
                    WebkitBackgroundClip: formData.nicknameEffect === "rainbow" ? "text" : undefined,
                    WebkitTextFillColor: formData.nicknameEffect === "rainbow" ? "transparent" : undefined,
                    filter: formData.nicknameEffect === "blurred" ? "blur(2px)" : undefined,
                    textShadow: formData.nicknameEffect.startsWith("particles")
                      ? "0 0 10px currentColor, 0 0 20px currentColor"
                      : undefined,
                    animation: formData.nicknameEffect === "shift" 
                      ? "colorShift 3s infinite" 
                      : formData.nicknameEffect.startsWith("particles") 
                        ? "particleGlow 2s infinite"
                        : undefined,
                  }}
                >
                  {profile.displayName || "lonestill"}
                </div>
              </div>
              
              {/* Effect options */}
            <div className="col-span-4 md:col-span-2 lg:col-span-3 grid grid-cols-3 gap-3">
              {nicknameEffects.map((effect) => {
                const isSelected = formData.nicknameEffect === effect.value;
                const particleColors: Record<string, string> = {
                  blue: "#3b82f6",
                  green: "#22c55e",
                  pink: "#ec4899",
                  red: "#ef4444",
                  white: "#ffffff",
                  yellow: "#eab308",
                };
                
                return (
                  <button
                    key={effect.value}
                    type="button"
                    onClick={() => {
                      if (effect.premium) {
                        // Premium effects can be locked - show message
                        return;
                      }
                      setFormData({ ...formData, nicknameEffect: effect.value });
                      setShowNicknameModal(false);
                    }}
                    className={`relative aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center font-mono text-xs transition-colors ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/20 text-purple-400"
                        : "border-white/10 bg-black/40 text-neutral-400 hover:border-white/20"
                    } ${effect.premium ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {effect.premium && (
                      <Lock className="w-3 h-3 absolute top-1 right-1 text-yellow-400" />
                    )}
                    {effect.value === "none" && <X className="w-4 h-4" />}
                    {effect.label && effect.value !== "none" && (
                      <span className="text-center">{effect.label}</span>
                    )}
                    {effect.icon === "particles" && effect.color && (
                      <div 
                        className="w-full h-full rounded flex items-center justify-center relative overflow-hidden"
                        style={{ 
                          backgroundColor: `${particleColors[effect.color]}20`,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div
                              key={i}
                              className="absolute rounded-full"
                              style={{
                                width: "3px",
                                height: "3px",
                                backgroundColor: particleColors[effect.color],
                                left: `${20 + (i % 4) * 20}%`,
                                top: `${20 + Math.floor(i / 4) * 20}%`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowNicknameModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-neutral-400 font-mono text-sm transition-all"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => setShowNicknameModal(false)}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-mono text-sm shadow-lg shadow-purple-900/20 transition-all"
              >
                Сохранить
              </button>
            </div>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
