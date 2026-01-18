"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Profile } from "@/db/schema";
import { 
  Eye, 
  Hash, 
  Calendar,
  ExternalLink,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";

interface BioRendererProps {
  profile: Profile;
  username: string;
  numericUid?: number;
  createdAt?: Date;
}

// Get favicon URL from Google's free API
function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return "";
  }
}

// Link item with favicon fallback
function LinkItem({ 
  social, 
  index, 
  faviconUrl, 
  styles, 
  username 
}: { 
  social: { url: string; label?: string; platform?: string }; 
  index: number; 
  faviconUrl: string; 
  styles: ReturnType<typeof getLinkStylesStatic>; 
  username: string;
}) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  
  return (
    <motion.a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 + index * 0.1 }}
      whileHover={styles.hoverStyle as any}
      whileTap={{ scale: 0.98 }}
      className={styles.className}
      style={styles.style}
      onClick={async () => {
        try {
          await fetch(`/api/track-click?username=${username}&linkIndex=${index}`, {
            method: "POST",
          });
        } catch {}
      }}
    >
      {faviconUrl && !faviconFailed ? (
        <img 
          src={faviconUrl} 
          alt="" 
          className="w-5 h-5 flex-shrink-0 rounded"
          onError={() => setFaviconFailed(true)}
        />
      ) : (
        <LinkIcon className="w-5 h-5 flex-shrink-0" />
      )}
      <span className="flex-1 font-medium">
        {social.label || social.platform || "Ссылка"}
      </span>
      <ExternalLink className="w-4 h-4 opacity-50" />
    </motion.a>
  );
}

// Helper type for link styles
function getLinkStylesStatic(linkStyle: string, primaryColor: string, secondaryColor: string, textColor: string, cardOpacity: number) {
  const baseStyles = "relative overflow-hidden transition-all duration-300 flex items-center gap-3";
  
  switch (linkStyle) {
    case "pills":
      return {
        className: `${baseStyles} px-6 py-3 rounded-full`,
        style: {
          backgroundColor: `${primaryColor}20`,
          border: `1px solid ${primaryColor}40`,
          color: textColor,
        },
        hoverStyle: {
          backgroundColor: `${primaryColor}40`,
          transform: "translateY(-2px)",
          boxShadow: `0 10px 30px ${primaryColor}30`,
        },
      };
    
    case "cards":
      return {
        className: `${baseStyles} px-6 py-4 rounded-xl w-full`,
        style: {
          backgroundColor: `rgba(255,255,255,0.05)`,
          border: `1px solid rgba(255,255,255,0.1)`,
          color: textColor,
          backdropFilter: "blur(10px)",
        },
        hoverStyle: {
          backgroundColor: `rgba(255,255,255,0.1)`,
          borderColor: `${primaryColor}60`,
          transform: "translateX(8px)",
        },
      };
    
    case "minimal":
      return {
        className: `${baseStyles} px-4 py-3 rounded-lg`,
        style: {
          backgroundColor: "transparent",
          borderBottom: `1px solid ${primaryColor}30`,
          color: textColor,
        },
        hoverStyle: {
          backgroundColor: `${primaryColor}10`,
          borderColor: `${primaryColor}60`,
        },
      };
    
    case "glass":
    default:
      return {
        className: `${baseStyles} px-6 py-4 rounded-2xl`,
        style: {
          backgroundColor: `rgba(255,255,255,${cardOpacity * 0.08})`,
          border: `1px solid rgba(255,255,255,0.15)`,
          color: textColor,
          backdropFilter: "blur(20px)",
          boxShadow: `0 4px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)`,
        },
        hoverStyle: {
          backgroundColor: `rgba(255,255,255,0.15)`,
          borderColor: `${primaryColor}50`,
          transform: "scale(1.02)",
          boxShadow: `0 8px 40px ${primaryColor}20`,
        },
      };
  }
}

