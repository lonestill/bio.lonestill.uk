"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CountdownProps {
  targetDate: string; // ISO date string
  title?: string;
  layout?: "centered" | "compact";
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
  isExpired: boolean;
}

export function Countdown({ targetDate, title = "Отсчет", layout = "centered" }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMilliseconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const target = new Date(targetDate).getTime();
        const now = new Date().getTime();
        const diff = target - now;

        if (diff <= 0) {
          setTimeLeft({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalMilliseconds: 0,
            isExpired: true,
          });
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          totalMilliseconds: diff,
          isExpired: false,
        });
      } catch {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMilliseconds: 0,
          isExpired: true,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (layout === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center space-y-2"
      >
        <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">{title}</div>
        {timeLeft.isExpired ? (
          <div className="text-2xl font-mono font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Готово! 🎉
          </div>
        ) : (
          <div className="text-lg font-mono font-bold text-white">
            {String(timeLeft.days).padStart(2, "0")}:{String(timeLeft.hours).padStart(2, "0")}:
            {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="my-8 p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-center"
    >
      <h3 className="text-sm font-mono text-neutral-400 uppercase tracking-wider mb-6">{title}</h3>

      {timeLeft.isExpired ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-mono font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse"
        >
          Готово! 🎉
        </motion.div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {[
            { value: timeLeft.days, label: "Дни" },
            { value: timeLeft.hours, label: "Часы" },
            { value: timeLeft.minutes, label: "Минуты" },
            { value: timeLeft.seconds, label: "Секунды" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="space-y-2"
            >
              <motion.div
                key={`${item.value}-${i}`}
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 0.3,
                  repeat: timeLeft.seconds === 0 && i === 3 ? 1 : 0,
                  repeatType: "loop",
                }}
                className="text-3xl font-mono font-bold text-transparent bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text"
              >
                {String(item.value).padStart(2, "0")}
              </motion.div>
              <div className="text-xs font-mono text-neutral-400 uppercase">{item.label}</div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
