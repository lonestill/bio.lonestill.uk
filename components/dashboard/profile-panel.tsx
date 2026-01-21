"use client";

import { useState, useEffect, useRef } from "react";
import { Profile } from "@/db/schema";
import { updateProfile } from "@/app/actions/update-profile";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  FileText,
  Image,
  Video,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  Eye,
  Hash,
  Calendar,
  LayoutGrid,
  Upload,
  X,
} from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

interface ProfilePanelProps {
  profile: Profile;
}

const layoutOptions = [
  { value: "centered", label: "По центру" },
  { value: "left", label: "Слева" },
];

export function ProfilePanel({ profile }: ProfilePanelProps) {
  const [state, formAction] = useActionState(updateProfile, null);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  
  const modules = (profile.modules || {}) as any;
  const display = modules.display || {};
  
  const [formData, setFormData] = useState({
    displayName: profile.displayName || "",
    bioText: profile.bioText || "",
    avatarUrl: profile.avatarUrl || "",
    backgroundUrl: profile.backgroundUrl || "",
  });

  const [displaySettings, setDisplaySettings] = useState({
    showUid: display.showUid || false,
    showViews: display.showViews || false,
    showCreatedAt: display.showCreatedAt || false,
    layout: display.layout || "centered",
  });

  // Upload states
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [backgroundUploading, setBackgroundUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const { startUpload: startAvatarUpload } = useUploadThing("avatarUploader", {
    onClientUploadComplete: (res: { url: string }[]) => {
      if (res && res[0]?.url) {
        setFormData({ ...formData, avatarUrl: res[0].url });
      }
      setAvatarUploading(false);
    },
    onUploadError: (error: Error) => {
      console.error("Avatar upload error:", error);
      setAvatarUploading(false);
    },
  });

  const { startUpload: startBackgroundUpload } = useUploadThing("backgroundUploader", {
    onClientUploadComplete: (res: { url: string }[]) => {
      if (res && res[0]?.url) {
        setFormData({ ...formData, backgroundUrl: res[0].url });
      }
      setBackgroundUploading(false);
    },
    onUploadError: (error: Error) => {
      console.error("Background upload error:", error);
      setBackgroundUploading(false);
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAvatarUploading(true);
    await startAvatarUpload(Array.from(files));
  };

  const handleBackgroundChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBackgroundUploading(true);
    await startBackgroundUpload(Array.from(files));
  };

  useEffect(() => {
    if (state?.success) {
      setIsPending(false);
      setShowSuccess(true);
      setSaveCount(c => c + 1);
      router.refresh();
      
      // Auto-hide success message after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
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
    formDataObj.set("displayName", formData.displayName);
    formDataObj.set("bioText", formData.bioText);
    formDataObj.set("avatarUrl", formData.avatarUrl);
    formDataObj.set("backgroundUrl", formData.backgroundUrl);
    
    const modulesJson = {
      ...modules,
      display: displaySettings,
    };
    formDataObj.set("modulesJson", JSON.stringify(modulesJson));
    formDataObj.set("themeConfig", JSON.stringify(profile.themeConfig || {}));
    
    formAction(formDataObj);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
          <User className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-mono font-semibold text-white">Профиль</h2>
          <p className="text-sm font-mono text-neutral-500">Основная информация о вас</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-mono text-neutral-400">
              <User className="w-4 h-4 text-neutral-500" />
              Имя
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="Ваше имя"
            />
          </div>

          {/* Bio Text */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-mono text-neutral-400">
              <FileText className="w-4 h-4 text-neutral-500" />
              Описание
            </label>
            <textarea
              value={formData.bioText}
              onChange={(e) => setFormData({ ...formData, bioText: e.target.value })}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              placeholder="Расскажите о себе..."
            />
            <div className="flex justify-end">
              <span className="text-xs font-mono text-neutral-500">
                {formData.bioText.length}/500
              </span>
            </div>
          </div>

          {/* Avatar Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-mono text-neutral-400">
              <Image className="w-4 h-4 text-neutral-500" />
              Аватар
            </label>
            <div className="flex items-start gap-4">
              {formData.avatarUrl && (
                <div className="relative group">
                  <img
                    src={formData.avatarUrl}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-xl object-cover ring-2 ring-purple-500/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: "" })}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 border border-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
              <div className="flex-1 space-y-3">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800/50 border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-all font-mono text-sm text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {avatarUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Загрузка...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Загрузить аватар</span>
                    </>
                  )}
                </button>
                <p className="text-xs font-mono text-neutral-500">
                  Или введите URL вручную
                </p>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800 text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          </div>

          {/* Background Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-mono text-neutral-400">
              <Video className="w-4 h-4 text-neutral-500" />
              Фон
            </label>
            <div className="flex items-start gap-4">
              {formData.backgroundUrl && (
                <div className="relative group">
                  <img
                    src={formData.backgroundUrl}
                    alt="Background preview"
                    className="w-32 h-20 rounded-xl object-cover ring-2 ring-purple-500/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, backgroundUrl: "" })}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 border border-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
              <div className="flex-1 space-y-3">
                <input
                  ref={backgroundInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => backgroundInputRef.current?.click()}
                  disabled={backgroundUploading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800/50 border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-all font-mono text-sm text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {backgroundUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Загрузка...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Загрузить фон</span>
                    </>
                  )}
                </button>
                <p className="text-xs font-mono text-neutral-500">
                  Или введите URL вручную (изображение или видео)
                </p>
                <input
                  type="url"
                  value={formData.backgroundUrl}
                  onChange={(e) => setFormData({ ...formData, backgroundUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800 text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                  placeholder="https://example.com/background.jpg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings Section */}
        <div className="space-y-4 pt-4 border-t border-neutral-800">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <Eye className="w-4 h-4 text-neutral-500" />
            Отображение на странице
          </h3>
          
          <div className="space-y-3">
            {/* Show Views */}
            <label className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 cursor-pointer hover:bg-neutral-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-sm font-mono text-neutral-200">Просмотры профиля</div>
                  <div className="text-xs font-mono text-neutral-500">Показать счётчик просмотров</div>
                </div>
              </div>
              <div
                className={`toggle-switch ${displaySettings.showViews ? "active" : ""}`}
                onClick={() => setDisplaySettings({ ...displaySettings, showViews: !displaySettings.showViews })}
              />
            </label>
            
            {/* Show UID */}
            <label className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 cursor-pointer hover:bg-neutral-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-violet-400" />
                <div>
                  <div className="text-sm font-mono text-neutral-200">ID пользователя</div>
                  <div className="text-xs font-mono text-neutral-500">Показать уникальный идентификатор</div>
                </div>
              </div>
              <div
                className={`toggle-switch ${displaySettings.showUid ? "active" : ""}`}
                onClick={() => setDisplaySettings({ ...displaySettings, showUid: !displaySettings.showUid })}
              />
            </label>
            
            {/* Show Created Date */}
            <label className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 cursor-pointer hover:bg-neutral-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-fuchsia-400" />
                <div>
                  <div className="text-sm font-mono text-neutral-200">Дата регистрации</div>
                  <div className="text-xs font-mono text-neutral-500">Показать когда создан аккаунт</div>
                </div>
              </div>
              <div
                className={`toggle-switch ${displaySettings.showCreatedAt ? "active" : ""}`}
                onClick={() => setDisplaySettings({ ...displaySettings, showCreatedAt: !displaySettings.showCreatedAt })}
              />
            </label>

          </div>
        </div>

        {/* Layout Section */}
        <div className="space-y-4 pt-4 border-t border-neutral-800">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-neutral-500" />
            Расположение
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {layoutOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDisplaySettings({ ...displaySettings, layout: option.value })}
                className={`p-4 rounded-xl border text-center transition-all ${
                  displaySettings.layout === option.value
                    ? "border-purple-500/50 bg-purple-500/10 ring-2 ring-purple-500/20"
                    : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                }`}
              >
                <span className="text-sm font-mono text-neutral-300">{option.label}</span>
              </button>
            ))}
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
          <div 
            key={saveCount}
            className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 animate-scale-in"
          >
            <Check className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-mono">Профиль успешно обновлён!</span>
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
              <span>Сохранить изменения</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
