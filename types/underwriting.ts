export type ProductId = "term_life" | "final_expense";

export type HealthConditionId =
  | "hypertension"
  | "diabetes"
  | "heart_disease"
  | "asthma"
  | "cancer"
  | "stroke";

export interface FollowUpQuestionAnswer {
  question: string;
  answer: string;
}

export type FollowUpAnswers = Partial<
  Record<HealthConditionId, FollowUpQuestionAnswer[]>
>;

export interface CancerStructuredData {
  type: string;
  status: string;
  yearsAgo: number | null;
  occurrences: number | null;
  isActive: boolean;
}

export interface DiabetesStructuredData {
  type: string;
  yearsAgo: number | null;
  controlled: string;
}

export interface HeartDiseaseStructuredData {
  diagnosis: string;
  procedures: string;
  medications: string;
}

export interface StrokeStructuredData {
  yearsAgo: number | null;
  recovery: string;
  medications: string;
}

export interface FollowUpStructured {
  cancer?: CancerStructuredData;
  diabetes?: DiabetesStructuredData;
  heart_disease?: HeartDiseaseStructuredData;
  stroke?: StrokeStructuredData;
}

export interface UnderwritingFormData {
  age: number;
  smoker: boolean;
  annualIncome: number;
  coverageAmount: number;
  productId: ProductId;
  selectedConditions: HealthConditionId[];
  followUpAnswers: FollowUpAnswers;
  followUpStructured: FollowUpStructured;
}

export type UnderwritingStatus =
  | "approved"
  | "provisional"
  | "manual_review"
  | "declined";

export type RiskTier =
  | "preferred"
  | "standard"
  | "rated"
  | "high_risk"
  | "declined";

export interface UnderwritingAssessment {
  status: UnderwritingStatus;
  riskTier: RiskTier;
  needsFollowUp: boolean;
  followUpConditions: HealthConditionId[];
  healthMultiplier: number;
  reasons: string[];
}

export interface PremiumQuoteResult {
  monthlyPremium: number;
  status: UnderwritingStatus;
  riskTier: RiskTier;
  needsFollowUp: boolean;
  followUpConditions: HealthConditionId[];
  reasons: string[];
}
