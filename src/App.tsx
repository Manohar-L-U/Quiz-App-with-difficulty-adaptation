import { Brain, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { useQuiz } from './hooks/useQuiz';
import QuestionCard from './components/QuestionCard';
import ProgressBar from './components/ProgressBar';
import DifficultyMeter from './components/DifficultyMeter';
import ScoreDisplay from './components/ScoreDisplay';
import ResultsScreen from './components/ResultsScreen';

const TOTAL_QUESTIONS = 15;

export default function App() {
  const { state, startQuiz, submitAnswer, nextQuestion, resetQuiz } = useQuiz();
  const { phase, session, currentQuestion, lastAnswer, consecutiveScore } = state;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-start justify-center p-4 pt-10 pb-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">AdaptIQ</h1>
            <p className="text-xs text-slate-500">Adaptive Intelligence Quiz</p>
          </div>
          {session && !session.completed && (
            <div className="ml-auto text-right">
              <p className="text-lg font-bold text-blue-600">{session.score} pts</p>
              <p className="text-xs text-slate-400">score</p>
            </div>
          )}
        </div>

        {/* Idle / Start Screen */}
        {phase === 'idle' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
            <div className="text-center space-y-3">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Test Your Knowledge</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Answer {TOTAL_QUESTIONS} questions across science, history, and geography.
                The difficulty adapts in real time based on your performance.
              </p>
            </div>

            {/* How it works */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">How adaptive difficulty works</p>
              <div className="space-y-2.5">
                {[
                  { color: 'bg-emerald-100 text-emerald-600', label: 'Get 2 correct in a row', desc: 'Difficulty increases' },
                  { color: 'bg-rose-100 text-rose-600', label: 'Get 2 wrong in a row', desc: 'Difficulty decreases' },
                  { color: 'bg-blue-100 text-blue-600', label: 'Harder questions', desc: 'Earn more points' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${item.color}`}>{item.label}</span>
                    <span className="text-xs text-slate-600">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all duration-200 text-base shadow-sm"
            >
              Start Quiz
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Loading */}
        {phase === 'loading' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-500 text-sm">Loading question...</p>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <p className="text-slate-600">{state.error}</p>
            <button
              onClick={resetQuiz}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Active Quiz */}
        {(phase === 'question' || phase === 'result') && currentQuestion && session && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <ProgressBar answered={session.questions_answered} total={TOTAL_QUESTIONS} />
            </div>

            {/* Score strip */}
            <ScoreDisplay session={session} />

            {/* Difficulty meter */}
            <DifficultyMeter
              difficulty={session.current_difficulty as 1 | 2 | 3}
              consecutiveScore={consecutiveScore}
            />

            {/* Question */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                result={lastAnswer}
                onAnswer={submitAnswer}
                questionNumber={session.questions_answered + 1}
              />

              {lastAnswer && (
                <button
                  onClick={nextQuestion}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3.5 rounded-xl transition-all duration-200"
                >
                  {session.questions_answered >= TOTAL_QUESTIONS - 1 ? 'See Results' : 'Next Question'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {phase === 'finished' && session && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <ResultsScreen session={session} onRestart={resetQuiz} />
          </div>
        )}

      </div>
    </div>
  );
}
