type Props = {
  difficulty: 1 | 2 | 3;
  size?: 'sm' | 'md';
};

const config = {
  1: { label: 'Easy', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  2: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  3: { label: 'Hard', color: 'bg-rose-100 text-rose-700 border-rose-200' },
};

export default function DifficultyBadge({ difficulty, size = 'md' }: Props) {
  const { label, color } = config[difficulty];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${color} ${sizeClass}`}>
      {label}
    </span>
  );
}
