import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { questions } from '../data/questions';
import { ProgressBar } from './ui/ProgressBar';

interface QuizProps {
  answers: Record<string, number>;
  onAnswer: (questionId: number, answerIndex: number) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function Quiz({ answers, onAnswer, onComplete, onBack }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[`q${currentQuestion.id}`];

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);

    setTimeout(() => {
      onAnswer(currentQuestion.id, optionIndex);
      setSelectedOption(null);

      if (currentIndex < questions.length - 1) {
        setDirection(1);
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete();
      }
    }, 250);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    } else {
      onBack();
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col px-4 py-8 relative z-10"
    >
      <div className="max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-xl bg-white border border-fintel-border-light shadow-card hover:shadow-card-hover transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-fintel-text-secondary" />
            </button>
            <div className="flex-1">
              <ProgressBar current={currentIndex + 1} total={questions.length} />
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="will-change-transform"
            >
              <div className="bg-white rounded-3xl p-6 md:p-8 mb-6 border border-fintel-border-light shadow-card-smooth">
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block px-3 py-1 rounded-full bg-fintel-cyan/10 text-fintel-cyan text-sm font-medium mb-4"
                >
                  {currentQuestion.category}
                </motion.span>

                <h2 className="text-xl md:text-2xl font-bold text-fintel-text-primary leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index || currentAnswer === index;

                  return (
                    <motion.button
                      key={index}
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.06, duration: 0.25 }}
                      onClick={() => handleOptionSelect(index)}
                      className={`w-full text-left p-5 md:p-6 rounded-2xl transition-all duration-200 will-change-transform overflow-hidden ${
                        isSelected
                          ? 'bg-fintel-cyan/10 border-2 border-fintel-cyan shadow-card-selected scale-[1.01]'
                          : 'bg-white hover:bg-fintel-bg-light hover:border-fintel-cyan/30 border-2 border-fintel-border-light shadow-card-smooth hover:shadow-card-hover-smooth'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                            isSelected
                              ? 'bg-fintel-cyan text-white'
                              : 'bg-fintel-bg-light text-fintel-text-secondary'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <span className="text-fintel-text-primary text-base md:text-lg leading-relaxed flex-1">
                          {option}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
