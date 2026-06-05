import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { levelDescriptions } from '../data/questions';

interface PyramidChartProps {
  activeLevel: number;
  showTooltip?: boolean;
  animateOnMount?: boolean;
  compact?: boolean;
}

const LEVELS = [
  { level: 5, name: "Excelencia", color: "#42C7F5" },
  { level: 4, name: "Dirección Ágil", color: "#0077B6" },
  { level: 3, name: "Análisis", color: "#A6CC38" },
  { level: 2, name: "Planeación", color: "#BDD745" },
  { level: 1, name: "Control", color: "#999999" },
];

export function PyramidChart({ activeLevel, showTooltip = true, animateOnMount = true, compact = false }: PyramidChartProps) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  const viewW = 560;
  const viewH = 360;
  const pyramidBaseWidth = 300;
  const pyramidHeight = 300;
  const totalLevels = LEVELS.length;
  const levelGap = 5;
  const centerX = compact ? viewW / 2 : 210;
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
    <div className="relative w-full max-w-xl mx-auto">
      <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-auto">
        <defs>
          {LEVELS.map(({ level }) => (
            <filter key={`glow-${level}`} id={`pyramid-glow-${level}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {LEVELS.map(({ level, name, color }, index) => {
          const isActive = level === activeLevel;
          const isHovered = level === hoveredLevel;
          const isBelow = level < activeLevel;
          const geometry = getLevelGeometry(index);

          let points: string;
          if (index === 0) {
            points = `${centerX},${geometry.yTop} ${geometry.bottomLeftX},${geometry.yBottom} ${geometry.bottomRightX},${geometry.yBottom}`;
          } else {
            points = `${geometry.topLeftX},${geometry.yTop} ${geometry.topRightX},${geometry.yTop} ${geometry.bottomRightX},${geometry.yBottom} ${geometry.bottomLeftX},${geometry.yBottom}`;
          }

          const bandMidY = index === 0
            ? geometry.yTop + geometry.levelHeight * 0.62
            : geometry.yTop + geometry.levelHeight / 2;

          // Label follows the right slope of the pyramid diagonally
          const labelGap = 14;
          const labelX = geometry.bottomRightX + labelGap;
          const labelY = bandMidY;

          // Hit area polygon extends to include label region for consistent hover
          const hitAreaPoints = index === 0
            ? `${centerX},${geometry.yTop} ${geometry.bottomLeftX},${geometry.yBottom} ${viewW},${geometry.yBottom} ${viewW},${geometry.yTop}`
            : `${geometry.topLeftX},${geometry.yTop} ${viewW},${geometry.yTop} ${viewW},${geometry.yBottom} ${geometry.bottomLeftX},${geometry.yBottom}`;

          return (
            <motion.g
              key={level}
              onMouseEnter={() => showTooltip && setHoveredLevel(level)}
              onMouseLeave={() => showTooltip && setHoveredLevel(null)}
              style={{ cursor: showTooltip ? 'pointer' : 'default' }}
            >
              {/* Invisible hit area covering pyramid band + label region */}
              {showTooltip && (
                <polygon
                  points={hitAreaPoints}
                  fill="transparent"
                  stroke="none"
                />
              )}

              <motion.polygon
                points={points}
                fill={isActive || isBelow ? color : '#E5E7EB'}
                stroke="none"
                filter={isActive ? `url(#pyramid-glow-${level})` : undefined}
                initial={animateOnMount ? { opacity: 0, scale: 0.9 } : false}
                animate={{
                  opacity: isActive || isBelow ? 1 : 0.35,
                  scale: isHovered ? 1.02 : 1,
                }}
                transition={{
                  duration: 0.4,
                  delay: animateOnMount ? (5 - level) * 0.12 : 0,
                  ease: "easeOut"
                }}
                style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
              />

              <motion.text
                x={labelX}
                y={labelY}
                textAnchor="start"
                dominantBaseline="middle"
                fill={isActive || isBelow ? '#1F2937' : '#9CA3AF'}
                fontSize="15"
                fontWeight="400"
                fontFamily="system-ui, -apple-system, sans-serif"
                initial={animateOnMount ? { opacity: 0 } : false}
                animate={{
                  opacity: isActive || isBelow ? 1 : 0.4,
                }}
                transition={{
                  delay: animateOnMount ? (5 - level) * 0.12 + 0.2 : 0,
                  duration: 0.35
                }}
              >
                N{level} - {name}
              </motion.text>
            </motion.g>
          );
        })}
      </svg>

      {showTooltip && (
        <AnimatePresence>
          {hoveredLevel && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-xl p-4 text-sm border border-fintel-border-light shadow-card-hover-smooth pointer-events-none"
            >
              <p className="font-semibold text-fintel-cyan mb-1">
                Nivel {hoveredLevel}: {levelDescriptions[hoveredLevel as keyof typeof levelDescriptions].name}
              </p>
              <p className="text-fintel-text-secondary text-xs">
                {levelDescriptions[hoveredLevel as keyof typeof levelDescriptions].description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