export function BioRenderer({ profile, username, numericUid, createdAt }: BioRendererProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [bioText, setBioText] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Track view on mount
  useEffect(() => {
    if (!hasTrackedView) {
      fetch(`/api/track-view?username=${username}`, { method: "POST" })
        .catch(console.error);
      setHasTrackedView(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!isUnlocked || !profile.bioText) return;
    
    const text = profile.bioText;
    setBioText("");
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setBioText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);
    
    return () => clearInterval(typeInterval);
  }, [isUnlocked, profile.bioText]);

  const handleEnter = () => {
    setIsUnlocked(true);
    
    if (audioRef.current && profile.modules?.music?.url) {
      audioRef.current.volume = (profile.modules.music.volume || 30) / 100;
      audioRef.current.play().catch(console.error);
    }
    
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Configuration
  const modules = profile.modules as any || {};
  const musicUrl = modules.music?.url;
  const isYouTubeMusic = musicUrl && getYouTubeVideoId(musicUrl);
  const clickToEnterEnabled = modules.clickToEnter?.enabled !== false;
  const clickToEnterText = modules.clickToEnter?.text || "Click to Enter";
  
  // Effects
  const snowEnabled = modules.effects?.snow || false;
  const scanlinesEnabled = modules.effects?.scanlines || false;
  const cursorStyle = modules.effects?.cursor || "default";
  const backgroundEffect = modules.backgroundEffect || "";
  const nicknameEffect = modules.nicknameEffect || "none";
  
  // Display options
  const display = modules.display || {};
  const showUid = display.showUid || false;
  const showViews = display.showViews || false;
  const showCreatedAt = display.showCreatedAt || false;
  const linkStyle = display.linkStyle || "glass";
  const layout = display.layout || "centered";
  const showFavicons = display.showFavicons !== false; // По умолчанию включено
  
  // Theme
  const themeColors = profile.themeConfig?.colors || {};
  const primaryColor = themeColors.primary || "#8b5cf6";
  const secondaryColor = themeColors.secondary || "#ec4899";
  const textColor = themeColors.text || "#ffffff";
  const backgroundColor = themeColors.background || "#050505";
  const cardOpacity = profile.themeConfig?.opacity ?? 0.9;
  const backgroundBlur = profile.themeConfig?.blur || 0;

  // Apply cursor style
  useEffect(() => {
    if (cursorStyle && cursorStyle !== "default") {
      document.body.style.cursor = cursorStyle;
      return () => { document.body.style.cursor = "default"; };
    }
  }, [cursorStyle]);

  // Render background
  const renderBackground = () => {
    const bgUrl = profile.backgroundUrl;
    
    if (bgUrl && getYouTubeVideoId(bgUrl)) {
      const videoId = getYouTubeVideoId(bgUrl);
      return (
        <div className="absolute inset-0 z-0">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: "scale(1.5)" }}
            allow="autoplay; encrypted-media"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      );
    }
    
    if (bgUrl && /\.(mp4|webm|ogg)$/i.test(bgUrl)) {
      return (
        <video ref={videoRef} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
          <source src={bgUrl} type="video/mp4" />
        </video>
      );
    }
    
    if (bgUrl) {
      return <img src={bgUrl} alt="" className="absolute inset-0 w-full h-full object-cover z-0" />;
    }
    
    if (backgroundEffect === "blurred") {
      return (
        <div className="absolute inset-0 z-0" style={{
          background: `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}40, ${backgroundColor})`,
        }} />
      );
    }
    
    // Default beautiful gradient
    return (
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{ backgroundColor }} />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, ${primaryColor}40, transparent),
              radial-gradient(ellipse 60% 40% at 80% 100%, ${secondaryColor}30, transparent),
              radial-gradient(ellipse 40% 30% at 10% 80%, ${primaryColor}20, transparent)
            `,
          }}
        />
      </div>
    );
  };

  // Get nickname style
  const getNicknameStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {};
    
    if (nicknameEffect === "none") {
      return { color: textColor, textShadow: `0 2px 20px ${primaryColor}50` };
    }
    if (nicknameEffect === "rainbow") {
      return {
        background: "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      };
    }
    if (nicknameEffect === "blurred") {
      return { color: textColor, filter: "blur(2px)" };
    }
    if (nicknameEffect === "shift") {
      return { animation: "colorShift 3s infinite" };
    }
    if (nicknameEffect.startsWith("particles-")) {
      const colorMap: Record<string, string> = {
        "particles-blue": "#3b82f6",
        "particles-green": "#22c55e",
        "particles-pink": "#ec4899",
        "particles-red": "#ef4444",
        "particles-white": "#ffffff",
        "particles-yellow": "#eab308",
      };
      const color = colorMap[nicknameEffect] || textColor;
      return {
        color,
        textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`,
        animation: "particleGlow 2s infinite",
      };
    }
    return { color: textColor };
  };

  // Link styles helper
  const getLinkStyles = () => getLinkStylesStatic(linkStyle, primaryColor, secondaryColor, textColor, cardOpacity);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ backgroundColor }}>
      {/* Background */}
      {renderBackground()}

      {/* Background blur overlay */}
      {backgroundBlur > 0 && (
        <div className="absolute inset-0 z-[1]" style={{ backdropFilter: `blur(${backgroundBlur}px)` }} />
      )}

      {/* Background Effects */}
      {backgroundEffect === "snowflakes" && <SnowEffect />}
      {backgroundEffect === "rain" && <RainEffect />}
      {backgroundEffect === "aurora" && <AuroraEffect />}
      {backgroundEffect === "plasma" && <PlasmaEffect />}
      {backgroundEffect === "night" && <NightEffect />}
      {backgroundEffect === "oldtv" && <OldTVEffect />}

      {/* Content */}
      <div className="relative z-10 h-full w-full flex items-center justify-center p-4 md:p-8">
        {/* Click to Enter */}
        <AnimatePresence>
          {!isUnlocked && clickToEnterEnabled && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-xl cursor-pointer"
              onClick={handleEnter}
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl md:text-6xl font-bold tracking-wider"
                  style={{ color: textColor, textShadow: `0 0 40px ${primaryColor}` }}
                >
                  {clickToEnterText}
                </motion.div>
                <motion.p
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-4 text-sm tracking-widest uppercase"
                  style={{ color: `${textColor}80` }}
                >
                  Нажмите в любом месте
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence>
          {(isUnlocked || !clickToEnterEnabled) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`w-full max-w-lg ${layout === "left" ? "mr-auto" : layout === "split" ? "text-left" : "mx-auto text-center"}`}
            >
              {/* Profile Card */}
              <div
                className="rounded-3xl p-8 md:p-10"
                style={{
                  backgroundColor: `rgba(0,0,0,${cardOpacity * 0.5})`,
                  border: `1px solid rgba(255,255,255,0.1)`,
                  backdropFilter: "blur(40px)",
                  boxShadow: `0 0 80px ${primaryColor}15`,
                }}
              >
                {/* Avatar */}
                {profile.avatarUrl && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    className={`mb-6 w-fit ${layout === "centered" ? "mx-auto" : ""}`}
                  >
                    <div
                      className="relative w-28 h-28 md:w-36 md:h-36"
                      style={{
                        borderRadius: profile.avatarShape === "square" ? "24px" : "50%",
                      }}
                    >
                      <img
                        src={profile.avatarUrl}
                        alt={profile.displayName || username}
                        className="w-full h-full object-cover"
                        style={{
                          borderRadius: profile.avatarShape === "square" ? "24px" : "50%",
                          border: `3px solid ${primaryColor}60`,
                          boxShadow: `0 0 40px ${primaryColor}40`,
                        }}
                      />
                      {/* Online indicator */}
                      <div 
                        className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2"
                        style={{
                          backgroundColor: "#22c55e",
                          borderColor: backgroundColor,
                          boxShadow: "0 0 10px #22c55e80",
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Name */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={getNicknameStyle()}
                >
                  {profile.displayName || username}
                </motion.h1>

                {/* Username badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm mb-4 ${layout === "centered" ? "" : ""}`}
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    color: `${textColor}90`,
                  }}
                >
                  <span className="opacity-60">@</span>
                  {username}
                </motion.div>

                {/* Stats row */}
                {(showUid || showViews || showCreatedAt) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className={`flex flex-wrap gap-4 mb-6 text-sm ${layout === "centered" ? "justify-center" : ""}`}
                    style={{ color: `${textColor}70` }}
                  >
                    {showViews && (
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>{Number(profile.views || 0).toLocaleString()}</span>
                      </div>
                    )}
                    {showUid && numericUid && (
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-4 h-4" />
                        <span className="font-mono text-xs">#{numericUid}</span>
                      </div>
                    )}
                    {showCreatedAt && createdAt && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(createdAt)}</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Bio */}
                {profile.bioText && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-base md:text-lg leading-relaxed mb-8"
                    style={{ color: `${textColor}90` }}
                  >
                    {profile.typewriterEffect ? bioText : profile.bioText}
                    {profile.typewriterEffect && bioText.length < profile.bioText.length && (
                      <span className="animate-pulse ml-0.5" style={{ color: primaryColor }}>|</span>
                    )}
                  </motion.p>
                )}

                {/* Links */}
                {profile.modules?.socials && profile.modules.socials.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={`space-y-3 ${linkStyle === "pills" ? "flex flex-wrap gap-3 justify-center" : ""}`}
                  >
                    {profile.modules.socials.map((social, index) => {
                      const faviconUrl = showFavicons ? getFaviconUrl(social.url) : "";
                      
                      return (
                        <LinkItem
                          key={index}
                          social={social}
                          index={index}
                          faviconUrl={faviconUrl}
                          styles={getLinkStyles()}
                          username={username}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </div>

              {/* Footer badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 text-center"
              >
                <a 
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all hover:opacity-80"
                  style={{ 
                    color: `${textColor}50`,
                    backgroundColor: `rgba(255,255,255,0.05)`,
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  Создано на bio.lonestill.uk
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Audio */}
      {isUnlocked && musicUrl && !isYouTubeMusic && (
        <audio ref={audioRef} autoPlay loop className="hidden">
          <source src={musicUrl} type="audio/mpeg" />
        </audio>
      )}

      {isUnlocked && isYouTubeMusic && musicUrl && (
        <iframe
          src={`https://www.youtube.com/embed/${getYouTubeVideoId(musicUrl)}?autoplay=1&loop=1&playlist=${getYouTubeVideoId(musicUrl)}&controls=0&showinfo=0`}
          className="hidden"
          allow="autoplay"
        />
      )}

      {/* CRT Scanlines */}
      {isUnlocked && scanlinesEnabled && (
        <>
          <div className="absolute inset-0 z-[15] pointer-events-none" style={{
            backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 3px)",
          }} />
          <motion.div
            className="absolute inset-0 z-[16] pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.02), transparent)", height: "4px" }}
            animate={{ y: ["-4px", "100vh"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      {/* Snow */}
      {isUnlocked && snowEnabled && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[14]">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: "-10px",
              }}
              animate={{ y: "calc(100vh + 10px)", opacity: [0.8, 0.4, 0.8] }}
              transition={{
                duration: Math.random() * 3 + 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Background Effect Components
function SnowEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.6 + 0.4,
          }}
          initial={{ y: -10 }}
          animate={{ y: "calc(100vh + 10px)" }}
          transition={{
            duration: Math.random() * 4 + 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function RainEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 bg-white/50"
          style={{
            left: `${Math.random() * 100}%`,
            height: `${Math.random() * 20 + 10}px`,
          }}
          initial={{ y: -30 }}
          animate={{ y: "calc(100vh + 30px)" }}
          transition={{
            duration: Math.random() * 0.3 + 0.2,
            repeat: Infinity,
            delay: Math.random() * 0.5,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function AuroraEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, transparent 0%, #00ff8840 30%, #00d4ff30 50%, #7b00ff20 70%, transparent 100%)",
        }}
        animate={{ opacity: [0.3, 0.6, 0.3], y: [-20, 20, -20] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function PlasmaEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
      <motion.div
        className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2"
        style={{
          background: "radial-gradient(circle at 30% 30%, #ff00ff40 0%, transparent 50%), radial-gradient(circle at 70% 70%, #00ffff40 0%, transparent 50%)",
          filter: "blur(60px)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function NightEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
      {Array.from({ length: 150 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function OldTVEffect() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-[3]" style={{
        background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)",
      }} />
      <motion.div
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{ background: "rgba(0,0,0,0.02)" }}
        animate={{ opacity: [0.02, 0.08, 0.02] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
      <div className="absolute inset-0 pointer-events-none z-[3]" style={{
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)",
      }} />
    </>
  );
}
