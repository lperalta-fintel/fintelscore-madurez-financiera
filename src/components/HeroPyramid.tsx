import { motion } from 'framer-motion';

const LEVELS = [
  { level: 5, gradient: "url(#hero-grad-5)" },
  { level: 4, gradient: "url(#hero-grad-4)" },
  { level: 3, gradient: "url(#hero-grad-3)" },
  { level: 2, gradient: "url(#hero-grad-2)" },
  { level: 1, gradient: "url(#hero-grad-1)" },
];

export function HeroPyramid() {
  const pyramidBaseWidth = 200;
  const pyramidHeight = 180;
  const totalLevels = LEVELS.length;
  const levelGap = 3;
  const centerX = 120;
  const startY = 15;

  const getLevelGeometry = (index: number) => {
    const levelHeight = (pyramidHeight - (totalLevels - 1) * levelGap) / totalLevels;
    const yTop = startY + index * (levelHeight + levelGap);
    const yBottom = yTop + levelHeight;

    const progressTop = (yTop - startY) / pyramidHeight;
    const progressBottom = (yBottom - startY) / pyramidHeight;

    const widthTop = pyramidBaseWidth * progressTop;
    const widthBottom = pyramidBaseWidth * progressBottom;

    return {
      yTop,
      yBottom,
      levelHeight,
      topLeftX: centerX - widthTop / 2,
      topRightX: centerX + widthTop / 2,
      bottomLeftX: centerX - widthBottom / 2,
      bottomRightX: centerX + widthBottom / 2,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-48 h-48 md:w-56 md:h-56 mx-auto"
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-full h-full"
        style={{
          filter: 'drop-shadow(0 20px 40px rgba(66, 199, 245, 0.3)) drop-shadow(0 10px 20px rgba(166, 204, 56, 0.2))',
        }}
      >
        <svg viewBox="0 0 240 210" className="w-full h-full">
          <defs>
            <linearGradient id="hero-grad-5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5DD3F9" />
              <stop offset="100%" stopColor="#42C7F5" />
            </linearGradient>
            <linearGradient id="hero-grad-4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#42C7F5" />
              <stop offset="100%" stopColor="#0088CC" />
            </linearGradient>
            <linearGradient id="hero-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BDD745" />
              <stop offset="100%" stopColor="#A6CC38" />
            </linearGradient>
            <linearGradient id="hero-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4E879" />
              <stop offset="100%" stopColor="#BDD745" />
            </linearGradient>
            <linearGradient id="hero-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8E8E8" />
              <stop offset="100%" stopColor="#CCCCCC" />
            </linearGradient>

            <linearGradient id="hero-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            <filter id="hero-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[...LEVELS].reverse().map(({ level, gradient }, reverseIndex) => {
            const originalIndex = LEVELS.length - 1 - reverseIndex;
            const geometry = getLevelGeometry(originalIndex);

            let points: string;

            if (originalIndex === 0) {
              points = `
                ${centerX},${geometry.yTop}
                ${geometry.bottomLeftX},${geometry.yBottom}
                ${geometry.bottomRightX},${geometry.yBottom}
              `;
            } else {
              points = `
                ${geometry.topLeftX},${geometry.yTop}
                ${geometry.topRightX},${geometry.yTop}
                ${geometry.bottomRightX},${geometry.yBottom}
                ${geometry.bottomLeftX},${geometry.yBottom}
              `;
            }

            return (
              <motion.g key={level}>
                <motion.polygon
                  points={points}
                  fill={gradient}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                  filter="url(#hero-glow)"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: reverseIndex * 0.12,
                    ease: "easeOut"
                  }}
                  style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                />
                <motion.polygon
                  points={points}
                  fill="url(#hero-gloss)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: reverseIndex * 0.12 + 0.2,
                    ease: "easeOut"
                  }}
                />
              </motion.g>
            );
          })}
        </svg>
      </motion.div>
    </motion.div>
  );
}
