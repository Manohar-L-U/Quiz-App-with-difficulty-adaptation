import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Props = {
  difficulty: 1 | 2 | 3;
  consecutiveScore: number;
};

const thresholdUp = 2;
const thresholdDown = -2;

const difficultyLabels = ['', 'Easy', 'Medium', 'Hard'];
const difficultyColors = ['', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];

export default function DifficultyMeter({ difficulty, consecutiveScore }: Props) {
  const pctToUp = difficulty < 3
    ? Math.max(0, Math.min(100, (consecutiveScore / thresholdUp) * 100))
    : 100;
  const pctToDown = difficulty > 1
    ? Math.max(0, Math.min(100, (Math.abs(Math.min(0, consecutiveScore)) / Math.abs(thresholdDown)) * 100))
    : 0;

  const trend = consecutiveScore > 0 ? 'up' : consecutiveScore < 0 ? 'down' : 'neutral';

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700">Adaptive Difficulty</span>
        <div className="flex items-center gap-1.5">
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-500" />}
          {trend === 'neutral' && <Minus className="w-4 h-4 text-slate-400" />}
          <span className="text-xs text-slate-500">
            {trend === 'up' ? 'On a roll!' : trend === 'down' ? 'Keep going' : 'Calibrating'}
          </span>
        </div>
      </div>

      {/* Level dots */}
      <div className="flex items-center gap-2 mb-3">
        {[1, 2, 3].map((level) => (
          <div key={level} className="flex-1">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                level === difficulty
                  ? difficultyColors[level]
                  : level < difficulty
                  ? 'bg-slate-300'
                  : 'bg-slate-200'
              }`}
            />
            <p className={`text-center text-xs mt-1 ${level === difficulty ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>
              {difficultyLabels[level]}
            </p>
          </div>
        ))}
      </div>

      {/* Progress towards next level */}
      {difficulty < 3 && consecutiveScore > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress to {difficultyLabels[difficulty + 1]}</span>
            <span>{consecutiveScore}/{thresholdUp}</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${pctToUp}%` }}
            />
          </div>
        </div>
      )}

      {difficulty > 1 && consecutiveScore < 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Slipping to {difficultyLabels[difficulty - 1]}</span>
            <span>{Math.abs(consecutiveScore)}/{Math.abs(thresholdDown)}</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${pctToDown}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
