import type {
  HealthConditionId,
  PremiumQuoteResult,
  ProductId,
  UnderwritingAssessment,
  UnderwritingFormData,
} from "@/types/underwriting";

const BASE_RATE_PER_1000: Record<ProductId, number> = {
  term_life: 0.06,
  final_expense: 1.1,
};

const AGE_MULTIPLIERS: Record<
  ProductId,
  { min: number; max: number; factor: number }[]
> = {
  term_life: [
    { min: 18, max: 29, factor: 0.8 },
    { min: 30, max: 39, factor: 1.0 },
    { min: 40, max: 49, factor: 1.35 },
    { min: 50, max: 59, factor: 1.9 },
    { min: 60, max: 69, factor: 2.8 },
    { min: 70, max: 80, factor: 4.2 },
  ],
  final_expense: [
    { min: 40, max: 49, factor: 0.9 },
    { min: 50, max: 59, factor: 1.1 },
    { min: 60, max: 69, factor: 1.5 },
    { min: 70, max: 79, factor: 2.1 },
    { min: 80, max: 90, factor: 3.0 },
  ],
};

const SIMPLE_CONDITION_MULTIPLIERS: Partial<Record<HealthConditionId, number>> =
  {
    hypertension: 1.15,
    asthma: 1.1,
  };

const FOLLOW_UP_REQUIRED_CONDITIONS: HealthConditionId[] = [
  "diabetes",
  "heart_disease",
  "cancer",
  "stroke",
];

function getAgeMultiplier(productId: ProductId, age: number) {
  const band = AGE_MULTIPLIERS[productId].find(
    (item) => age >= item.min && age <= item.max,
  );

  return band?.factor ?? 1;
}

