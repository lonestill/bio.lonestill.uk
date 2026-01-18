"use client";

import { useState, useEffect, useTransition } from "react";
import { Profile } from "@/db/schema";
import { updateProfile } from "@/app/actions/update-profile";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  Github,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Code,
  GitBranch,
  Calendar,
  Eye,
  Star,
  Settings,
  BarChart3,
} from "lucide-react";

interface GitHubPanelProps {
  profile: Profile;
}

interface GitHubData {
  username: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  lastCommit?: {
    repo: string;
    message: string;
    date: string;
    url: string;
  };
  pinnedRepos?: Array<{
    name: string;
    description: string;
    stars: number;
    language: string;
    url: string;
  }>;
}

export function GitHubPanel({ profile }: GitHubPanelProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateProfile, null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(false);
  const [gitHubData, setGitHubData] = useState<GitHubData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const modules = (profile.modules || {}) as any;
  const github = modules.github || {};
  
  const [githubSettings, setGithubSettings] = useState({
    username: github.username || "",
    enabled: github.enabled !== false,
    showLastCommit: github.showLastCommit !== false,
    showPinnedRepos: github.showPinnedRepos !== false,
    showStats: github.showStats !== false,
    maxRepos: github.maxRepos || 3,
  });

  // Update username when profile changes (after OAuth)
  useEffect(() => {
    if (github.username && github.username !== githubSettings.username) {
      setGithubSettings({ ...githubSettings, username: github.username });
      loadGitHubData(github.username);
    }
  }, [github.username]);

  // Check for OAuth callback success/error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");
    
    if (success === "connected") {
      // Reload page to get updated profile data
      router.refresh();
      // Clear URL params
      window.history.replaceState({}, "", window.location.pathname + "?tab=github");
    }
    
    if (error) {
      setError(`Ошибка подключения: ${error}`);
      // Clear URL params
      window.history.replaceState({}, "", window.location.pathname + "?tab=github");
    }
  }, [router]);

  // Load GitHub data when username is set
  useEffect(() => {
    if (githubSettings.username && githubSettings.enabled) {
      loadGitHubData(githubSettings.username);
    }
  }, []);

  const loadGitHubData = async (username: string) => {
    setIsLoadingGitHub(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/github?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to load GitHub data");
      }
      
      setGitHubData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load GitHub data");
      setGitHubData(null);
    } finally {
      setIsLoadingGitHub(false);
    }
  };

  const handleSave = async () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("displayName", profile.displayName || "");
      formData.set("bioText", profile.bioText || "");
      formData.set("avatarUrl", profile.avatarUrl || "");
      formData.set("backgroundUrl", profile.backgroundUrl || "");

      const modulesJson = {
        ...modules,
        github: githubSettings,
      };
      formData.set("modulesJson", JSON.stringify(modulesJson));
      formData.set("themeConfig", JSON.stringify(profile.themeConfig || {}));

      formAction(formData);
      
      // Reload GitHub data if username changed
      if (githubSettings.username && githubSettings.enabled) {
        await loadGitHubData(githubSettings.username);
      }
    });
  };

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-neutral-800/50 flex items-center justify-center border border-neutral-700">
          <Github className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-mono font-semibold text-white">GitHub</h2>
          <p className="text-sm font-mono text-neutral-500">
            Подключите GitHub для отображения активности
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* GitHub OAuth Connect */}
        {!gitHubData && (
          <div>
            <label className="block mb-2 text-sm font-mono text-neutral-300">
              Подключить GitHub
            </label>
            <p className="text-xs font-mono text-neutral-500 mb-3">
              Авторизуйтесь через GitHub для автоматического получения данных
            </p>
            <a
              href="/api/auth/github"
              className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:bg-neutral-800/50 hover:border-neutral-700 transition-all font-mono text-white"
            >
              <Github className="w-5 h-5" />
              <span>Войти через GitHub</span>
            </a>
          </div>
        )}

        {/* GitHub Data Preview */}
        {gitHubData && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={gitHubData.avatar_url}
                alt={gitHubData.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-mono text-white font-semibold">{gitHubData.username}</div>
                <div className="text-xs font-mono text-neutral-400">
                  {gitHubData.public_repos} репозиториев • {gitHubData.followers} подписчиков
                </div>
              </div>
            </div>
            {gitHubData.bio && (
              <p className="text-sm font-mono text-neutral-300 mb-3">{gitHubData.bio}</p>
            )}
            {gitHubData.lastCommit && (
              <div className="mt-3 pt-3 border-t border-green-500/20">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
                  <Code className="w-3 h-3" />
                  Последний коммит
                </div>
                <a
                  href={gitHubData.lastCommit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                >
                  {gitHubData.lastCommit.repo}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-xs font-mono text-neutral-500 mt-1">
                  {gitHubData.lastCommit.message}
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-mono">{error}</span>
          </div>
        )}

        {/* Enable/Disable Toggle */}
        <label className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 cursor-pointer hover:bg-neutral-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-neutral-400" />
            <div>
              <div className="text-sm font-mono text-neutral-200">Включить GitHub</div>
              <div className="text-xs font-mono text-neutral-500">
                Отображать GitHub данные на странице профиля
              </div>
            </div>
          </div>
          <div
            className={`toggle-switch ${githubSettings.enabled ? "active" : ""}`}
            onClick={() => setGithubSettings({ ...githubSettings, enabled: !githubSettings.enabled })}
          />
        </label>

        {/* Display Options */}
        {githubSettings.enabled && (
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <h3 className="text-sm font-mono text-neutral-400 mb-4">Настройки отображения</h3>
            
            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-neutral-800/50 cursor-pointer hover:bg-neutral-800/30 transition-colors">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-mono text-neutral-300">Последний коммит</span>
              </div>
              <div
                className={`toggle-switch ${githubSettings.showLastCommit ? "active" : ""}`}
                onClick={() => setGithubSettings({ ...githubSettings, showLastCommit: !githubSettings.showLastCommit })}
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-neutral-800/50 cursor-pointer hover:bg-neutral-800/30 transition-colors">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-mono text-neutral-300">Закреплённые репозитории</span>
              </div>
              <div
                className={`toggle-switch ${githubSettings.showPinnedRepos ? "active" : ""}`}
                onClick={() => setGithubSettings({ ...githubSettings, showPinnedRepos: !githubSettings.showPinnedRepos })}
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-neutral-800/50 cursor-pointer hover:bg-neutral-800/30 transition-colors">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-mono text-neutral-300">Статистика</span>
              </div>
              <div
                className={`toggle-switch ${githubSettings.showStats ? "active" : ""}`}
                onClick={() => setGithubSettings({ ...githubSettings, showStats: !githubSettings.showStats })}
              />
            </label>

            {githubSettings.showPinnedRepos && (
              <div className="mt-3">
                <label className="block mb-2 text-sm font-mono text-neutral-300">
                  Максимум репозиториев
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={githubSettings.maxRepos}
                  onChange={(e) => setGithubSettings({ ...githubSettings, maxRepos: parseInt(e.target.value) || 3 })}
                  className="w-full px-4 py-2 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
            )}
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

      {state?.success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-mono">Настройки сохранены!</span>
        </div>
      )}

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="w-full px-6 py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl hover:bg-purple-600/30 hover:border-purple-500/50 transition-all font-mono text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Сохранение...</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            <span>Сохранить настройки</span>
          </>
        )}
      </button>
    </div>
  );
}
