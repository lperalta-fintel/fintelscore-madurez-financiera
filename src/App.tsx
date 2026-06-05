import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FloatingShapes } from './components/ui/FloatingShapes';
import { Hero } from './components/Hero';
import { Quiz } from './components/Quiz';
import { LeadCapture } from './components/LeadCapture';
import { Processing } from './components/Processing';
import { Dashboard } from './components/Dashboard';
import { calculateScore, type ScoringResult } from './utils/scoring';
import { questions } from './data/questions';
import { saveQuizResult } from './lib/supabase';
import { loadFacebookPixel, sendWebhook, generateResultImages, trackFacebookEvent } from './lib/integrations';

type AppScreen = 'hero' | 'quiz' | 'lead' | 'processing' | 'dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('hero');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFacebookPixel();
  }, []);

  const handleStartQuiz = () => {
    trackFacebookEvent('InitiateCheckout', {
      content_name: 'FINTEL Score Quiz',
      content_category: 'Quiz Started',
    });
    setCurrentScreen('quiz');
  };

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [`q${questionId}`]: answerIndex,
    }));
  };

  const handleQuizComplete = () => {
    trackFacebookEvent('CompleteRegistration', {
      content_name: 'FINTEL Score Quiz',
      content_category: 'Quiz Completed',
    });
    setCurrentScreen('lead');
  };

  const handleBackToHero = () => {
    setCurrentScreen('hero');
    setAnswers({});
  };

  const handleLeadSubmit = async (data: {
    name: string;
    position: string;
    company: string;
    email: string;
    whatsapp: string;
  }) => {
    setIsLoading(true);
    setUserName(data.name.split(' ')[0]);

    const scoringResult = calculateScore(answers, questions.length);
    setResult(scoringResult);

    try {
      const saveResult = await saveQuizResult(data, {
        answers,
        raw_score: scoringResult.rawScore,
        calculated_level: scoringResult.calculatedLevel,
        final_level: scoringResult.finalLevel,
        alerts: scoringResult.alerts,
      });

      trackFacebookEvent('Lead', {
        content_name: 'FINTEL Score Quiz',
        content_category: 'Quiz Completion',
        value: scoringResult.rawScore,
      });

      let imageData = null;
      if (saveResult) {
        imageData = await generateResultImages({
          score: scoringResult.displayScore,
          finalLevel: scoringResult.finalLevel,
          calculatedLevel: scoringResult.calculatedLevel,
          alerts: scoringResult.alerts,
          leadId: saveResult.leadId,
          responseId: saveResult.responseId,
        });
      }

      await sendWebhook({
        lead: {
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          position: data.position,
          company: data.company,
        },
        score: {
          raw_score: scoringResult.rawScore,
          calculated_level: scoringResult.calculatedLevel,
          final_level: scoringResult.finalLevel,
          alerts: scoringResult.alerts,
        },
        ...(imageData && {
          images: {
            score_image_url: imageData.score_image_url,
            pyramid_image_url: imageData.pyramid_image_url,
          },
          analysis: imageData.analysis,
        }),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving result:', error);
    }

    setIsLoading(false);
    setCurrentScreen('processing');
  };

  const handleProcessingComplete = useCallback(() => {
    setCurrentScreen('dashboard');
  }, []);

  return (
    <div className="min-h-screen bg-fintel-bg-light font-montserrat relative overflow-hidden">
      <FloatingShapes />

      <AnimatePresence mode="wait">
        {currentScreen === 'hero' && (
          <Hero key="hero" onStart={handleStartQuiz} />
        )}

        {currentScreen === 'quiz' && (
          <Quiz
            key="quiz"
            answers={answers}
            onAnswer={handleAnswer}
            onComplete={handleQuizComplete}
            onBack={handleBackToHero}
          />
        )}

        {currentScreen === 'lead' && (
          <LeadCapture
            key="lead"
            onSubmit={handleLeadSubmit}
            isLoading={isLoading}
          />
        )}

        {currentScreen === 'processing' && (
          <Processing
            key="processing"
            onComplete={handleProcessingComplete}
          />
        )}

        {currentScreen === 'dashboard' && result && (
          <Dashboard
            key="dashboard"
            result={result}
            userName={userName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
