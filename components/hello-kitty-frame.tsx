"use client";

import { motion } from "framer-motion";

interface HelloKittyFrameProps {
  size: number;
  avatarShape: "circle" | "square";
}

export function HelloKittyFrame({ size, avatarShape }: HelloKittyFrameProps) {
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
      {/* Розовая рамка */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className="absolute inset-0"
        style={{
          border: "4px solid #ff69b4",
          borderRadius: borderRadius,
          boxShadow: "0 0 20px #ff69b4, inset 0 0 20px rgba(255, 105, 180, 0.3)",
        }}
      />

      {/* Hello Kitty смотрит из верхнего правого угла */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 10 }}
        className="absolute -top-4 -right-4 z-10"
        style={{
          width: size * 0.35,
          height: size * 0.35,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          {/* Голова котика */}
          <ellipse cx="50" cy="50" rx="35" ry="38" fill="#ffffff" stroke="#000" strokeWidth="2" />
          
          {/* Левое ухо */}
          <ellipse cx="25" cy="25" rx="15" ry="18" fill="#ffffff" stroke="#000" strokeWidth="2" />
          <ellipse cx="25" cy="28" rx="8" ry="10" fill="#ffb6c1" />
          
          {/* Правое ухо */}
          <ellipse cx="75" cy="25" rx="15" ry="18" fill="#ffffff" stroke="#000" strokeWidth="2" />
          <ellipse cx="75" cy="28" rx="8" ry="10" fill="#ffb6c1" />
          
          {/* Левый глаз */}
          <ellipse cx="38" cy="45" rx="4" ry="8" fill="#000" />
          
          {/* Правый глаз */}
          <ellipse cx="62" cy="45" rx="4" ry="8" fill="#000" />
          
          {/* Нос */}
          <ellipse cx="50" cy="55" rx="3" ry="2.5" fill="#000" />
          
          {/* Усы */}
          <line x1="20" y1="50" x2="5" y2="48" stroke="#000" strokeWidth="1.5" />
          <line x1="20" y1="55" x2="5" y2="55" stroke="#000" strokeWidth="1.5" />
          <line x1="20" y1="60" x2="5" y2="62" stroke="#000" strokeWidth="1.5" />
          
          <line x1="80" y1="50" x2="95" y2="48" stroke="#000" strokeWidth="1.5" />
          <line x1="80" y1="55" x2="95" y2="55" stroke="#000" strokeWidth="1.5" />
          <line x1="80" y1="60" x2="95" y2="62" stroke="#000" strokeWidth="1.5" />
          
          {/* Бантик */}
          <g transform="translate(70, 15)">
            {/* Центр банта */}
            <ellipse cx="0" cy="0" rx="4" ry="4" fill="#ff1493" />
            
            {/* Левая часть банта */}
            <ellipse cx="-8" cy="0" rx="6" ry="8" fill="#ff69b4" stroke="#ff1493" strokeWidth="1.5" />
            
            {/* Правая часть банта */}
            <ellipse cx="8" cy="0" rx="6" ry="8" fill="#ff69b4" stroke="#ff1493" strokeWidth="1.5" />
            
            {/* Ленточки */}
            <path d="M -3 4 L -5 12 L -1 10 Z" fill="#ff69b4" stroke="#ff1493" strokeWidth="1" />
            <path d="M 3 4 L 5 12 L 1 10 Z" fill="#ff69b4" stroke="#ff1493" strokeWidth="1" />
          </g>
        </svg>
      </motion.div>

      {/* Лапки по бокам */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3"
        style={{ width: size * 0.18, height: size * 0.25 }}
      >
        <svg viewBox="0 0 40 60" className="w-full h-full drop-shadow">
          {/* Лапка */}
          <ellipse cx="20" cy="30" rx="18" ry="28" fill="#ffffff" stroke="#000" strokeWidth="2" />
          {/* Подушечки */}
          <ellipse cx="20" cy="40" rx="8" ry="10" fill="#ffb6c1" />
          <ellipse cx="12" cy="50" rx="4" ry="5" fill="#ffb6c1" />
          <ellipse cx="28" cy="50" rx="4" ry="5" fill="#ffb6c1" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3"
        style={{ width: size * 0.18, height: size * 0.25 }}
      >
        <svg viewBox="0 0 40 60" className="w-full h-full drop-shadow">
          {/* Лапка */}
          <ellipse cx="20" cy="30" rx="18" ry="28" fill="#ffffff" stroke="#000" strokeWidth="2" />
          {/* Подушечки */}
          <ellipse cx="20" cy="40" rx="8" ry="10" fill="#ffb6c1" />
          <ellipse cx="12" cy="50" rx="4" ry="5" fill="#ffb6c1" />
          <ellipse cx="28" cy="50" rx="4" ry="5" fill="#ffb6c1" />
        </svg>
      </motion.div>

      {/* Декоративные сердечки вокруг */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute -bottom-2 -left-2 text-2xl"
      >
        💗
      </motion.div>

      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, 0]
        }}
        transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
        className="absolute -top-2 -left-2 text-xl"
      >
        🎀
      </motion.div>

      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 1 }}
        className="absolute -bottom-2 -right-2 text-xl"
      >
        ✨
      </motion.div>
    </div>
  );
}
