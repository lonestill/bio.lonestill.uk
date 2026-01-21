"use client";

import { motion } from "framer-motion";

interface BughunterFrameProps {
  size: number;
  avatarShape: "circle" | "square";
}

export function BughunterFrame({ size, avatarShape }: BughunterFrameProps) {
  const isCircle = avatarShape === "circle";
  const borderRadius = isCircle ? "50%" : "24px";

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Red alert border */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className="absolute inset-0"
        style={{
          border: "3px solid #ef4444",
          borderRadius: borderRadius,
          boxShadow: "0 0 20px #ef4444, 0 0 40px rgba(239, 68, 68, 0.3), inset 0 0 15px rgba(239, 68, 68, 0.2)",
        }}
      />

      {/* Scanning line effect */}
      <motion.div
        animate={{
          top: ["0%", "100%", "0%"],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"
        style={{ borderRadius: borderRadius }}
      />

      {/* Bug icon in corner */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 10 }}
        className="absolute -top-4 -right-4 z-10"
        style={{
          width: size * 0.32,
          height: size * 0.32,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          {/* Target/crosshair background */}
          <circle cx="50" cy="50" r="45" fill="#1a0a0a" stroke="#ef4444" strokeWidth="2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="50" y1="10" x2="50" y2="35" stroke="#ef4444" strokeWidth="2" />
          <line x1="50" y1="65" x2="50" y2="90" stroke="#ef4444" strokeWidth="2" />
          <line x1="10" y1="50" x2="35" y2="50" stroke="#ef4444" strokeWidth="2" />
          <line x1="65" y1="50" x2="90" y2="50" stroke="#ef4444" strokeWidth="2" />
          
          {/* Bug body */}
          <ellipse cx="50" cy="55" rx="15" ry="20" fill="#2a1a1a" stroke="#ef4444" strokeWidth="1.5" />
          <ellipse cx="50" cy="38" rx="10" ry="10" fill="#2a1a1a" stroke="#ef4444" strokeWidth="1.5" />
          
          {/* Bug eyes */}
          <motion.circle
            cx="45"
            cy="36"
            r="3"
            fill="#ef4444"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.circle
            cx="55"
            cy="36"
            r="3"
            fill="#ef4444"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
          />
          
          {/* Bug legs */}
          <line x1="35" y1="45" x2="25" y2="35" stroke="#ef4444" strokeWidth="2" />
          <line x1="35" y1="55" x2="22" y2="55" stroke="#ef4444" strokeWidth="2" />
          <line x1="35" y1="65" x2="25" y2="75" stroke="#ef4444" strokeWidth="2" />
          <line x1="65" y1="45" x2="75" y2="35" stroke="#ef4444" strokeWidth="2" />
          <line x1="65" y1="55" x2="78" y2="55" stroke="#ef4444" strokeWidth="2" />
          <line x1="65" y1="65" x2="75" y2="75" stroke="#ef4444" strokeWidth="2" />
          
          {/* Antennae */}
          <line x1="45" y1="30" x2="38" y2="20" stroke="#ef4444" strokeWidth="2" />
          <line x1="55" y1="30" x2="62" y2="20" stroke="#ef4444" strokeWidth="2" />
        </svg>
      </motion.div>

      {/* Warning signs */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3"
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-red-500 text-lg"
          style={{ textShadow: "0 0 5px #ef4444" }}
        >
          ⚠️
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3"
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          className="text-red-500 text-lg"
          style={{ textShadow: "0 0 5px #ef4444" }}
        >
          🐛
        </motion.div>
      </motion.div>

      {/* FOUND badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: "spring" }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2"
      >
        <div 
          className="px-2 py-0.5 rounded text-[8px] font-mono font-bold text-white"
          style={{ 
            backgroundColor: "#ef4444",
            boxShadow: "0 0 10px #ef4444"
          }}
        >
          BUG FOUND
        </div>
      </motion.div>

      {/* Corner markers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute -top-1 -left-1 text-red-500 font-mono text-xs font-bold"
        style={{ textShadow: "0 0 5px #ef4444" }}
      >
        [
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute -top-1 -right-1 text-red-500 font-mono text-xs font-bold"
        style={{ textShadow: "0 0 5px #ef4444" }}
      >
        ]
      </motion.div>
    </div>
  );
}
