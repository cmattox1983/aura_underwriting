interface StepIndicatorProps {
  current: number;
  total: number;
  percent: number;
  label?: string;
}

export default function StepIndicator({
  current,
  total,
  percent,
  label,
}: StepIndicatorProps) {
  return (
    <div>
      <p className="font-label text-xs uppercase tracking-widest text-secondary font-semibold">
        Step {String(current).padStart(2, "0")} of {String(total).padStart(2, "0")}
        {label && ` — ${label}`}
      </p>
      <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden mt-4">
        <div
          className="h-full bg-secondary rounded-full transition-all duration-700 ease-in-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
