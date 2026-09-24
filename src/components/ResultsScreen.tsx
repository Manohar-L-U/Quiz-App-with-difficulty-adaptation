import { Trophy, RotateCcw, Star } from 'lucide-react';
import { QuizSession } from '../lib/supabase';

type Props = {
  session: QuizSession;
  onRestart: () => void;
};

function getRank(accuracy: number, difficulty: number): { title: string; description: string; color: string } {
  const composite = accuracy * 0.7 + (difficulty / 3) * 100 * 0.3;

  if (composite >= 85) return { title: 'Mastermind', description: 'Exceptional performance across all levels!', color: 'text-amber-600' };
  if (composite >= 70) return { title: 'Scholar', description: 'Outstanding knowledge and adaptability.', color: 'text-blue-600' };
  if (composite >= 55) return { title: 'Thinker', description: 'Solid performance with room to grow.', color: 'text-emerald-600' };
  if (composite >= 40) return { title: 'Learner', description: 'Good effort — keep practicing!', color: 'text-slate-600' };
  return { title: 'Explorer', description: 'Every expert was once a beginner.', color: 'text-slate-500' };
}

export default function ResultsScreen({ session, onRestart }: Props) {
  const accuracy = session.questions_answered > 0
    ? Math.round((session.correct_answers / session.questions_answered) * 100)
    : 0;

  const rank = getRank(accuracy, session.current_difficulty);
  const maxScore = session.questions_answered * 30;
  const scorePct = maxScore > 0 ? Math.round((session.score / maxScore) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <Trophy className="w-10 h-10 text-amber-500" />
        </div>
        <div>
          <h2 className={`text-3xl font-bold ${rank.color}`}>{rank.title}</h2>
          <p className="text-slate-500 mt-1">{rank.description}</p>
        </div>
      </div>

      {/* Score circle */}
      <div className="flex flex-col items-center">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - scorePct / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-800">{session.score}</span>
            <span className="text-xs text-slate-500">points</span>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2">{scorePct}% of maximum score</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <p className="text-2xl font-bold text-slate-800">{accuracy}%</p>
          <p className="text-xs text-slate-500">Accuracy</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-slate-800">{session.correct_answers}/{session.questions_answered}</p>
          <p className="text-xs text-slate-500">Correct</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-slate-800">{['', 'Easy', 'Med', 'Hard'][session.current_difficulty]}</p>
          <p className="text-xs text-slate-500">Final Level</p>
        </div>
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-7 h-7 transition-all duration-300 ${
              star <= Math.ceil(accuracy / 20)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 fill-slate-200'
            }`}
          />
        ))}
      </div>

      <button
        onClick={onRestart}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all duration-200 text-base"
      >
        <RotateCcw className="w-5 h-5" />
        Play Again
      </button>
    </div>
  );
}
