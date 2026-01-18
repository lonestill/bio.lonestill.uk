"use client";

import { useState, useEffect, useTransition } from "react";
import { Profile } from "@/db/schema";
import { updateProfile } from "@/app/actions/update-profile";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  Github,
  MessageCircle,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Code,
  Star,
  Settings,
  BarChart3,
  Music,
  Users,
  Link2,
} from "lucide-react";

interface ConnectionsPanelProps {
  profile: Profile;
}

interface ConnectionStatus {
  connected: boolean;
  username?: string;
  loading?: boolean;
}

export function ConnectionsPanel({ profile }: ConnectionsPanelProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateProfile, null);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveCount, setSaveCount] = useState(0);

  const modules = (profile.modules || {}) as any;
  const github = modules.github || {};
  const spotify = modules.spotify || {};
  const discord = modules.discord || {};

  const [connections, setConnections] = useState({
    github: {
      connected: !!github.username,
      username: github.username || "",
      enabled: github.enabled !== false,
      showLastCommit: github.showLastCommit !== false,
      showPinnedRepos: github.showPinnedRepos !== false,
      showStats: github.showStats !== false,
      maxRepos: github.maxRepos || 3,
    },
    spotify: {
      connected: !!spotify.username,
      username: spotify.username || "",
      enabled: spotify.enabled !== false,
    },
    discord: {
      connected: !!discord.userId,
      userId: discord.userId || "",
      enabled: discord.enabled !== false,
    },
  });

  // Check for OAuth callback success/error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");
    const service = params.get("service");

    if (success === "connected" && service === "github") {
      router.refresh();
      window.history.replaceState({}, "", window.location.pathname + "?tab=connections");
    }

    if (error && service === "github") {
      // Error will be shown in UI
      window.history.replaceState({}, "", window.location.pathname + "?tab=connections");
    }
  }, [router]);

  const handleSave = async (service: string, settings: any) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("displayName", profile.displayName || "");
      formData.set("bioText", profile.bioText || "");
      formData.set("avatarUrl", profile.avatarUrl || "");
      formData.set("backgroundUrl", profile.backgroundUrl || "");

      const modulesJson = {
        ...modules,
        [service]: settings,
      };
      formData.set("modulesJson", JSON.stringify(modulesJson));
      formData.set("themeConfig", JSON.stringify(profile.themeConfig || {}));

      formAction(formData);
    });
  };

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      setSaveCount(c => c + 1);
      router.refresh();
      
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  // Update connections when profile changes
  useEffect(() => {
    if (github.username && github.username !== connections.github.username) {
      setConnections({
        ...connections,
        github: {
          ...connections.github,
          connected: true,
          username: github.username,
        },
      });
    }
  }, [github.username]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-neutral-800/50 flex items-center justify-center border border-neutral-700">
          <Link2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-mono font-semibold text-white">Подключения</h2>
          <p className="text-sm font-mono text-neutral-500">
            Подключите сервисы для отображения активности
          </p>
        </div>
      </div>

      {/* GitHub Connection */}
      <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-mono font-semibold text-white">GitHub</h3>
              <p className="text-sm font-mono text-neutral-500">
                {connections.github.connected
                  ? `Подключен как @${connections.github.username}`
                  : "Показывайте свои репозитории и коммиты"}
              </p>
            </div>
          </div>
          <div
            className={`toggle-switch ${connections.github.enabled ? "active" : ""}`}
            onClick={() => {
              const updated = {
                ...connections.github,
                enabled: !connections.github.enabled,
              };
              setConnections({ ...connections, github: updated });
              handleSave("github", updated);
            }}
          />
        </div>

        {!connections.github.connected ? (
          <a
            href="/api/auth/github"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl hover:bg-neutral-800 hover:border-neutral-600 transition-all font-mono text-white"
          >
            <Github className="w-4 h-4" />
            <span>Подключить GitHub</span>
          </a>
        ) : (
          <div className="space-y-4">
            {/* Display Options */}
            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <h4 className="text-sm font-mono text-neutral-400 mb-3">Настройки отображения</h4>

              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-neutral-800/50 cursor-pointer hover:bg-neutral-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm font-mono text-neutral-300">Последний коммит</span>
                </div>
                <div
                  className={`toggle-switch ${connections.github.showLastCommit ? "active" : ""}`}
                  onClick={() => {
                    const updated = {
                      ...connections.github,
                      showLastCommit: !connections.github.showLastCommit,
                    };
                    setConnections({ ...connections, github: updated });
                    handleSave("github", updated);
                  }}
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-neutral-800/50 cursor-pointer hover:bg-neutral-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm font-mono text-neutral-300">Закреплённые репозитории</span>
                </div>
                <div
                  className={`toggle-switch ${connections.github.showPinnedRepos ? "active" : ""}`}
                  onClick={() => {
                    const updated = {
                      ...connections.github,
                      showPinnedRepos: !connections.github.showPinnedRepos,
                    };
                    setConnections({ ...connections, github: updated });
                    handleSave("github", updated);
                  }}
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-neutral-800/50 cursor-pointer hover:bg-neutral-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm font-mono text-neutral-300">Статистика</span>
                </div>
                <div
                  className={`toggle-switch ${connections.github.showStats ? "active" : ""}`}
                  onClick={() => {
                    const updated = {
                      ...connections.github,
                      showStats: !connections.github.showStats,
                    };
                    setConnections({ ...connections, github: updated });
                    handleSave("github", updated);
                  }}
                />
              </label>

              {connections.github.showPinnedRepos && (
                <div className="mt-3">
                  <label className="block mb-2 text-sm font-mono text-neutral-300">
                    Максимум репозиториев
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={connections.github.maxRepos}
                    onChange={(e) => {
                      const updated = {
                        ...connections.github,
                        maxRepos: parseInt(e.target.value) || 3,
                      };
                      setConnections({ ...connections, github: updated });
                      handleSave("github", updated);
                    }}
                    className="w-full px-4 py-2 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spotify Connection */}
      <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 opacity-60">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center border border-green-600/30">
              <Music className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-mono font-semibold text-white">Spotify</h3>
              <p className="text-sm font-mono text-neutral-500">
                {connections.spotify.connected
                  ? `Подключен как ${connections.spotify.username}`
                  : "Показывайте что сейчас слушаете"}
              </p>
            </div>
          </div>
          <div
            className={`toggle-switch ${connections.spotify.enabled ? "active" : ""}`}
            onClick={() => {
              if (!connections.spotify.connected) return;
              const updated = {
                ...connections.spotify,
                enabled: !connections.spotify.enabled,
              };
              setConnections({ ...connections, spotify: updated });
              handleSave("spotify", updated);
            }}
          />
        </div>

        {!connections.spotify.connected ? (
          <button
            disabled
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-neutral-800/30 border border-neutral-700/50 rounded-xl font-mono text-neutral-500 cursor-not-allowed"
          >
            <Music className="w-4 h-4" />
            <span>Скоро</span>
          </button>
        ) : (
          <div className="text-sm font-mono text-neutral-500">
            Настройки Spotify будут доступны после подключения
          </div>
        )}
      </div>

      {/* Discord Connection */}
      <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 opacity-60">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-600/30">
              <MessageCircle className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-mono font-semibold text-white">Discord</h3>
              <p className="text-sm font-mono text-neutral-500">
                {connections.discord.connected
                  ? `Подключен`
                  : "Показывайте свой статус Discord"}
              </p>
            </div>
          </div>
          <div
            className={`toggle-switch ${connections.discord.enabled ? "active" : ""}`}
            onClick={() => {
              if (!connections.discord.connected) return;
              const updated = {
                ...connections.discord,
                enabled: !connections.discord.enabled,
              };
              setConnections({ ...connections, discord: updated });
              handleSave("discord", updated);
            }}
          />
        </div>

        {!connections.discord.connected ? (
          <button
            disabled
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-neutral-800/30 border border-neutral-700/50 rounded-xl font-mono text-neutral-500 cursor-not-allowed"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Скоро</span>
          </button>
        ) : (
          <div className="text-sm font-mono text-neutral-500">
            Настройки Discord будут доступны после подключения
          </div>
        )}
      </div>

      {/* Status Messages */}
      {state?.error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-mono">{state.error}</span>
        </div>
      )}

      {showSuccess && (
        <div key={saveCount} className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 animate-scale-in">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-mono">Настройки сохранены!</span>
        </div>
      )}
    </div>
  );
}
