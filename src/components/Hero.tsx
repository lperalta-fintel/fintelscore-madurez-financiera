import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, BarChart3, Triangle } from 'lucide-react';
import { Button } from './ui/Button';
import { HeroPyramid } from './HeroPyramid';

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col relative z-10"
    >
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full py-4 px-6"
      >
        <div className="max-w-6xl mx-auto flex justify-center md:justify-start">
          <img
            src="/logo_fintel.png"
            alt="FINTEL"
            className="h-14 md:h-16 w-auto"
          />
        </div>
      </motion.header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 pt-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <HeroPyramid />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            <span className="text-fintel-text-primary block">Descubre el nivel de</span>
            <span className="text-fintel-green block">Madurez Financiera</span>
            <span className="text-fintel-cyan block">de tu empresa</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-base md:text-lg text-fintel-text-secondary mb-6 max-w-2xl mx-auto"
          >
            Diagnóstico en 3 minutos. Resultados inmediatos.
            <br className="hidden md:block" />
            Conoce dónde estás y hacia dónde puedes llegar.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={onStart}
              className="group animate-glow-subtle"
            >
              <span className="flex items-center gap-2">
                Iniciar Test
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="10 Preguntas"
              description="Estratégicas y precisas"
              delay={0.8}
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Score 0-100"
              description="Medición objetiva"
              delay={0.9}
            />
            <FeatureCard
              icon={<Triangle className="w-6 h-6" />}
              title="5 Niveles"
              description="Ruta de crecimiento clara"
              delay={1.0}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white p-5 rounded-2xl border border-fintel-border-light shadow-card-smooth hover:shadow-card-hover-smooth transition-shadow duration-300"
    >
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-fintel-cyan/10 flex items-center justify-center text-fintel-cyan">
        {icon}
      </div>
      <h3 className="font-semibold text-fintel-text-primary mb-1">{title}</h3>
      <p className="text-sm text-fintel-text-secondary">{description}</p>
    </motion.div>
  );
}