function getSmokerMultiplier(smoker: boolean) {
  return smoker ? 1.75 : 1;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeText(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function includesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function isStructuredFollowUpComplete(
  formData: UnderwritingFormData,
  condition: HealthConditionId,
) {
  const structured = formData.followUpStructured;

  if (condition === "cancer") {
    return Boolean(
      structured.cancer?.type &&
      structured.cancer?.status &&
      structured.cancer?.yearsAgo !== null &&
      structured.cancer?.occurrences !== undefined &&
      typeof structured.cancer?.isActive === "boolean",
    );
  }

  if (condition === "diabetes") {
    return Boolean(
      structured.diabetes?.type &&
      structured.diabetes?.controlled &&
      structured.diabetes?.yearsAgo !== null,
    );
  }

  if (condition === "heart_disease") {
    return Boolean(
      structured.heart_disease?.diagnosis &&
      structured.heart_disease?.procedures &&
      structured.heart_disease?.medications,
    );
  }

  if (condition === "stroke") {
    return Boolean(
      structured.stroke?.recovery &&
      structured.stroke?.medications &&
      structured.stroke?.yearsAgo !== null,
    );
  }

  return true;
}

function assessCancer(formData: UnderwritingFormData) {
  const cancer = formData.followUpStructured.cancer;

  if (!cancer) {
    return {
      status: "provisional" as const,
      riskTier: "rated" as const,
      healthMultiplier: 1,
      reasons: ["cancer requires underwriting clarification"],
    };
  }

  const status = normalizeText(cancer.status);
  const type = normalizeText(cancer.type);
  const yearsAgo = cancer.yearsAgo;

  if (cancer.isActive) {
    return {
      status: "declined" as const,
      riskTier: "declined" as const,
      healthMultiplier: 1,
      reasons: ["active cancer is ineligible"],
    };
  }

  if (cancer.occurrences !== null && cancer.occurrences > 1) {
    return {
      status: "declined" as const,
      riskTier: "declined" as const,
      healthMultiplier: 1,
      reasons: ["multiple cancer occurrences are declined"],
    };
  }

  if (yearsAgo === null) {
    return {
      status: "manual_review" as const,
      riskTier: "high_risk" as const,
      healthMultiplier: 1.5,
      reasons: ["cancer history is incomplete or unclear"],
    };
  }

  if (yearsAgo < 2) {
    return {
      status: "manual_review" as const,
      riskTier: "high_risk" as const,
      healthMultiplier: 1.45,
      reasons: ["recent cancer history requires manual review"],
    };
  }

  if (
    yearsAgo >= 10 &&
    includesAny(status, ["remission", "recovered", "clear"]) &&
    !includesAny(type, ["metastatic", "stage 4", "stage iv"])
  ) {
    return {
      status: "approved" as const,
      riskTier: "rated" as const,
      healthMultiplier: 1.2,
      reasons: ["remote cancer history in remission"],
    };
  }

  return {
    status: "manual_review" as const,
    riskTier: "rated" as const,
    healthMultiplier: 1.3,
    reasons: ["cancer history requires manual underwriting review"],
  };
}

function assessDiabetes(formData: UnderwritingFormData) {
  const diabetes = formData.followUpStructured.diabetes;

  if (!diabetes) {
    return {
      status: "provisional" as const,
      riskTier: "rated" as const,
      healthMultiplier: 1,
      reasons: ["diabetes requires underwriting clarification"],
    };
  }

  const type = normalizeText(diabetes.type);
  const controlled = normalizeText(diabetes.controlled);
  const yearsAgo = diabetes.yearsAgo;

  if (
    includesAny(controlled, ["uncontrolled", "poor"]) ||
    includesAny(type, ["type 1", "type i"])
  ) {
    return {
      status: "manual_review" as const,
      riskTier: "high_risk" as const,
      healthMultiplier: 1.5,
      reasons: ["higher-risk diabetes profile"],
    };
  }

  if (
    includesAny(controlled, [
      "controlled",
      "medication",
      "managed",
      "metformin",
      "diet",
    ]) &&
    yearsAgo !== null
  ) {
    return {
      status: "approved" as const,
      riskTier: "rated" as const,
      healthMultiplier: 1.25,
      reasons: ["controlled diabetes increased risk"],
    };
  }

  return {
    status: "manual_review" as const,
    riskTier: "rated" as const,
    healthMultiplier: 1.35,
    reasons: ["diabetes history requires manual review"],
  };
}

function assessHeartDisease(formData: UnderwritingFormData) {
  const heartDisease = formData.followUpStructured.heart_disease;

  if (!heartDisease) {
    return {
      status: "provisional" as const,
      riskTier: "rated" as const,
      healthMultiplier: 1,
      reasons: ["heart disease requires underwriting clarification"],
    };
  }

  if (formData.productId === "term_life") {
    return {
      status: "declined" as const,
      riskTier: "declined" as const,
      healthMultiplier: 1,
      reasons: ["heart disease is declined for term life"],
    };
  }

  const diagnosis = normalizeText(heartDisease.diagnosis);
  const procedures = normalizeText(heartDisease.procedures);
  const medications = normalizeText(heartDisease.medications);

  if (
    includesAny(diagnosis, ["heart failure", "cardiomyopathy", "arrhythmia"]) ||
    includesAny(procedures, ["bypass", "stent", "surgery"]) ||
    includesAny(medications, ["blood thinner", "anticoagulant"])
  ) {
    return {
      status: "manual_review" as const,
      riskTier: "high_risk" as const,
      healthMultiplier: 1.6,
      reasons: ["significant cardiac history requires manual review"],
    };
  }

  return {
    status: "manual_review" as const,
    riskTier: "rated" as const,
    healthMultiplier: 1.35,
    reasons: ["heart disease history requires manual review"],
  };
}

function assessStroke(formData: UnderwritingFormData) {
  const stroke = formData.followUpStructured.stroke;

  if (!stroke) {
    return {
      status: "provisional" as const,
      riskTier: "rated" as const,
      healthMultiplier: 1,
      reasons: ["stroke requires underwriting clarification"],
    };
  }

  if (formData.productId === "term_life") {
    return {
      status: "declined" as const,
      riskTier: "declined" as const,
      healthMultiplier: 1,
      reasons: ["stroke history is declined for term life"],
    };
  }

  const recovery = normalizeText(stroke.recovery);
  const medications = normalizeText(stroke.medications);
  const yearsAgo = stroke.yearsAgo;

  if (
    yearsAgo === null ||
    yearsAgo < 2 ||
    includesAny(recovery, ["ongoing", "residual", "limited", "symptoms"]) ||
    includesAny(medications, ["blood thinner", "anticoagulant"])
  ) {
    return {
      status: "manual_review" as const,
      riskTier: "high_risk" as const,
      healthMultiplier: 1.6,
      reasons: ["recent or symptomatic stroke history"],
    };
  }

  return {
    status: "manual_review" as const,
    riskTier: "rated" as const,
    healthMultiplier: 1.4,
    reasons: ["stroke history requires manual review"],
  };
}

function assessStructuredCondition(
  formData: UnderwritingFormData,
  condition: HealthConditionId,
) {
  if (condition === "cancer") {
    return assessCancer(formData);
  }

  if (condition === "diabetes") {
    return assessDiabetes(formData);
  }

  if (condition === "heart_disease") {
    return assessHeartDisease(formData);
  }

  if (condition === "stroke") {
    return assessStroke(formData);
  }

  return null;
}

function assessHealth(formData: UnderwritingFormData): UnderwritingAssessment {
  const { selectedConditions } = formData;

  let healthMultiplier = 1;
  const reasons: string[] = [];
  const missingFollowUpConditions: HealthConditionId[] = [];
  let finalStatus: UnderwritingAssessment["status"] = "approved";
  let finalRiskTier: UnderwritingAssessment["riskTier"] = "preferred";

  for (const condition of selectedConditions) {
    if (FOLLOW_UP_REQUIRED_CONDITIONS.includes(condition)) {
      if (!isStructuredFollowUpComplete(formData, condition)) {
        missingFollowUpConditions.push(condition);
        reasons.push(`${condition} requires underwriting clarification`);
        continue;
      }

      const structuredAssessment = assessStructuredCondition(
        formData,
        condition,
      );

      if (structuredAssessment) {
        reasons.push(...structuredAssessment.reasons);

        if (structuredAssessment.status === "declined") {
          finalStatus = "declined";
          finalRiskTier = "declined";
        } else {
          healthMultiplier *= structuredAssessment.healthMultiplier;

          if (
            structuredAssessment.status === "manual_review" &&
            finalStatus !== "declined"
          ) {
            finalStatus = "manual_review";
          }

          if (structuredAssessment.riskTier === "high_risk") {
            finalRiskTier = "high_risk";
          } else if (
            structuredAssessment.riskTier === "rated" &&
            finalRiskTier !== "high_risk" &&
            finalRiskTier !== "declined"
          ) {
            finalRiskTier = "rated";
          } else if (
            structuredAssessment.riskTier === "standard" &&
            finalRiskTier === "preferred"
          ) {
            finalRiskTier = "standard";
          }
        }
      }

      continue;
    }

    const multiplier = SIMPLE_CONDITION_MULTIPLIERS[condition];

    if (multiplier) {
      healthMultiplier *= multiplier;
      reasons.push(`${condition} increased risk`);

      if (multiplier > 1.1 && finalRiskTier === "preferred") {
        finalRiskTier = "standard";
      }

      if (multiplier > 1.15 && finalRiskTier !== "high_risk") {
        finalRiskTier = "rated";
      }
    }
  }

  if (selectedConditions.length === 0) {
    return {
      status: "approved",
      riskTier: "preferred",
      needsFollowUp: false,
      followUpConditions: [],
      healthMultiplier: 1,
      reasons: [],
    };
  }

  if (missingFollowUpConditions.length > 0) {
    return {
      status: "provisional",
      riskTier: "rated",
      needsFollowUp: true,
      followUpConditions: missingFollowUpConditions,
      healthMultiplier,
      reasons,
    };
  }

  if (finalStatus === "declined") {
    return {
      status: "declined",
      riskTier: "declined",
      needsFollowUp: false,
      followUpConditions: [],
      healthMultiplier: 1,
      reasons,
    };
  }

  if (finalStatus === "manual_review") {
    return {
      status: "manual_review",
      riskTier: finalRiskTier === "preferred" ? "rated" : finalRiskTier,
      needsFollowUp: false,
      followUpConditions: [],
      healthMultiplier,
      reasons,
    };
  }

  if (healthMultiplier <= 1.1 && finalRiskTier === "preferred") {
    return {
      status: "approved",
      riskTier: "standard",
      needsFollowUp: false,
      followUpConditions: [],
      healthMultiplier,
      reasons,
    };
  }

  if (healthMultiplier <= 1.35) {
    return {
      status: "approved",
      riskTier: finalRiskTier === "preferred" ? "standard" : finalRiskTier,
      needsFollowUp: false,
      followUpConditions: [],
      healthMultiplier,
      reasons,
    };
  }

  return {
    status: "manual_review",
    riskTier: "high_risk",
    needsFollowUp: false,
    followUpConditions: [],
    healthMultiplier,
    reasons,
  };
}

export function calculatePremiumQuote(
  formData: UnderwritingFormData,
): PremiumQuoteResult {
  const { age, smoker, coverageAmount, productId } = formData;

  const healthAssessment = assessHealth(formData);

  if (healthAssessment.status === "declined") {
    return {
      monthlyPremium: 0,
      status: "declined",
      riskTier: "declined",
      needsFollowUp: false,
      followUpConditions: [],
      reasons: healthAssessment.reasons,
    };
  }

  const baseRate = BASE_RATE_PER_1000[productId];
  const ageMultiplier = getAgeMultiplier(productId, age);
  const smokerMultiplier = getSmokerMultiplier(smoker);

  const coverageUnits = coverageAmount / 1000;

  const monthlyPremium =
    coverageUnits *
    baseRate *
    ageMultiplier *
    smokerMultiplier *
    healthAssessment.healthMultiplier;

  const finalMonthlyPremium = roundMoney(monthlyPremium);

  return {
    monthlyPremium: finalMonthlyPremium,
    status: healthAssessment.status,
    riskTier: healthAssessment.riskTier,
    needsFollowUp: healthAssessment.needsFollowUp,
    followUpConditions: healthAssessment.followUpConditions,
    reasons: healthAssessment.reasons,
  };
}
