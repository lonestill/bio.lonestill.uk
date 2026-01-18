"use client";

import { useState, useTransition, useEffect } from "react";
import { Profile } from "@/db/schema";
import { updateLinks } from "@/app/actions/links";
import { updateProfile } from "@/app/actions/update-profile";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  Link2,
  Plus,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Globe,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

interface Link {
  platform: string;
  url: string;
  label: string;
}

interface LinksPanelProps {
  profile: Profile;
}

const linkStyles = [
  { value: "glass", label: "Glass", desc: "Стеклянные кнопки" },
  { value: "cards", label: "Cards", desc: "Карточки" },
  { value: "pills", label: "Pills", desc: "Таблетки" },
  { value: "minimal", label: "Minimal", desc: "Минимализм" },
];

const getLinkIcon = (url: string): string => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "🎬";
  if (url.includes("twitter.com") || url.includes("x.com")) return "𝕏";
  if (url.includes("t.me") || url.includes("telegram")) return "✈️";
  if (url.includes("github.com")) return "🐙";
  if (url.includes("instagram.com")) return "📷";
  if (url.includes("tiktok.com")) return "🎵";
  if (url.includes("discord")) return "💬";
  if (url.includes("twitch.tv")) return "🎮";
  if (url.includes("linkedin.com")) return "💼";
  if (url.includes("vk.com")) return "🔵";
  return "🔗";
};

const getLinkType = (url: string): string => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("twitter.com") || url.includes("x.com")) return "X/Twitter";
  if (url.includes("t.me") || url.includes("telegram")) return "Telegram";
  if (url.includes("github.com")) return "GitHub";
  if (url.includes("instagram.com")) return "Instagram";
  if (url.includes("tiktok.com")) return "TikTok";
  if (url.includes("discord")) return "Discord";
  if (url.includes("twitch.tv")) return "Twitch";
  if (url.includes("linkedin.com")) return "LinkedIn";
  if (url.includes("vk.com")) return "VK";
  return "Ссылка";
};

