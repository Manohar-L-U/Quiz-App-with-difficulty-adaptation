type Props = {
  answered: number;
  total: number;
};

export default function ProgressBar({ answered, total }: Props) {
  const pct = Math.round((answered / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span>Question {answered + 1} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
