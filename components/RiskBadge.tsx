type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface RiskBadgeProps {
  level: RiskLevel;
}

const styles: Record<RiskLevel, string> = {
  LOW: "bg-teal-50 text-teal-700 border border-teal-100",
  MEDIUM: "bg-amber-50 text-amber-700 border border-amber-100",
  HIGH: "bg-red-50 text-red-700 border border-red-100",
};

const labels: Record<RiskLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export default function RiskBadge({ level }: RiskBadgeProps) {
  return (
    <span
      className={`px-2 py-1 text-[10px] font-bold uppercase tracking-tighter rounded-md ${styles[level]}`}
    >
      {labels[level]}
    </span>
  );
}
