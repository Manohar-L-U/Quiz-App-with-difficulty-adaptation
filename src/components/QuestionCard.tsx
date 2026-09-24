import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Question, Option } from '../lib/supabase';
import { AnswerResult } from '../hooks/useQuiz';
import DifficultyBadge from './DifficultyBadge';

type Props = {
  question: Question;
  result: AnswerResult | null;
  onAnswer: (optionId: string) => void;
  questionNumber: number;
};

export default function QuestionCard({ question, result, onAnswer, questionNumber }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const handleSelect = (option: Option) => {
    if (result || animating) return;
    setAnimating(true);
    setSelected(option.id);
    setTimeout(() => {
      setAnimating(false);
      onAnswer(option.id);
    }, 300);
  };

  const getOptionStyle = (optionId: string) => {
    const base = 'w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group';

    if (!result && !animating) {
      return `${base} border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer`;
    }

    if (animating && selected === optionId) {
      return `${base} border-blue-400 bg-blue-50 cursor-not-allowed`;
    }

    if (!result) {
      return `${base} border-slate-200 opacity-60 cursor-not-allowed`;
    }

    if (optionId === result.correctOptionId) {
      return `${base} border-emerald-500 bg-emerald-50 cursor-default`;
    }

    if (optionId === selected && !result.isCorrect) {
      return `${base} border-rose-400 bg-rose-50 cursor-default`;
    }

    return `${base} border-slate-200 opacity-50 cursor-default`;
  };

  const getOptionIcon = (optionId: string) => {
    if (!result) return null;
    if (optionId === result.correctOptionId) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    }
    if (optionId === selected && !result.isCorrect) {
      return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">Q{questionNumber}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 capitalize">{question.category}</span>
          <DifficultyBadge difficulty={question.difficulty} size="sm" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-slate-800 leading-snug">{question.text}</h2>

      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            className={getOptionStyle(option.id)}
            onClick={() => handleSelect(option)}
          >
            <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shrink-0 uppercase">
              {option.id}
            </span>
            <span className="flex-1 text-sm font-medium text-slate-700">{option.text}</span>
            {getOptionIcon(option.id)}
          </button>
        ))}
      </div>

      {result && (
        <div
          className={`mt-4 p-4 rounded-xl border-l-4 text-sm animate-in slide-in-from-bottom-2 duration-300 ${
            result.isCorrect
              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
              : 'bg-rose-50 border-rose-400 text-rose-800'
          }`}
        >
          <p className="font-semibold mb-1">{result.isCorrect ? 'Correct!' : 'Not quite.'}</p>
          <p className="opacity-90">{result.explanation}</p>
          {result.difficultyChanged && (
            <p className="mt-2 font-semibold">
              {result.isCorrect
                ? `Great job! Difficulty raised to ${['', 'Easy', 'Medium', 'Hard'][result.newDifficulty]}`
                : `Difficulty adjusted to ${['', 'Easy', 'Medium', 'Hard'][result.newDifficulty]}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
