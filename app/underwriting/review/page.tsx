"use client";

import { useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { useUnderwriting } from "@/context/UnderwritingContext";
import { calculatePremiumQuote } from "@/lib/underwriting";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

interface ReviewCardProps {
  title: string;
  editHref: string;
  children: React.ReactNode;
}

function ReviewCard({ title, editHref, children }: ReviewCardProps) {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-lg shadow-editorial tray-accent ghost-border">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-headline text-2xl">{title}</h3>
        <Link
          href={editHref}
          className="text-secondary font-medium text-sm hover:underline"
        >
          Edit
        </Link>
      </div>
      {children}
    </div>
  );
}

function formatConditionLabel(condition: string) {
  return condition
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ReviewPage() {
  const [certified, setCertified] = useState(false);
  const { formData } = useUnderwriting();
  const quote = calculatePremiumQuote(formData);

  const productLabel =
    formData.productId === "term_life" ? "Term Life" : "Final Expense";

  const smokingLabel = formData.smoker ? "Smoker" : "Non-smoker";

  const conditionsLabel =
    formData.selectedConditions.length > 0
      ? formData.selectedConditions.map(formatConditionLabel).join(", ")
      : "None reported";

  const followUpEntries = Object.entries(formData.followUpAnswers || {});
  const isDeclined = quote.status === "declined";
  const submitDisabled = !certified || isDeclined;

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <AppHeader activeNav="applications" />

      <main className="max-w-screen-xl mx-auto px-6 py-12 mb-24">
        <div className="mb-16">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="font-label text-sm uppercase tracking-widest text-on-surface-variant font-medium">
                Step 03
              </span>
              <h1 className="font-headline text-5xl mt-2 italic tracking-tight text-on-surface">
                Final Step: Review
              </h1>
            </div>
            <div className="text-right">
              <span className="font-body text-sm font-semibold text-secondary">
                Ready for submission
              </span>
              <p className="font-headline text-2xl text-on-surface">
                100% Complete
              </p>
            </div>
          </div>
          <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section>
              <h2 className="font-headline text-3xl mb-8">
                Application Overview
              </h2>

              <div className="space-y-6">
                <ReviewCard title="Personal Details" editHref="/underwriting">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold mb-1">
                        Age
                      </p>
                      <p className="font-body text-lg font-medium">
                        {formData.age} Years Old
                      </p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold mb-1">
                        Smoking Status
                      </p>
                      <p className="font-body text-lg font-medium">
                        {smokingLabel}
                      </p>
                    </div>
                  </div>
                </ReviewCard>

                <ReviewCard
                  title="Financial & Coverage"
                  editHref="/underwriting/coverage"
                >
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold mb-1">
                        Coverage Amount
                      </p>
                      <p className="font-body text-lg font-medium">
                        {formatCompactCurrency(formData.coverageAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold mb-1">
                        Policy Type
                      </p>
                      <p className="font-body text-lg font-medium">
                        {productLabel}
                      </p>
                    </div>
                  </div>
                </ReviewCard>

                <ReviewCard
                  title="Health Declarations"
                  editHref="/underwriting"
                >
                  <div>
                    <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold mb-1">
                      Pre-existing Conditions
                    </p>
                    <p className="font-body text-lg font-medium mb-4">
                      {conditionsLabel}
                    </p>

                    {followUpEntries.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold">
                          Underwriting Responses
                        </p>

                        {followUpEntries.map(([condition, answers]) => (
                          <div key={condition} className="space-y-2">
                            <p className="font-semibold text-secondary">
                              {formatConditionLabel(condition)}
                            </p>

                            {answers.map((qa, index) => (
                              <div key={index} className="pl-4">
                                <p className="text-sm text-on-surface-variant">
                                  {qa.question}
                                </p>
                                <p className="text-sm font-medium text-on-surface">
                                  {qa.answer}
                                </p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ReviewCard>

                {quote.reasons.length > 0 && (
                  <ReviewCard
                    title="Underwriting Notes"
                    editHref="/underwriting"
                  >
                    <div className="space-y-3">
                      {quote.reasons.map((reason, index) => (
                        <div key={index} className="pl-4">
                          <p className="text-sm font-medium text-on-surface">
                            {reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ReviewCard>
                )}
              </div>
            </section>

            <div className="bg-tertiary-fixed p-8 rounded-lg ghost-border">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="mt-1">
                  <input
                    type="checkbox"
                    checked={certified}
                    onChange={(e) => setCertified(e.target.checked)}
                    className="w-5 h-5 rounded-md border-outline-variant text-secondary focus:ring-secondary focus:ring-offset-tertiary-fixed transition-all cursor-pointer"
                  />
                </div>
                <span className="font-body text-on-tertiary-fixed leading-relaxed">
                  I certify that the information provided is accurate and
                  complete to the best of my knowledge. I understand that any
                  material misstatement may lead to the cancellation of the
                  policy or the denial of claims.
                </span>
              </label>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 bg-primary-container text-on-primary rounded-lg p-10 shadow-editorial overflow-hidden relative">
              <div className="relative z-10">
                <p className="font-label text-xs uppercase tracking-[0.2em] text-on-primary-container mb-2">
                  {isDeclined ? "Eligibility Status" : "Calculated Premium"}
                </p>

                <div className="flex items-baseline gap-1 mb-3">
                  {isDeclined ? (
                    <span className="font-headline text-5xl font-bold">
                      Ineligible
                    </span>
                  ) : (
                    <>
                      <span className="font-headline text-5xl font-bold">
                        {formatCurrency(quote.monthlyPremium)}
                      </span>
                      <span className="font-body text-on-primary-container text-sm">
                        /month
                      </span>
                    </>
                  )}
                </div>

                {quote.needsFollowUp && (
                  <p className="mb-5 text-sm text-amber-300">
                    Provisional quote only. Additional underwriting questions
                    are required.
                  </p>
                )}

                {quote.status === "manual_review" && (
                  <p className="mb-5 text-sm text-red-300">
                    This application requires manual underwriting review.
                  </p>
                )}

                {isDeclined && (
                  <p className="mb-5 text-sm text-red-300">
                    Based on the information provided, this application is not
                    eligible under the current underwriting guidelines.
                  </p>
                )}

                <div className="space-y-6 mb-10">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-secondary-fixed text-lg">
                      verified
                    </span>
                    <p className="font-body text-sm leading-snug">
                      {formData.productId === "term_life"
                        ? "20-year fixed term protection"
                        : "Permanent lifetime protection"}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-secondary-fixed text-lg">
                      electric_bolt
                    </span>
                    <p className="font-body text-sm leading-snug">
                      Risk tier: {quote.riskTier.replace("_", " ")}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-secondary-fixed text-lg">
                      workspace_premium
                    </span>
                    <p className="font-body text-sm leading-snug">
                      Status: {quote.status.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    disabled={submitDisabled}
                    className={`w-full py-4 rounded-md font-body font-bold text-white tracking-wide transition-all active:scale-[0.98] ${
                      !submitDisabled
                        ? "bg-gradient-to-r from-secondary to-on-secondary-container hover:opacity-90"
                        : "bg-white/10 cursor-not-allowed opacity-40"
                    }`}
                  >
                    {isDeclined
                      ? "Submission Unavailable"
                      : "Submit Application"}
                  </button>

                  <Link
                    href="/underwriting/coverage"
                    className="block w-full py-4 text-sm font-medium text-center text-on-primary-container hover:text-white transition-colors"
                  >
                    Back to Coverage Details
                  </Link>
                </div>

                <p className="mt-8 text-[10px] text-on-primary-container leading-relaxed opacity-60 text-center">
                  By clicking submit, you agree to our Terms of Service and
                  Privacy Policy. All quotes are subject to final medical
                  underwriting review.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
