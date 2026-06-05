import { motion } from 'framer-motion';
import { Calendar, AlertTriangle, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';
import { Speedometer } from './Speedometer';
import { Pyramid } from './Pyramid';
import { Button } from './ui/Button';
import { levelDescriptions } from '../data/questions';
import type { ScoringResult } from '../utils/scoring';

interface DashboardProps {
  result: ScoringResult;
  userName: string;
}

const CALENDAR_URL = 'https://web.fintel.do/CALENDARIO';

export function Dashboard({ result, userName }: DashboardProps) {
  const levelInfo = levelDescriptions[result.finalLevel as keyof typeof levelDescriptions];
  const hasOverride = result.finalLevel !== result.calculatedLevel;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen px-4 py-8 relative z-10"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.img
            src="/logo_fintel.png"
            alt="FINTEL"
            className="h-20 mx-auto mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
          <h1 className="text-2xl md:text-3xl font-bold text-fintel-text-primary mb-2">
            {userName}, este es tu resultado
          </h1>
          <p className="text-fintel-text-secondary">The FINTEL Score</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-3xl p-6 border border-fintel-border-light shadow-card-smooth"
          >
            <h2 className="text-lg font-semibold text-fintel-text-secondary text-center mb-4">
              Tu Puntaje Global
            </h2>
            <Speedometer score={result.displayScore} />
          </motion.div>

          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-3xl p-6 border border-fintel-border-light shadow-card-smooth"
          >
            <h2 className="text-lg font-semibold text-fintel-text-secondary text-center mb-4">
              The FINTEL Way
            </h2>
            <Pyramid activeLevel={result.finalLevel} />
          </motion.div>
        </div>

        {result.alerts.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mb-6"
          >
            {result.alerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-3"
              >
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 text-sm">{alert}</p>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-white rounded-3xl p-6 mb-6 border border-fintel-border-light shadow-card-smooth"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-fintel-cyan/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-fintel-cyan" />
            </div>
            <div>
              <p className="text-fintel-text-secondary text-sm">Tu nivel actual</p>
              <h3 className="text-xl font-bold text-fintel-text-primary">
                Nivel {result.finalLevel}: {levelInfo.name}
              </h3>
            </div>
          </div>

          <p className="text-fintel-text-secondary mb-6 leading-relaxed">
            {levelInfo.description}
          </p>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-fintel-text-primary mb-2">Próximos pasos recomendados:</p>
            {levelInfo.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.08, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-fintel-green flex-shrink-0" />
                <span className="text-fintel-text-secondary text-sm">{rec}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {hasOverride && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="bg-fintel-bg-light rounded-2xl p-4 mb-6 text-center border border-fintel-border-light"
          >
            <p className="text-fintel-text-secondary text-sm">
              Puntaje base: <span className="text-fintel-text-primary font-semibold">{result.displayScore}</span> puntos
              {' '}|{' '}
              Nivel calculado: <span className="text-fintel-text-primary font-semibold">{result.calculatedLevel}</span>
              {' '}|{' '}
              Nivel ajustado: <span className="text-fintel-cyan font-semibold">{result.finalLevel}</span>
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-center"
        >
          <p className="text-fintel-text-secondary mb-4">
            ¿Quieres llevar tu empresa al siguiente nivel?
          </p>
          <a href={CALENDAR_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="lg" className="group">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Agendar Sesión Estratégica
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 pt-8 border-t border-fintel-border-light"
        >
          <img
            src="/logo_fintel.png"
            alt="FINTEL"
            className="h-8 mx-auto mb-2 opacity-60"
          />
          <p className="text-fintel-text-secondary text-xs">
            Asesoría e Inteligencia Financiera
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
