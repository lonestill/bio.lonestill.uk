"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SakuraPetal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

export function SakuraEffect() {
  const [petals, setPetals] = useState<SakuraPetal[]>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    // Generate initial petals
    const initialPetals: SakuraPetal[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 6 + Math.random() * 4,
      size: 8 + Math.random() * 12,
      opacity: 0.6 + Math.random() * 0.4,
    }));
    setPetals(initialPetals);
    setNextId(8);

    // Add new petals periodically
    const interval = setInterval(() => {
      setNextId((prevId) => {
        const newId = prevId;
        setPetals((prev) => {
          if (prev.length > 15) {
            return prev.slice(1);
          }
          return [
            ...prev,
            {
              id: newId,
              left: Math.random() * 100,
              delay: 0,
              duration: 6 + Math.random() * 4,
              size: 8 + Math.random() * 12,
              opacity: 0.6 + Math.random() * 0.4,
            },
          ];
        });
        return newId + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{
            top: -20,
            left: `${petal.left}%`,
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            top: "100vh",
            left: `${petal.left + (Math.random() - 0.5) * 30}%`,
            opacity: [0, petal.opacity, petal.opacity, 0],
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            ease: "linear",
          }}
          className="absolute"
          style={{
            width: petal.size,
            height: petal.size,
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-lg"
            style={{
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
            }}
          >
            {/* Cherry blossom petal */}
            <g transform="translate(50, 50)">
              {/* Main petals */}
              <ellipse cx="-15" cy="0" rx="8" ry="15" fill="#ffb7d9" transform="rotate(0)" />
              <ellipse cx="-7.5" cy="14" rx="8" ry="15" fill="#ffc0e0" transform="rotate(72)" />
              <ellipse cx="7.5" cy="14" rx="8" ry="15" fill="#ffb7d9" transform="rotate(144)" />
              <ellipse cx="15" cy="0" rx="8" ry="15" fill="#ffc0e0" transform="rotate(216)" />
              <ellipse cx="0" cy="-15" rx="8" ry="15" fill="#ffb7d9" transform="rotate(288)" />

              {/* Center circle */}
              <circle cx="0" cy="0" r="6" fill="#ffd4e8" />
              <circle cx="0" cy="0" r="3" fill="#ff69b4" />
            </g>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
