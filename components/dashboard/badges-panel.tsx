"use client";

import { useState, useEffect } from "react";
import { 
  Award, 
  Bug, 
  Terminal, 
  Star,
  Crown,
  Lock,
  Check,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";
import { BadgeType, Profile } from "@/db/schema";
import { updateProfile } from "@/app/actions/update-profile";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

interface BadgesPanelProps {
  userBadges: BadgeType[];
  username: string;
  profile: Profile;
}

interface BadgeInfo {
  id: BadgeType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  secret?: boolean;
  hint?: string;
}

const ALL_BADGES: BadgeInfo[] = [
  {
    id: "bughunter",
    name: "Bug Hunter",
    description: "Нашёл и сообщил о баге на сайте",
    icon: <Bug className="w-6 h-6" />,
    color: "#ef4444",
    hint: "Найди баг и сообщи разработчику",
  },
  {
    id: "hacker",
    name: "Hacker",
    description: "Нашёл секрет в консоли",
    icon: <Terminal className="w-6 h-6" />,
    color: "#22c55e",
    secret: true,
    hint: "???",
  },
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Один из первых пользователей",
    icon: <Star className="w-6 h-6" />,
    color: "#f59e0b",
    hint: "Выдаётся первым 100 пользователям",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Премиум пользователь",
    icon: <Crown className="w-6 h-6" />,
    color: "#a855f7",
    hint: "Премиум подписка",
  },
];

export function BadgesPanel({ userBadges, username, profile }: BadgesPanelProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [state, formAction] = useActionState(updateProfile, null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const router = useRouter();
  
  const modules = (profile.modules || {}) as any;
  const display = modules.display || {};
  
  // If visibleBadges is undefined, show all badges by default
  const [visibleBadges, setVisibleBadges] = useState<BadgeType[]>(
    display.visibleBadges !== undefined ? display.visibleBadges : userBadges
  );
  const [showBadges, setShowBadges] = useState<boolean>(
    display.showBadges !== false
  );

  useEffect(() => {
    if (state?.success) {
      setIsSaving(false);
      setShowSuccess(true);
      setSaveCount(c => c + 1);
      router.refresh();
      
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    if (state?.error) {
      setIsSaving(false);
    }
  }, [state, router]);

  const saveBadgeSettings = (newVisibleBadges: BadgeType[], newShowBadges: boolean) => {
    setIsSaving(true);
    
    const formDataObj = new FormData();
    formDataObj.set("displayName", profile.displayName || "");
    formDataObj.set("bioText", profile.bioText || "");
    formDataObj.set("avatarUrl", profile.avatarUrl || "");
    formDataObj.set("backgroundUrl", profile.backgroundUrl || "");
    
    const modulesJson = {
      ...modules,
      display: {
        ...display,
        visibleBadges: newVisibleBadges,
        showBadges: newShowBadges,
      },
    };
    formDataObj.set("modulesJson", JSON.stringify(modulesJson));
    formDataObj.set("themeConfig", JSON.stringify(profile.themeConfig || {}));
    
    formAction(formDataObj);
  };

  const toggleBadgeVisibility = (badgeId: BadgeType) => {
    const newVisibleBadges = visibleBadges.includes(badgeId)
      ? visibleBadges.filter(b => b !== badgeId)
      : [...visibleBadges, badgeId];
    setVisibleBadges(newVisibleBadges);
    saveBadgeSettings(newVisibleBadges, showBadges);
  };

  const toggleShowBadges = () => {
    const newShowBadges = !showBadges;
    setShowBadges(newShowBadges);
    saveBadgeSettings(visibleBadges, newShowBadges);
  };
  
  const hasBadge = (badgeId: BadgeType) => userBadges.includes(badgeId);
  const isBadgeVisible = (badgeId: BadgeType) => visibleBadges.includes(badgeId);
  const unlockedCount = userBadges.length;
  const totalCount = ALL_BADGES.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-yellow-600/20 flex items-center justify-center">
          <Award className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-xl font-mono font-semibold text-white">Бейджи</h2>
          <p className="text-sm font-mono text-neutral-500">
            Разблокировано {unlockedCount} из {totalCount}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-neutral-800 rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Display Settings */}
      {userBadges.length > 0 && (
        <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-sm font-mono text-neutral-200">Показывать бейджи в профиле</div>
                <div className="text-xs font-mono text-neutral-500">
                  {isSaving ? "Сохранение..." : `${visibleBadges.length} из ${userBadges.length} видимых`}
                </div>
              </div>
            </div>
            <div
              className={`toggle-switch ${showBadges ? "active" : ""}`}
              onClick={toggleShowBadges}
            />
          </div>
        </div>
      )}

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ALL_BADGES.map((badge) => {
          const unlocked = hasBadge(badge.id);
          
          return (
            <div
              key={badge.id}
              onMouseEnter={() => setHoveredBadge(badge.id)}
              onMouseLeave={() => setHoveredBadge(null)}
              className={`relative p-5 rounded-xl border transition-all duration-300 ${
                unlocked
                  ? "bg-neutral-900/50 border-neutral-700 hover:border-neutral-600"
                  : "bg-neutral-900/30 border-neutral-800/50 opacity-60"
              }`}
            >
              {/* Badge Icon */}
              <div className="flex items-start gap-4">
                <div 
                  className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                    unlocked 
                      ? "shadow-lg" 
                      : "grayscale"
                  }`}
                  style={{ 
                    backgroundColor: unlocked ? `${badge.color}20` : "rgba(64,64,64,0.3)",
                    color: unlocked ? badge.color : "#666",
                    boxShadow: unlocked ? `0 0 20px ${badge.color}30` : "none",
                  }}
                >
                  {unlocked ? badge.icon : <Lock className="w-6 h-6" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-mono font-semibold ${unlocked ? "text-white" : "text-neutral-500"}`}>
                      {badge.secret && !unlocked ? "???" : badge.name}
                    </h3>
                    {unlocked && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-mono">
                        <Check className="w-3 h-3" />
                        <span>Получен</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-mono text-neutral-500 mt-1">
                    {badge.secret && !unlocked ? "Секретный бейдж" : badge.description}
                  </p>
                  {!unlocked && badge.hint && !badge.secret && (
                    <p className="text-xs font-mono text-neutral-600 mt-2 italic">
                      💡 {badge.hint}
                    </p>
                  )}
                </div>
              </div>

              {/* Visibility toggle for unlocked badges */}
              {unlocked && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBadgeVisibility(badge.id);
                  }}
                  className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all ${
                    isBadgeVisible(badge.id)
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"
                  }`}
                  title={isBadgeVisible(badge.id) ? "Скрыть в профиле" : "Показать в профиле"}
                >
                  {isBadgeVisible(badge.id) ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Sparkle effect for unlocked badges */}
              {unlocked && hoveredBadge === badge.id && isBadgeVisible(badge.id) && (
                <Sparkles 
                  className="absolute top-10 right-3 w-4 h-4 animate-pulse"
                  style={{ color: badge.color }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Secret hint */}
      <div className="mt-8 p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/50 border-dashed">
        <p className="text-sm font-mono text-neutral-500 text-center">
          <span className="text-neutral-400">💡 Подсказка:</span> Некоторые бейджи можно получить самыми необычными способами...
        </p>
      </div>
    </div>
  );
}
