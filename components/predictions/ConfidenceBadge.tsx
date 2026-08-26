interface Props {
  confidence: number;
}

export default function ConfidenceBadge({
  confidence,
}: Props) {
  const isHigh = confidence >= 80;
  const isMedium = confidence >= 60;

  const level = isHigh
    ? 'High'
    : isMedium
      ? 'Medium'
      : 'Low';

  const color = isHigh
    ? 'emerald'
    : isMedium
      ? 'yellow'
      : 'red';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Confidence
        </span>

        <span
          className={`font-bold text-${color}-400`}
        >
          {confidence}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full bg-${color}-500 transition-all`}
          style={{ width: `${confidence}%` }}
        />
      </div>

      <p className="text-[11px] text-muted-foreground">
        {level} confidence prediction
      </p>
    </div>
  );
}