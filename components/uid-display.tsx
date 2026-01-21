"use client";

import { useState, useEffect } from "react";
import { Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UidDisplayProps {
  uid: number;
  username: string;
  primaryColor: string;
  textColor: string;
}

// List of cool hex UIDs
const COOL_HEX_UIDS = [
  "d34dc0d3",
  "deadbeef",
  "cafebabe",
  "f00dface",
  "b1ad1dea",
  "c0deface",
  "feedface",
  "deadd00d",
  "f1a7dead",
  "beeffeed",
  "ac1dface",
  "51d0ded",
  "fab1eded",
  "faceb00c",
  "f1ddled",
  "b17c8e5",
  "b00b1e5",
  "00000001",
  "12345678",
  "87654321",
  "0badc0de",
  "8badf00d",
  "b1gd1ck"
];

function getRandomHexUid(): string {
  return COOL_HEX_UIDS[Math.floor(Math.random() * COOL_HEX_UIDS.length)];
}

export function UidDisplay({ uid, username, primaryColor, textColor }: UidDisplayProps) {
  const [showHint, setShowHint] = useState(false);
  const [ping, setPing] = useState<number | null>(null);
  const [projectUptime, setProjectUptime] = useState<string>("");
  const [displayUid, setDisplayUid] = useState<string>("");
  const [animatingUid, setAnimatingUid] = useState<string[]>([]);

  // Detect if this is lonestill and format as hex
  const isLonestill = username.toLowerCase() === "gitty";

  // Initialize display UID
  useEffect(() => {
    if (isLonestill) {
      const newUid = `0x${getRandomHexUid()}`;
      setDisplayUid(newUid);
      setAnimatingUid(newUid.split(""));
    } else {
      setDisplayUid(`#${uid}`);
    }
  }, [uid, isLonestill]);

  // Animate UID generation when hint is shown
  useEffect(() => {
    if (showHint && isLonestill) {
      const newUid = `0x${getRandomHexUid()}`;
      setDisplayUid(newUid);
      
      // Animate each character
      const chars = newUid.split("");
      const hexChars = "0123456789abcdef";
      
      // Set initial random state
      setAnimatingUid(chars.map(() => hexChars[Math.floor(Math.random() * hexChars.length)]));
      
      // Animate to final value
      const intervals = chars.map((char, index) => {
        let iteration = 0;
        const interval = setInterval(() => {
          setAnimatingUid(prev => {
            const next = [...prev];
            if (iteration < 5) {
              next[index] = hexChars[Math.floor(Math.random() * hexChars.length)];
            } else {
              next[index] = char;
              clearInterval(interval);
            }
            return next;
          });
          iteration++;
        }, 50);
        
        return interval;
      });
      
      return () => {
        intervals.forEach(interval => clearInterval(interval));
      };
    }
  }, [showHint, isLonestill]);

  // Calculate project uptime
  useEffect(() => {
    const releaseDate = new Date("2026-01-18T19:30:00+03:00"); // 18 января 2026 19:30 МСК
    const now = new Date();
    const diff = now.getTime() - releaseDate.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      setProjectUptime(`${days}d ${hours}h ${minutes}m`);
    } else if (hours > 0) {
      setProjectUptime(`${hours}h ${minutes}m`);
    } else {
      setProjectUptime(`${minutes}m`);
    }
  }, []);

  // Calculate ping when hint is shown
  useEffect(() => {
    if (!showHint) return;

    const calculatePing = async () => {
      const start = performance.now();
      try {
        await fetch("/api/health", { method: "HEAD", cache: "no-store" });
        const end = performance.now();
        setPing(Math.round(end - start));
      } catch (error) {
        setPing(null);
      }
    };

    calculatePing();
  }, [showHint]);

  return (
    <div className="relative inline-block">
      <motion.button
        onHoverStart={() => setShowHint(true)}
        onHoverEnd={() => setShowHint(false)}
        className={`flex items-center gap-1.5 cursor-help transition-all duration-300 group ${
          isLonestill
            ? "px-2 py-1 rounded-md"
            : ""
        }`}
        style={{
          color: `${textColor}70`,
          ...(isLonestill && {
            backgroundColor: `${primaryColor}10`,
            border: `1px solid ${primaryColor}30`,
          }),
        }}
        whileHover={
          isLonestill
            ? {
                backgroundColor: `${primaryColor}20`,
                borderColor: `${primaryColor}50`,
                boxShadow: `0 0 15px ${primaryColor}20`,
              }
            : {}
        }
      >
        <Hash className="w-4 h-4" />
        <span className="font-mono text-xs font-semibold tracking-wider">
          {animatingUid.length > 0 ? animatingUid.join("") : displayUid}
        </span>
      </motion.button>

      {/* Hint Tooltip */}
      <AnimatePresence>
        {showHint && isLonestill && (
          <motion.div
            initial={{ opacity: 1, scale: 0.95, y: -10 }}
            animate={{ opacity: 2, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute top-full left-0 mt-3 z-50 pointer-events-none"
          >
            <div
              className="rounded-lg px-3 py-2 text-xs font-mono whitespace-nowrap shadow-2xl border backdrop-blur-3xl"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}40`,
                color: primaryColor,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>uid:</span>
                <span>{uid}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span>Ping:</span>
                <span className={ping !== null ? "" : "opacity-50"}>
                  {ping !== null ? `${ping}ms` : "..."}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Project Uptime:</span>
                <span>{projectUptime}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
