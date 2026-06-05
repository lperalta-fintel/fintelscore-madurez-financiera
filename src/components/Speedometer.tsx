import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SpeedometerProps {
  score: number;
  maxScore?: number;
}

export function Speedometer({ score, maxScore = 100 }: SpeedometerProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const percentage = animatedScore / maxScore;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * percentage);

  const getScoreColor = () => {
    if (animatedScore <= 20) return '#ef4444';
    if (animatedScore <= 40) return '#f97316';
    if (animatedScore <= 60) return '#A6CC38';
    if (animatedScore <= 80) return '#0077B6';
    return '#42C7F5';
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-64 h-64 mx-auto will-change-transform"
    >
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-[135deg]">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={getScoreColor()}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 6px ${getScoreColor()}33)`,
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-6xl font-extrabold leading-none"
          style={{ color: getScoreColor() }}
        >
          {animatedScore}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-fintel-text-secondary text-sm font-medium mt-1"
        >
          de {maxScore} puntos
        </motion.span>
      </div>

    </motion.div>
  );
}
