"use client";

import { motion } from "framer-motion";

interface EarlyAdopterFrameProps {
  size: number;
  avatarShape: "circle" | "square";
}

export function EarlyAdopterFrame({ size, avatarShape }: EarlyAdopterFrameProps) {
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
      {/* Golden gradient border */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          border: "3px solid #fbbf24",
          borderRadius: borderRadius,
          background: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706, #f59e0b, #fbbf24)",
          backgroundClip: "border-box",
          WebkitBackgroundClip: "padding-box",
        }}
      />

      {/* Glow effect */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 20px #fbbf24, 0 0 40px rgba(251, 191, 36, 0.3)",
            "0 0 30px #fbbf24, 0 0 60px rgba(251, 191, 36, 0.5)",
            "0 0 20px #fbbf24, 0 0 40px rgba(251, 191, 36, 0.3)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none"
        style={{
          border: "3px solid transparent",
          borderRadius: borderRadius,
        }}
      />

      {/* Star/rocket icon in corner */}
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
          {/* Badge background */}
          <circle cx="50" cy="50" r="45" fill="#1a1000" stroke="#fbbf24" strokeWidth="2" />
          
          {/* Rocket */}
          <g transform="translate(50, 50) rotate(-45)">
            {/* Rocket body */}
            <ellipse cx="0" cy="0" rx="10" ry="25" fill="#fbbf24" />
            <ellipse cx="0" cy="-15" rx="6" ry="10" fill="#f59e0b" />
            
            {/* Rocket tip */}
            <path d="M -6 -25 L 0 -40 L 6 -25 Z" fill="#d97706" />
            
            {/* Fins */}
            <path d="M -10 10 L -20 25 L -10 20 Z" fill="#d97706" />
            <path d="M 10 10 L 20 25 L 10 20 Z" fill="#d97706" />
            
            {/* Window */}
            <circle cx="0" cy="-5" r="5" fill="#1a1000" stroke="#fbbf24" strokeWidth="1" />
            
            {/* Flame */}
            <motion.g
              animate={{ scaleY: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              <ellipse cx="0" cy="30" rx="6" ry="12" fill="#ef4444" />
              <ellipse cx="0" cy="28" rx="4" ry="8" fill="#fbbf24" />
              <ellipse cx="0" cy="26" rx="2" ry="5" fill="#fff" />
            </motion.g>
          </g>
          
          {/* Stars around */}
          <motion.text
            x="15"
            y="25"
            fill="#fbbf24"
            fontSize="12"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ✦
          </motion.text>
          <motion.text
            x="80"
            y="30"
            fill="#fbbf24"
            fontSize="10"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
          >
            ✦
          </motion.text>
          <motion.text
            x="75"
            y="80"
            fill="#fbbf24"
            fontSize="8"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
          >
            ✦
          </motion.text>
        </svg>
      </motion.div>

      {/* Floating stars */}
      <motion.div
        animate={{
          y: [0, -5, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -left-2 top-1/3 text-amber-400 text-sm"
        style={{ textShadow: "0 0 10px #fbbf24" }}
      >
        ⭐
      </motion.div>

      <motion.div
        animate={{
          y: [0, 5, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        className="absolute -right-2 top-1/3 text-amber-400 text-sm"
        style={{ textShadow: "0 0 10px #fbbf24" }}
      >
        ⭐
      </motion.div>

      {/* PIONEER badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: "spring" }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2"
      >
        <div 
          className="px-2 py-0.5 rounded text-[8px] font-mono font-bold"
          style={{ 
            background: "linear-gradient(135deg, #fbbf24, #d97706)",
            color: "#1a1000",
            boxShadow: "0 0 10px #fbbf24"
          }}
        >
          PIONEER
        </div>
      </motion.div>

      {/* Corner decorations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute -top-1 -left-1 text-amber-400 text-xs"
        style={{ textShadow: "0 0 5px #fbbf24" }}
      >
        ✧
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute -bottom-1 -right-1 text-amber-400 text-xs"
        style={{ textShadow: "0 0 5px #fbbf24" }}
      >
        ✧
      </motion.div>

      {/* Sparkle particles */}
      <motion.div
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        className="absolute top-0 left-1/4 w-1 h-1 bg-amber-400 rounded-full"
        style={{ boxShadow: "0 0 5px #fbbf24" }}
      />
      <motion.div
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
        className="absolute bottom-1/4 right-0 w-1 h-1 bg-amber-400 rounded-full"
        style={{ boxShadow: "0 0 5px #fbbf24" }}
      />
    </div>
  );
}
