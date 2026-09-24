import { Trophy, Target, Zap, BarChart2 } from 'lucide-react';
import { QuizSession } from '../lib/supabase';

type Props = {
  session: QuizSession;
};

export default function ScoreDisplay({ session }: Props) {
  const accuracy = session.questions_answered > 0
    ? Math.round((session.correct_answers / session.questions_answered) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
          <Trophy className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-blue-600 font-medium">Score</p>
          <p className="text-xl font-bold text-blue-700">{session.score}</p>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs text-emerald-600 font-medium">Accuracy</p>
          <p className="text-xl font-bold text-emerald-700">{accuracy}%</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-xs text-amber-600 font-medium">Correct</p>
          <p className="text-xl font-bold text-amber-700">{session.correct_answers}/{session.questions_answered}</p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Level</p>
          <p className="text-xl font-bold text-slate-700">
            {['', 'Easy', 'Medium', 'Hard'][session.current_difficulty]}
          </p>
        </div>
      </div>
    </div>
  );
}
