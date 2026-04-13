"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import StepIndicator from "@/components/StepIndicator";
import HealthChatModal from "@/components/HealthChatModal";
import { HEALTH_CONDITIONS } from "@/lib/data";
import { useUnderwriting } from "@/context/UnderwritingContext";
import type { HealthConditionId } from "@/types/underwriting";

// Conditions that require the health chat assessment
const FLAGGED_CONDITIONS: HealthConditionId[] = [
  "diabetes",
  "heart_disease",
  "stroke",
  "cancer",
];

function formatIncomeInput(value: number) {
  return value.toLocaleString("en-US");
}

export default function PersonalInformationPage() {
  const { formData, setAge, setSmoker, setAnnualIncome, toggleCondition } =
    useUnderwriting();

  const [income, setIncome] = useState(
    formatIncomeInput(formData.annualIncome),
  );
  const [ageInput, setAgeInput] = useState(String(formData.age));

  const [showChatModal, setShowChatModal] = useState(false);
  const [flaggedSelected, setFlaggedSelected] = useState<HealthConditionId[]>(
    [],
  );

  const age = formData.age;
  const smoker = formData.smoker;
  const selectedConditions = formData.selectedConditions;

  useEffect(() => {
    setIncome(formatIncomeInput(formData.annualIncome));
  }, [formData.annualIncome]);

  useEffect(() => {
    setAgeInput(String(formData.age));
  }, [formData.age]);

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (!/^\d*$/.test(rawValue)) return;

    setAgeInput(rawValue);

    if (rawValue === "") return;

    const value = Number(rawValue);

    if (!Number.isNaN(value) && value >= 18 && value <= 80) {
      setAge(value);
    }
  };

  const handleAgeBlur = () => {
    if (ageInput === "") {
      setAgeInput(String(formData.age));
      return;
    }

    const value = Number(ageInput);

    if (Number.isNaN(value)) {
      setAgeInput(String(formData.age));
      return;
    }

    const clampedValue = Math.min(80, Math.max(18, value));
    setAge(clampedValue);
    setAgeInput(String(clampedValue));
  };

  const handleAgeDecrement = () => {
    const nextAge = Math.max(18, age - 1);
    setAge(nextAge);
    setAgeInput(String(nextAge));
  };

  const handleAgeIncrement = () => {
    const nextAge = Math.min(80, age + 1);
    setAge(nextAge);
    setAgeInput(String(nextAge));
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");

    if (rawValue === "") {
      setIncome("");
      setAnnualIncome(0);
      return;
    }

    const numericValue = Number(rawValue);

    if (!Number.isNaN(numericValue) && numericValue >= 0) {
      setIncome(rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      setAnnualIncome(numericValue);
    }
  };

  const handleIncomeBlur = () => {
    setIncome(formatIncomeInput(formData.annualIncome));
  };

  const handleContinue = (e: React.MouseEvent) => {
    const triggeredConditions = selectedConditions.filter((c) =>
      FLAGGED_CONDITIONS.includes(c),
    );

    if (triggeredConditions.length > 0) {
      e.preventDefault();
      setFlaggedSelected(triggeredConditions);
      setShowChatModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <AppHeader activeNav="applications" />

      {showChatModal && (
        <HealthChatModal
          conditions={flaggedSelected}
          onClose={() => setShowChatModal(false)}
        />
      )}

      <main className="max-w-4xl mx-auto px-6 py-12 mb-24">
        <section className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div className="space-y-2">
              <StepIndicator current={1} total={3} percent={33} />
              <h1 className="font-headline text-5xl text-primary-container leading-tight">
                Personal Information
              </h1>
            </div>
            <div className="text-right">
              <span className="font-headline italic text-2xl text-on-surface-variant">
                33% Complete
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-7 space-y-10">
            <div className="space-y-4">
              <label className="font-label text-sm font-medium text-on-surface-variant uppercase tracking-wider">
                Applicant Age
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleAgeDecrement}
                  className="w-14 h-14 flex items-center justify-center bg-surface-container-lowest ghost-border rounded-lg text-secondary hover:bg-secondary hover:text-white transition-all active:scale-95"
                  aria-label="Decrease age"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>

                <div className="flex-1 h-14 bg-surface-container-lowest ghost-border rounded-lg flex items-center justify-center">
                  <input
                    id="age"
                    type="text"
                    inputMode="numeric"
                    value={ageInput}
                    onChange={handleAgeChange}
                    onBlur={handleAgeBlur}
                    className="w-full text-center font-headline text-3xl text-primary-container outline-none bg-transparent"
                    aria-label="Applicant age"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAgeIncrement}
                  className="w-14 h-14 flex items-center justify-center bg-surface-container-lowest ghost-border rounded-lg text-secondary hover:bg-secondary hover:text-white transition-all active:scale-95"
                  aria-label="Increase age"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="font-label text-sm font-medium text-on-surface-variant uppercase tracking-wider">
                Tobacco &amp; Nicotine Usage
              </label>
              <div className="grid grid-cols-2 gap-px bg-outline-variant/20 rounded-xl p-1.5 bg-surface-container-low">
                <button
                  type="button"
                  onClick={() => setSmoker(false)}
                  className={`py-4 px-6 rounded-lg font-semibold transition-all cursor-pointer ${
                    !smoker
                      ? "bg-white shadow-sm text-secondary"
                      : "text-on-surface-variant font-medium hover:bg-white/50"
                  }`}
                >
                  Non-Smoker
                </button>
                <button
                  type="button"
                  onClick={() => setSmoker(true)}
                  className={`py-4 px-6 rounded-lg font-semibold transition-all cursor-pointer ${
                    smoker
                      ? "bg-white shadow-sm text-secondary"
                      : "text-on-surface-variant font-medium hover:bg-white/50"
                  }`}
                >
                  Smoker
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label
                htmlFor="income"
                className="font-label text-sm font-medium text-on-surface-variant uppercase tracking-wider"
              >
                Annual Gross Income
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <span className="font-headline text-2xl text-on-surface-variant/50">
                    $
                  </span>
                </div>
                <input
                  id="income"
                  type="text"
                  inputMode="numeric"
                  value={income}
                  onChange={handleIncomeChange}
                  onBlur={handleIncomeBlur}
                  className="w-full h-16 pl-12 pr-6 bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-secondary rounded-lg font-headline text-3xl text-primary-container transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="bg-surface-container-lowest p-8 rounded-xl ghost-border border-l-4 border-l-secondary space-y-6">
              <div className="space-y-2">
                <h3 className="font-headline text-2xl text-primary-container">
                  Health Profile
                </h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Please select any existing medical conditions for accurate
                  risk assessment.
                </p>
              </div>

              <div className="space-y-3">
                {HEALTH_CONDITIONS.map((condition) => {
                  const isSelected = selectedConditions.includes(
                    condition.id as HealthConditionId,
                  );

                  return (
                    <label
                      key={condition.id}
                      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer group transition-colors ${
                        isSelected
                          ? "bg-tertiary-fixed/30 border border-secondary/20"
                          : "hover:bg-surface"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSelected}
                        onChange={() =>
                          toggleCondition(condition.id as HealthConditionId)
                        }
                      />
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? "bg-secondary"
                            : "ghost-border bg-white group-hover:border-secondary"
                        }`}
                      >
                        {isSelected && (
                          <span
                            className="material-symbols-outlined text-sm text-white"
                            style={{
                              fontVariationSettings:
                                "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                            }}
                          >
                            check
                          </span>
                        )}
                        {!isSelected && (
                          <span
                            className="material-symbols-outlined text-sm text-secondary opacity-0 group-hover:opacity-100"
                            style={{
                              fontVariationSettings:
                                "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                            }}
                          >
                            check
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-label text-sm transition-colors ${
                          isSelected
                            ? "text-secondary font-semibold"
                            : "text-on-surface group-hover:text-secondary"
                        }`}
                      >
                        {condition.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-outline-variant/10">
                <div className="flex items-start gap-3 text-on-tertiary-fixed-variant">
                  <span className="material-symbols-outlined text-lg mt-0.5">
                    info
                  </span>
                  <p className="text-xs italic leading-relaxed">
                    Declarations are encrypted and handled with the highest
                    standards of private banking security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 py-8 border-t border-outline-variant/10">
          <button
            type="button"
            className="text-secondary font-medium flex items-center gap-2 group hover:gap-3 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Save as Draft
          </button>
          <Link
            href="/underwriting/coverage"
            onClick={handleContinue}
            className="editorial-gradient text-white px-12 py-5 rounded-lg font-label font-semibold tracking-wide flex items-center gap-4 shadow-xl hover:opacity-90 active:scale-95 transition-all"
          >
            Continue to Coverage Details
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
