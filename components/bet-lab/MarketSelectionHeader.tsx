'use client';

type Props = {
  selectionHeaders: string[];
};

function headerTone(label: string): string {
  const key = label.toUpperCase().replace(/\s+/g, ' ').trim();
  if (key === 'YES (GG)' || key === 'OVER') return 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-300';
  if (key === 'NO (NG)' || key === 'UNDER') return 'border-rose-500/20 bg-rose-500/[0.08] text-rose-700 dark:text-rose-300';
  if (key === 'X' || key === '12') return 'border-amber-500/20 bg-amber-500/[0.08] text-amber-700 dark:text-amber-300';
  if (key === '2' || key === 'X2') return 'border-sky-500/20 bg-sky-500/[0.08] text-sky-700 dark:text-sky-300';
  return 'border-primary/20 bg-primary/[0.07] text-primary';
}

export default function MarketSelectionHeader({ selectionHeaders }: Props) {
  const columns = Math.max(selectionHeaders.length, 1);

  return (
    <div className="grid grid-cols-1 items-center gap-1 border-b border-border/55 bg-muted/20 px-2 py-1 sm:grid-cols-[minmax(0,0.9fr)_minmax(150px,1.1fr)] sm:gap-2 sm:px-2.5">
      <div className="min-w-0" />
      <div className="grid min-w-0 gap-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {selectionHeaders.map((label) => (
          <span key={label} className={`flex min-h-4 min-w-0 items-center justify-center rounded border px-0.5 text-center text-[8px] font-extrabold sm:min-h-5 ${headerTone(label)}`}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}



