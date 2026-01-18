"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, ExternalLink, Pause, Play, Clock } from "lucide-react";

interface SpotifyData {
  currentlyPlaying?: {
    isPlaying: boolean;
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    url: string;
    duration: number;
    progress: number;
  };
  recentlyPlayed?: {
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    url: string;
    playedAt: string;
  };
  topTracks?: Array<{
    name: string;
    artist: string;
    albumArt: string;
    url: string;
  }>;
}

interface SpotifyWidgetProps {
  username: string;
  showCurrentTrack?: boolean;
  showTopTracks?: boolean;
  primaryColor?: string;
}

export function SpotifyWidget({ 
  username, 
  showCurrentTrack = true, 
  showTopTracks = false,
  primaryColor = "#1DB954" 
}: SpotifyWidgetProps) {
  const [data, setData] = useState<SpotifyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpotify = async () => {
      try {
        const response = await fetch(`/api/spotify?username=${username}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("not_connected");
            return;
          }
          throw new Error("Failed to fetch");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError("failed");
      } finally {
        setLoading(false);
      }
    };

    fetchSpotify();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSpotify, 30000);
    return () => clearInterval(interval);
  }, [username]);

  if (loading || error || !data) {
    return null;
  }

  const currentTrack = data.currentlyPlaying || data.recentlyPlayed;
  const isPlaying = data.currentlyPlaying?.isPlaying;

  return (
    <div className="space-y-3">
      {/* Now Playing / Recently Played */}
      {showCurrentTrack && currentTrack && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 overflow-hidden"
        >
          <div className="flex items-center gap-3">
            {/* Album Art */}
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
              {currentTrack.albumArt ? (
                <img 
                  src={currentTrack.albumArt} 
                  alt={currentTrack.album}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                  <Music className="w-6 h-6 text-neutral-500" />
                </div>
              )}
              
              {/* Playing indicator */}
              {isPlaying && (
                <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <div className="flex gap-0.5">
                    <motion.div 
                      className="w-0.5 h-2 bg-white rounded-full"
                      animate={{ height: [8, 4, 8] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                    <motion.div 
                      className="w-0.5 h-2 bg-white rounded-full"
                      animate={{ height: [4, 8, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                    <motion.div 
                      className="w-0.5 h-2 bg-white rounded-full"
                      animate={{ height: [8, 4, 8] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span 
                  className="text-[10px] uppercase tracking-wider font-mono"
                  style={{ color: primaryColor }}
                >
                  {isPlaying ? "Сейчас играет" : "Недавно"}
                </span>
                <Music className="w-3 h-3" style={{ color: primaryColor }} />
              </div>
              <a 
                href={currentTrack.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block font-mono text-sm text-white hover:underline truncate"
              >
                {currentTrack.name}
              </a>
              <p className="font-mono text-xs text-neutral-400 truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Spotify Link */}
            <a
              href={currentTrack.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: primaryColor }}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Progress bar */}
          {isPlaying && data.currentlyPlaying && (
            <div className="mt-2">
              <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: primaryColor,
                    width: `${(data.currentlyPlaying.progress / data.currentlyPlaying.duration) * 100}%`
                  }}
                  initial={false}
                  animate={{ 
                    width: `${(data.currentlyPlaying.progress / data.currentlyPlaying.duration) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Top Tracks */}
      {showTopTracks && data.topTracks && data.topTracks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-3">
            <span 
              className="text-[10px] uppercase tracking-wider font-mono"
              style={{ color: primaryColor }}
            >
              Топ треки
            </span>
            <Music className="w-3 h-3" style={{ color: primaryColor }} />
          </div>
          
          <div className="space-y-2">
            {data.topTracks.slice(0, 5).map((track, index) => (
              <a
                key={index}
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <span className="w-4 text-xs font-mono text-neutral-500">
                  {index + 1}
                </span>
                {track.albumArt ? (
                  <img 
                    src={track.albumArt} 
                    alt={track.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center">
                    <Music className="w-4 h-4 text-neutral-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-white truncate group-hover:text-green-400 transition-colors">
                    {track.name}
                  </p>
                  <p className="font-mono text-[10px] text-neutral-500 truncate">
                    {track.artist}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
