"use client";

import { useState, useTransition } from "react";
import { Profile } from "@/db/schema";
import { updateLinks } from "@/app/actions/links";
import { useRouter } from "next/navigation";

// --- Types ---
interface Link {
  platform: string;
  url: string;
  label: string;
}

interface LinksStackProps {
  profile: Profile;
}

// --- Helper Functions ---
const getLinkType = (url: string): string => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YOUTUBE";
  if (url.includes("twitter.com") || url.includes("x.com")) return "TWITTER";
  if (url.includes("t.me")) return "TELEGRAM";
  if (url.includes("github.com")) return "GITHUB";
  return "LINK";
};

export function LinksStack({ profile }: LinksStackProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Local state for immediate UI updates
  const [links, setLinks] = useState<Link[]>(profile.modules?.socials || []);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // null = creating new
  const [currentLink, setCurrentLink] = useState<Link>({ platform: "link", url: "", label: "" });

  // --- Actions ---

  // 1. Save to Server (Shared Logic)
  const syncToServer = async (newLinks: Link[]) => {
    startTransition(async () => {
      try {
        const result = await updateLinks(newLinks);
        if (result.error) throw new Error(result.error);
        router.refresh();
      } catch (e) {
        console.error(e);
        alert("Не удалось сохранить изменения на сервере");
        // Optional: revert local state here if strict consistency is needed
      }
    });
  };

  // 2. Open Modal
  const openEditor = (index: number | null) => {
    setEditingIndex(index);
    if (index !== null && links[index]) {
      setCurrentLink({ ...links[index] });
    } else {
      setCurrentLink({ platform: "link", url: "", label: "" });
    }
    setIsModalOpen(true);
  };

  // 3. Handle Form Submit
  const handleSaveLink = () => {
    if (!currentLink.url) return alert("URL обязателен");

    let newLinks = [...links];
    if (editingIndex !== null) {
      // Edit existing
      newLinks[editingIndex] = currentLink;
    } else {
      // Add new
      newLinks.push(currentLink);
    }

    setLinks(newLinks); // Optimistic update
    syncToServer(newLinks); // Server sync
    setIsModalOpen(false);
  };

  // 4. Delete
  const handleDelete = (index: number) => {
    if (!confirm("Удалить эту ссылку?")) return;
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    syncToServer(newLinks);
  };

  // 5. Move Item (Simple reorder)
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <h2 className="text-lg font-mono font-bold text-white">Мои ссылки</h2>
            {isPending && (
                <span className="text-xs font-mono text-purple-400 animate-pulse">
                    Сохранение...
                </span>
            )}
        </div>
        <button
          onClick={() => openEditor(null)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all font-mono text-sm shadow-[0_0_15px_rgba(147,51,234,0.3)]"
        >
          + Добавить
        </button>
      </div>

      {/* List */}
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden min-h-[100px]">
        {links.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full">
            <p className="text-neutral-500 font-mono text-sm mb-2">Список пуст</p>
            <button 
                onClick={() => openEditor(null)}
                className="text-purple-400 text-xs font-mono hover:underline"
            >
                Создать первую ссылку
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {links.map((link, index) => (
              <div key={index} className="group flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                
                {/* Reorder Controls (Simple) */}
                <div className="flex flex-col gap-1 opacity-30 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => moveLink(index, 'up')}
                        disabled={index === 0}
                        className="w-5 h-5 flex items-center justify-center hover:text-white text-neutral-500 disabled:opacity-0"
                    >▲</button>
                    <button 
                        onClick={() => moveLink(index, 'down')}
                        disabled={index === links.length - 1}
                        className="w-5 h-5 flex items-center justify-center hover:text-white text-neutral-500 disabled:opacity-0"
                    >▼</button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditor(index)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-white truncate">
                      {link.label || "Без названия"}
                    </span>
                    <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-neutral-400 uppercase">
                        {getLinkType(link.url)}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-neutral-500 truncate">
                    {link.url}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditor(index)}
                    className="p-2 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
                    title="Изменить"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 hover:bg-red-500/10 rounded text-neutral-500 hover:text-red-400 transition-colors"
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-xl shadow-2xl p-6 relative">
            
            <h3 className="text-lg font-mono font-bold text-white mb-6">
              {editingIndex !== null ? "Редактирование ссылки" : "Новая ссылка"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-500 uppercase mb-2">Название</label>
                <input
                  type="text"
                  value={currentLink.label}
                  onChange={(e) => setCurrentLink({ ...currentLink, label: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                  placeholder="Например: Мой Telegram"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono text-neutral-500 uppercase mb-2">URL Адрес</label>
                <input
                  type="text"
                  value={currentLink.url}
                  onChange={(e) => setCurrentLink({ ...currentLink, url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                  placeholder="https://..."
                />
              </div>

              {/* Platform is mostly auto-detected, but editable if needed */}
              <div className="hidden"> 
                <input
                    value={currentLink.platform}
                    onChange={(e) => setCurrentLink({...currentLink, platform: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-neutral-400 font-mono text-sm transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveLink}
                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-mono text-sm shadow-lg shadow-purple-900/20 transition-all"
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