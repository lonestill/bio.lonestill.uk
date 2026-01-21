"use client";

import { motion } from "framer-motion";

interface LocalhostFrameProps {
  size: number;
  avatarShape: "circle" | "square";
}

export function LocalhostFrame({ size, avatarShape }: LocalhostFrameProps) {
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
      {/* Terminal-style border with glow */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className="absolute inset-0"
        style={{
          border: "3px solid #00ff00",
          borderRadius: borderRadius,
          boxShadow: "0 0 20px #00ff00, 0 0 40px rgba(0, 255, 0, 0.3), inset 0 0 15px rgba(0, 255, 0, 0.2)",
        }}
      />

      {/* Scanline effect overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 0.4 }}
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: borderRadius }}
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)",
          }}
        />
      </motion.div>

      {/* Terminal cursor blinking in corner */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 10 }}
        className="absolute -top-3 -right-3 z-10"
        style={{
          width: size * 0.3,
          height: size * 0.3,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          {/* Terminal window background */}
          <rect x="10" y="10" width="80" height="80" rx="8" fill="#0a0a0a" stroke="#00ff00" strokeWidth="2" />
          
          {/* Title bar */}
          <rect x="10" y="10" width="80" height="16" rx="8" fill="#1a1a1a" />
          <rect x="10" y="18" width="80" height="8" fill="#1a1a1a" />
          
          {/* Window buttons */}
          <circle cx="22" cy="18" r="3" fill="#ff5f56" />
          <circle cx="32" cy="18" r="3" fill="#ffbd2e" />
          <circle cx="42" cy="18" r="3" fill="#27ca40" />
          
          {/* Terminal text */}
          <text x="18" y="45" fill="#00ff00" fontSize="10" fontFamily="monospace">$_</text>
          
          {/* Blinking cursor */}
          <motion.rect
            x="32"
            y="36"
            width="6"
            height="12"
            fill="#00ff00"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          
          {/* localhost text */}
          <text x="18" y="62" fill="#00ff00" fontSize="8" fontFamily="monospace">127.0.0.1</text>
          <text x="18" y="78" fill="#666" fontSize="7" fontFamily="monospace">localhost</text>
        </svg>
      </motion.div>

      {/* Binary decorations */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4"
      >
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] font-mono text-green-500 leading-tight"
          style={{ textShadow: "0 0 5px #00ff00" }}
        >
          <div>01</div>
          <div>10</div>
          <div>01</div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4"
      >
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="text-[10px] font-mono text-green-500 leading-tight"
          style={{ textShadow: "0 0 5px #00ff00" }}
        >
          <div>10</div>
          <div>01</div>
          <div>10</div>
        </motion.div>
      </motion.div>

      {/* Corner brackets like code */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute -bottom-2 -left-2 text-green-500 font-mono text-lg font-bold"
        style={{ textShadow: "0 0 10px #00ff00" }}
      >
        {"<"}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute -bottom-2 -right-2 text-green-500 font-mono text-lg font-bold"
        style={{ textShadow: "0 0 10px #00ff00" }}
      >
        {"/>"}
      </motion.div>

      {/* Floating terminal prompt */}
      <motion.div
        animate={{
          y: [0, -3, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute -top-1 -left-2 text-sm font-mono"
        style={{ textShadow: "0 0 8px #00ff00" }}
      >
        <span className="text-green-500">~$</span>
      </motion.div>
    </div>
  );
}
