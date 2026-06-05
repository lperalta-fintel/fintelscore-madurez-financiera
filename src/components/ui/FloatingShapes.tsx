import { motion } from 'framer-motion';

export function FloatingShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-fintel-cyan/15 blur-3xl will-change-transform"
        style={{ top: '10%', left: '10%' }}
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-fintel-green/15 blur-3xl will-change-transform"
        style={{ top: '50%', right: '5%' }}
        animate={{
          y: [0, 40, 0],
          x: [0, -30, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-fintel-blue-medium/12 blur-3xl will-change-transform"
        style={{ bottom: '20%', left: '20%' }}
        animate={{
          y: [0, 20, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-fintel-green-light/20 blur-2xl will-change-transform"
        style={{ top: '30%', right: '30%' }}
        animate={{
          y: [0, -25, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-fintel-cyan/8 blur-3xl will-change-transform"
        style={{ bottom: '10%', right: '20%' }}
        animate={{
          y: [0, 30, 0],
          x: [0, 25, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />
    </div>
  );
}
