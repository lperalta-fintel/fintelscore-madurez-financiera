import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PyramidChart } from './PyramidChart';

interface ProcessingProps {
  onComplete: () => void;
}

const MESSAGES = [
  "Analizando tus respuestas...",
  "Evaluando madurez financiera...",
  "Calculando tu FINTEL Score...",
  "Determinando tu nivel...",
  "Preparando tu diagnóstico...",
];

export function Processing({ onComplete }: ProcessingProps) {
  const [activeLevel, setActiveLevel] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 5000;
    const levelInterval = totalDuration / 5;
    const progressInterval = 50;
    const progressIncrement = 100 / (totalDuration / progressInterval);

    const levelTimer = setInterval(() => {
      setActiveLevel(prev => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, levelInterval);

    const messageTimer = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MESSAGES.length);
    }, 1000);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const next = prev + progressIncrement;
        return next > 100 ? 100 : next;
      });
    }, progressInterval);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, totalDuration);

    return () => {
      clearInterval(levelTimer);
      clearInterval(messageTimer);
      clearInterval(progressTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg mx-auto"
      >
        <motion.img
          src="/logo_fintel.png"
          alt="FINTEL"
          className="h-28 mx-auto mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        />

        <div className="mb-8">
          <PyramidChart
            activeLevel={activeLevel}
            showTooltip={false}
            animateOnMount={false}
            compact
          />
        </div>

        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-fintel-text-secondary text-lg mb-6 h-7"
        >
          {MESSAGES[messageIndex]}
        </motion.p>

        <div className="w-80 mx-auto">
          <div className="h-2 bg-fintel-border-light rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-fintel-cyan to-fintel-green rounded-full relative"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            >
              <div className="absolute inset-0 progress-shimmer" />
            </motion.div>
          </div>
          <p className="text-fintel-text-secondary text-sm mt-2">
            {Math.round(progress)}%
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
