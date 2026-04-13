"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  FollowUpAnswers,
  FollowUpQuestionAnswer,
  FollowUpStructured,
  HealthConditionId,
  ProductId,
  UnderwritingFormData,
} from "@/types/underwriting";

interface UnderwritingContextValue {
  formData: UnderwritingFormData;
  setAge: (age: number) => void;
  setSmoker: (smoker: boolean) => void;
  setAnnualIncome: (annualIncome: number) => void;
  setCoverageAmount: (coverageAmount: number) => void;
  setProductId: (productId: ProductId) => void;
  toggleCondition: (condition: HealthConditionId) => void;
  setFollowUpAnswers: (
    condition: HealthConditionId,
    answers: FollowUpQuestionAnswer[],
  ) => void;
  clearFollowUpAnswers: (condition: HealthConditionId) => void;
  setFollowUpStructured: (data: FollowUpStructured) => void;
  clearFollowUpStructured: (condition: HealthConditionId) => void;
  resetForm: () => void;
}

const DEFAULT_FORM_DATA: UnderwritingFormData = {
  age: 18,
  smoker: false,
  annualIncome: 185000,
  coverageAmount: 500000,
  productId: "term_life",
  selectedConditions: [],
  followUpAnswers: {},
  followUpStructured: {},
};

const STORAGE_KEY = "underwriting-form-data";

const UnderwritingContext = createContext<UnderwritingContextValue | undefined>(
  undefined,
);

export function UnderwritingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] =
    useState<UnderwritingFormData>(DEFAULT_FORM_DATA);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UnderwritingFormData;

        setFormData({
          ...DEFAULT_FORM_DATA,
          ...parsed,
          followUpAnswers: parsed.followUpAnswers ?? {},
          followUpStructured: parsed.followUpStructured ?? {},
        });
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData, hydrated]);

  const value = useMemo<UnderwritingContextValue>(
    () => ({
      formData,
      setAge: (age) =>
        setFormData((prev) => ({
          ...prev,
          age,
        })),
      setSmoker: (smoker) =>
        setFormData((prev) => ({
          ...prev,
          smoker,
        })),
      setAnnualIncome: (annualIncome) =>
        setFormData((prev) => ({
          ...prev,
          annualIncome,
        })),
      setCoverageAmount: (coverageAmount) =>
        setFormData((prev) => ({
          ...prev,
          coverageAmount,
        })),
      setProductId: (productId) =>
        setFormData((prev) => ({
          ...prev,
          productId,
        })),
      toggleCondition: (condition) =>
        setFormData((prev) => {
          const isSelected = prev.selectedConditions.includes(condition);

          if (isSelected) {
            const updatedFollowUpAnswers: FollowUpAnswers = {
              ...prev.followUpAnswers,
            };

            const updatedFollowUpStructured: FollowUpStructured = {
              ...prev.followUpStructured,
            };

            delete updatedFollowUpAnswers[condition];
            delete updatedFollowUpStructured[condition];

            return {
              ...prev,
              selectedConditions: prev.selectedConditions.filter(
                (c) => c !== condition,
              ),
              followUpAnswers: updatedFollowUpAnswers,
              followUpStructured: updatedFollowUpStructured,
            };
          }

          return {
            ...prev,
            selectedConditions: [...prev.selectedConditions, condition],
          };
        }),
      setFollowUpAnswers: (condition, answers) =>
        setFormData((prev) => ({
          ...prev,
          followUpAnswers: {
            ...prev.followUpAnswers,
            [condition]: answers,
          },
        })),
      clearFollowUpAnswers: (condition) =>
        setFormData((prev) => {
          const updatedFollowUpAnswers: FollowUpAnswers = {
            ...prev.followUpAnswers,
          };

          delete updatedFollowUpAnswers[condition];

          return {
            ...prev,
            followUpAnswers: updatedFollowUpAnswers,
          };
        }),
      setFollowUpStructured: (data) =>
        setFormData((prev) => ({
          ...prev,
          followUpStructured: {
            ...prev.followUpStructured,
            ...data,
          },
        })),
      clearFollowUpStructured: (condition) =>
        setFormData((prev) => {
          const updatedFollowUpStructured: FollowUpStructured = {
            ...prev.followUpStructured,
          };

          delete updatedFollowUpStructured[condition];

          return {
            ...prev,
            followUpStructured: updatedFollowUpStructured,
          };
        }),
      resetForm: () => {
        setFormData(DEFAULT_FORM_DATA);
        sessionStorage.removeItem(STORAGE_KEY);
      },
    }),
    [formData],
  );

  if (!hydrated) return null;

  return (
    <UnderwritingContext.Provider value={value}>
      {children}
    </UnderwritingContext.Provider>
  );
}

export function useUnderwriting() {
  const context = useContext(UnderwritingContext);

  if (!context) {
    throw new Error("useUnderwriting must be used within UnderwritingProvider");
  }

  return context;
}
