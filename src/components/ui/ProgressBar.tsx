import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-fintel-text-secondary">Pregunta {current} de {total}</span>
        <span className="text-sm font-semibold text-fintel-cyan">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-fintel-border-light rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-fintel-blue-medium relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="absolute inset-0 progress-shimmer" />
        </motion.div>
      </div>
    </div>
  );
}
