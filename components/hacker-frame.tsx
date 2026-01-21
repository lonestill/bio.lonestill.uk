"use client";

import { motion } from "framer-motion";

interface HackerFrameProps {
  size: number;
  avatarShape: "circle" | "square";
}

export function HackerFrame({ size, avatarShape }: HackerFrameProps) {
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
      {/* Cyber border with electric glow */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className="absolute inset-0"
        style={{
          border: "3px solid #00ffff",
          borderRadius: borderRadius,
          boxShadow: "0 0 20px #00ffff, 0 0 40px rgba(0, 255, 255, 0.4), inset 0 0 15px rgba(0, 255, 255, 0.2)",
        }}
      />

      {/* Glitch effect overlay */}
      <motion.div
        animate={{
          clipPath: [
            "inset(0 0 0 0)",
            "inset(10% 0 85% 0)",
            "inset(0 0 0 0)",
            "inset(40% 0 43% 0)",
            "inset(0 0 0 0)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        className="absolute inset-0"
        style={{
          border: "3px solid #ff00ff",
          borderRadius: borderRadius,
          opacity: 0.5,
        }}
      />

      {/* Skull icon in corner */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 10 }}
        className="absolute -top-3 -right-3 z-10"
        style={{
          width: size * 0.28,
          height: size * 0.28,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          {/* Background circle */}
          <circle cx="50" cy="50" r="45" fill="#0a0a0a" stroke="#00ffff" strokeWidth="2" />
          
          {/* Skull */}
          <ellipse cx="50" cy="45" rx="25" ry="28" fill="#1a1a1a" stroke="#00ffff" strokeWidth="1.5" />
          
          {/* Eyes */}
          <motion.ellipse
            cx="40"
            cy="40"
            rx="7"
            ry="9"
            fill="#00ffff"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.ellipse
            cx="60"
            cy="40"
            rx="7"
            ry="9"
            fill="#00ffff"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
          />
          
          {/* Nose */}
          <path d="M 47 50 L 50 55 L 53 50 Z" fill="#00ffff" />
          
          {/* Teeth */}
          <rect x="38" y="60" width="6" height="8" fill="#1a1a1a" stroke="#00ffff" strokeWidth="1" />
          <rect x="47" y="60" width="6" height="8" fill="#1a1a1a" stroke="#00ffff" strokeWidth="1" />
          <rect x="56" y="60" width="6" height="8" fill="#1a1a1a" stroke="#00ffff" strokeWidth="1" />
          
          {/* Crossbones */}
          <line x1="20" y1="80" x2="40" y2="95" stroke="#00ffff" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="80" x2="20" y2="95" stroke="#00ffff" strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="80" x2="80" y2="95" stroke="#00ffff" strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="80" x2="60" y2="95" stroke="#00ffff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* Matrix rain effect on sides */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[8px] font-mono text-cyan-400 leading-tight"
          style={{ textShadow: "0 0 5px #00ffff" }}
        >
          <div>ハ</div>
          <div>ッ</div>
          <div>カ</div>
          <div>ー</div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          className="text-[8px] font-mono text-cyan-400 leading-tight"
          style={{ textShadow: "0 0 5px #00ffff" }}
        >
          <div>侵</div>
          <div>入</div>
          <div>者</div>
        </motion.div>
      </motion.div>

      {/* Electric sparks */}
      <motion.div
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="absolute -bottom-1 -left-1 text-cyan-400 text-lg"
        style={{ textShadow: "0 0 10px #00ffff" }}
      >
        ⚡
      </motion.div>

      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 0.7, repeat: Infinity, delay: 0.2 }}
        className="absolute -bottom-1 -right-1 text-cyan-400 text-lg"
        style={{ textShadow: "0 0 10px #00ffff" }}
      >
        ⚡
      </motion.div>

      {/* ACCESS GRANTED text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        className="absolute -top-1 left-1/2 -translate-x-1/2 text-[6px] font-mono text-cyan-400 whitespace-nowrap"
        style={{ textShadow: "0 0 5px #00ffff" }}
      >
        ACCESS GRANTED
      </motion.div>
    </div>
  );
}