export function LinksPanel({ profile }: LinksPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(updateProfile, null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  const modules = (profile.modules || {}) as any;
  const display = modules.display || {};
  
  const [links, setLinks] = useState<Link[]>(profile.modules?.socials || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentLink, setCurrentLink] = useState<Link>({ platform: "link", url: "", label: "" });
  
  const [linkSettings, setLinkSettings] = useState({
    linkStyle: display.linkStyle || "glass",
    showFavicons: display.showFavicons !== false,
  });

  // Save link settings to profile
  const saveLinkSettings = async (newSettings: typeof linkSettings) => {
    setIsSavingSettings(true);
    
    const formDataObj = new FormData();
    formDataObj.set("displayName", profile.displayName || "");
    formDataObj.set("bioText", profile.bioText || "");
    formDataObj.set("avatarUrl", profile.avatarUrl || "");
    formDataObj.set("backgroundUrl", profile.backgroundUrl || "");
    
    const modulesJson = {
      ...modules,
      display: {
        ...display,
        ...newSettings,
      },
    };
    formDataObj.set("modulesJson", JSON.stringify(modulesJson));
    formDataObj.set("themeConfig", JSON.stringify(profile.themeConfig || {}));
    
    formAction(formDataObj);
  };

  useEffect(() => {
    if (state?.success) {
      setIsSavingSettings(false);
      router.refresh();
    }
    if (state?.error) {
      setIsSavingSettings(false);
    }
  }, [state, router]);

  const handleLinkStyleChange = (newStyle: string) => {
    const newSettings = { ...linkSettings, linkStyle: newStyle };
    setLinkSettings(newSettings);
    saveLinkSettings(newSettings);
  };

  const handleFaviconsToggle = () => {
    const newSettings = { ...linkSettings, showFavicons: !linkSettings.showFavicons };
    setLinkSettings(newSettings);
    saveLinkSettings(newSettings);
  };

  const syncToServer = async (newLinks: Link[]) => {
    startTransition(async () => {
      try {
        const result = await updateLinks(newLinks);
        if (result.error) throw new Error(result.error);
        router.refresh();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const openEditor = (index: number | null) => {
    setEditingIndex(index);
    if (index !== null && links[index]) {
      setCurrentLink({ ...links[index] });
    } else {
      setCurrentLink({ platform: "link", url: "", label: "" });
    }
    setIsModalOpen(true);
  };

  const handleSaveLink = () => {
    if (!currentLink.url) return;

    let newLinks = [...links];
    if (editingIndex !== null) {
      newLinks[editingIndex] = currentLink;
    } else {
      newLinks.push(currentLink);
    }

    setLinks(newLinks);
    syncToServer(newLinks);
    setIsModalOpen(false);
  };

  const handleDelete = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    syncToServer(newLinks);
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === links.length - 1) return;

    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    
    setLinks(newLinks);
    syncToServer(newLinks);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-mono font-semibold text-white">Ссылки</h2>
            <p className="text-sm font-mono text-neutral-500">
              {links.length} {links.length === 1 ? "ссылка" : links.length < 5 ? "ссылки" : "ссылок"}
              {isPending && <span className="ml-2 text-purple-400">• Сохранение...</span>}
            </p>
          </div>
        </div>
        <button
          onClick={() => openEditor(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 font-mono text-sm hover:bg-purple-600/30 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить</span>
        </button>
      </div>

      {/* Link Style Settings */}
      <div className="space-y-4 p-4 rounded-xl bg-neutral-900/30 border border-neutral-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono text-neutral-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-500" />
            Стиль ссылок
            {isSavingSettings && <span className="text-purple-400 text-xs">• Сохранение...</span>}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {linkStyles.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => handleLinkStyleChange(style.value)}
              className={`p-3 rounded-lg border text-left transition-all ${
                linkSettings.linkStyle === style.value
                  ? "border-purple-500/50 bg-purple-500/10 ring-2 ring-purple-500/20"
                  : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
              }`}
            >
              <div className="text-sm font-mono text-white">{style.label}</div>
              <div className="text-xs font-mono text-neutral-500">{style.desc}</div>
            </button>
          ))}
        </div>
        
        {/* Favicons toggle */}
        <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 cursor-pointer hover:bg-neutral-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-4 h-4 text-green-400" />
            <div>
              <div className="text-sm font-mono text-neutral-200">Авто-иконки</div>
              <div className="text-xs font-mono text-neutral-500">Favicon сайтов</div>
            </div>
          </div>
          <div
            className={`toggle-switch ${linkSettings.showFavicons ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); handleFaviconsToggle(); }}
          />
        </label>
      </div>

      {/* Links List */}
      <div className="space-y-3">
        {links.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border-2 border-dashed border-neutral-800">
            <Globe className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-400 font-mono font-medium mb-2">Нет ссылок</p>
            <p className="text-sm font-mono text-neutral-500 mb-4">Добавьте ссылки на ваши соцсети</p>
            <button
              onClick={() => openEditor(null)}
              className="text-purple-400 text-sm font-mono hover:underline"
            >
              Добавить первую ссылку
            </button>
          </div>
        ) : (
          <div className="stagger-children">
            {links.map((link, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:bg-neutral-800/50 hover:border-neutral-700 transition-all"
              >
                {/* Reorder */}
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveLink(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:text-purple-400 text-neutral-500 disabled:opacity-0 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveLink(index, 'down')}
                    disabled={index === links.length - 1}
                    className="p-1 hover:text-purple-400 text-neutral-500 disabled:opacity-0 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-2xl shrink-0">
                  {getLinkIcon(link.url)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-medium text-neutral-200 truncate">
                      {link.label || "Без названия"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                      {getLinkType(link.url)}
                    </span>
                  </div>
                  <div className="text-sm font-mono text-neutral-500 truncate">{link.url}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => openEditor(index)}
                    className="p-2 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0a0a0a] border border-neutral-800 shadow-2xl shadow-black/50 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h3 className="text-lg font-mono font-semibold text-white">
                {editingIndex !== null ? "Редактировать ссылку" : "Новая ссылка"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-mono text-neutral-400">Название</label>
                <input
                  type="text"
                  value={currentLink.label}
                  onChange={(e) => setCurrentLink({ ...currentLink, label: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Например: Мой Telegram"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-mono text-neutral-400">URL</label>
                <input
                  type="url"
                  value={currentLink.url}
                  onChange={(e) => setCurrentLink({ ...currentLink, url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="https://..."
                />
              </div>

              {/* Preview */}
              {currentLink.url && (
                <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                  <p className="text-xs font-mono text-neutral-500 mb-2">Предпросмотр</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getLinkIcon(currentLink.url)}</span>
                    <div>
                      <div className="font-mono text-neutral-200">
                        {currentLink.label || "Без названия"}
                      </div>
                      <div className="text-xs font-mono text-neutral-500">{getLinkType(currentLink.url)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-neutral-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-neutral-900/50 border border-neutral-800 text-neutral-300 font-mono hover:bg-neutral-800 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveLink}
                disabled={!currentLink.url}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 font-mono hover:bg-purple-600/30 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
