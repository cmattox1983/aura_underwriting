import type { HealthConditionId, ProductId } from "@/types/underwriting";

export const HEALTH_CONDITIONS: {
  id: HealthConditionId;
  label: string;
}[] = [
  { id: "hypertension", label: "Hypertension" },
  { id: "diabetes", label: "Diabetes" },
  { id: "heart_disease", label: "Heart Disease" },
  { id: "asthma", label: "Asthma" },
  { id: "cancer", label: "Cancer" },
  { id: "stroke", label: "Stroke" },
];

export const PRODUCTS: {
  id: ProductId;
  icon: string;
  title: string;
  description: string;
  features: string[];
  minCoverage: number;
  maxCoverage: number;
  midCoverage: number;
  defaultCoverage: number;
  step: number;
}[] = [
  {
    id: "term_life",
    icon: "📋",
    title: "Term Life Insurance",
    description:
      "Pure protection for a specified period. Ideal for legacy planning and debt coverage during high-liability years.",
    features: ["Fixed Premiums", "High Death Benefit"],
    minCoverage: 100000,
    maxCoverage: 5000000,
    midCoverage: 2500000,
    defaultCoverage: 500000,
    step: 50000,
  },
  {
    id: "final_expense",
    icon: "🏛️",
    title: "Final Expense",
    description:
      "Guaranteed protection for life. Best used for burial expenses, and has growing cash value that can be borrowed against.",
    features: ["Permanent Coverage", "Cash Value"],
    minCoverage: 10000,
    maxCoverage: 50000,
    midCoverage: 30000,
    defaultCoverage: 25000,
    step: 1000,
  },
];

export const ACTIVE_APPLICATIONS = [
  {
    id: 1,
    name: "Eleanor Sterling",
    product: "Hedge Asset Protection",
    risk: "LOW" as const,
    queueTime: "2h 14m",
  },
  {
    id: 2,
    name: "Vance Montgomery",
    product: "Whole Life Premium",
    risk: "MEDIUM" as const,
    queueTime: "5h 42m",
  },
  {
    id: 3,
    name: "Julian Rossi",
    product: "Equity Indexed Universal",
    risk: "HIGH" as const,
    queueTime: "1d 04h",
  },
  {
    id: 4,
    name: "Beatrice Thorne",
    product: "Variable Annuity Bond",
    risk: "LOW" as const,
    queueTime: "2d 12h",
  },
];

export const RISK_DISTRIBUTION = [
  { label: "Low Risk", value: 64, dotColor: "#006a61" },
  { label: "Medium Risk", value: 28, dotColor: "#131b2e" },
  { label: "High Risk", value: 8, dotColor: "#e2e7ff" },
];
