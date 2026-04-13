"use client";

import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { PRODUCTS } from "@/lib/data";
import { useUnderwriting } from "@/context/UnderwritingContext";

function formatCurrency(val: number) {
  return val.toLocaleString("en-US");
}

export default function CoveragePage() {
  const { formData, setCoverageAmount, setProductId } = useUnderwriting();

  const selectedProduct = formData.productId;

  const activeProduct = PRODUCTS.find(
    (product) => product.id === selectedProduct,
  );

  if (!activeProduct) return null;

  const coverage = formData.coverageAmount;

  const sliderPercent =
    ((coverage - activeProduct.minCoverage) /
      (activeProduct.maxCoverage - activeProduct.minCoverage)) *
    100;

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <AppHeader activeNav="applications" />

      <main className="max-w-4xl mx-auto px-6 pt-12 md:pt-20 pb-24">
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-secondary font-label text-sm font-semibold tracking-widest uppercase">
                Intake Journey
              </span>
              <h2 className="font-headline text-4xl md:text-5xl text-on-surface mt-2">
                Step 2: Coverage &amp; Product Selection
              </h2>
            </div>
            <div className="text-right hidden md:block">
              <span className="text-on-surface-variant font-label text-sm">
                Progress
              </span>
              <p className="text-2xl font-headline italic">66% Complete</p>
            </div>
          </div>
          <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-[66%] transition-all duration-1000 ease-in-out" />
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-12 lg:col-span-8 space-y-8">
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-editorial tray-accent ghost-border">
              <label className="block text-on-surface-variant font-label text-sm font-medium mb-6 uppercase tracking-wider">
                Desired Coverage Amount
              </label>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-headline text-5xl text-primary">$</span>
                <input
                  aria-label="Coverage amount"
                  type="text"
                  value={formatCurrency(coverage)}
                  onChange={(e) => {
                    const num = parseInt(e.target.value.replace(/,/g, ""), 10);
                    if (!isNaN(num)) {
                      setCoverageAmount(
                        Math.min(
                          activeProduct.maxCoverage,
                          Math.max(activeProduct.minCoverage, num),
                        ),
                      );
                    }
                  }}
                  className="w-full bg-transparent border-none p-0 font-headline text-5xl text-primary focus:ring-0 focus:outline-none"
                />
              </div>

              <div className="relative py-4">
                <input
                  type="range"
                  min={activeProduct.minCoverage}
                  max={activeProduct.maxCoverage}
                  step={activeProduct.step}
                  value={coverage}
                  onChange={(e) => setCoverageAmount(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg cursor-pointer"
                  style={{
                    background: `linear-gradient(
  to right,
  #006a61 0%,
  #006a61 ${sliderPercent}%,
  #e2e7ff ${sliderPercent}%,
  #e2e7ff 100%
)`,
                    accentColor: "#006a61",
                  }}
                  aria-label="Coverage amount slider"
                />
                <div className="flex justify-between mt-4 text-xs font-medium text-outline tracking-tighter">
                  <span>${activeProduct.minCoverage}</span>
                  <span>${activeProduct.midCoverage}</span>
                  <span>${activeProduct.maxCoverage}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-headline text-2xl text-on-surface">
                Product Suitability
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRODUCTS.map((product) => {
                  const isSelected = selectedProduct === product.id;

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        setProductId(product.id);
                        setCoverageAmount(product.defaultCoverage);
                      }}
                      className={`group relative p-6 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-white shadow-xl border-secondary/10"
                          : "bg-surface-container-lowest border-transparent hover:bg-white hover:shadow-xl hover:border-secondary/10"
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="mb-6 flex justify-between items-start">
                          <div className="bg-tertiary-fixed p-3 rounded-lg text-on-tertiary-fixed">
                            <span className="material-symbols-outlined">
                              {product.id === "term_life"
                                ? "history_edu"
                                : "account_balance"}
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? "border-secondary"
                                : "border-outline-variant group-hover:border-secondary"
                            }`}
                          >
                            <div
                              className={`w-2.5 h-2.5 rounded-full bg-secondary transition-transform ${
                                isSelected
                                  ? "scale-100"
                                  : "scale-0 group-hover:scale-100"
                              }`}
                            />
                          </div>
                        </div>

                        <h4 className="font-headline text-xl mb-2 text-on-surface">
                          {product.title}
                        </h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
                          {product.description}
                        </p>

                        <ul className="mt-auto space-y-2">
                          {product.features.map((f) => (
                            <li
                              key={f}
                              className="flex items-center gap-2 text-xs text-on-secondary-container font-medium"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                check_circle
                              </span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="md:col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-primary-container p-8 rounded-xl text-on-primary">
              <h5 className="font-headline text-2xl mb-4 italic text-secondary-fixed">
                The Aura Standard
              </h5>
              <p className="text-sm leading-relaxed opacity-80 mb-6">
                Our underwriting precision ensures that high-value coverage
                reflects the bespoke nature of your financial portfolio. We
                prioritize liquidity and legacy preservation above all.
              </p>
              <div className="flex items-center gap-4 py-4 border-t border-white/10">
                <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border border-secondary-fixed/30 bg-on-primary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary-fixed">
                    person
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-secondary-fixed">
                    Assigned Lead
                  </p>
                  <p className="font-headline text-lg italic">
                    Alastair Thorne
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-tertiary-fixed p-6 rounded-xl border-l-4 border-on-tertiary-fixed-variant">
              <h6 className="font-label text-xs font-bold uppercase tracking-widest mb-3">
                Expert Insight
              </h6>
              <p className="text-sm text-on-tertiary-fixed italic leading-snug">
                &ldquo;Selecting the right coverage amount is the cornerstone of
                effective wealth transfer. Consider your current net worth plus
                10x your annual earnings for optimal protection.&rdquo;
              </p>
            </div>
          </div>
        </section>

        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-outline-variant/10">
          <Link
            href="/"
            className="text-secondary font-label text-sm font-semibold tracking-wide flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            Back to Personal Info
          </Link>
          <Link
            href="/underwriting/review"
            className="w-full md:w-auto editorial-gradient text-white px-10 py-4 rounded-lg font-label font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-all active:scale-95 shadow-lg text-center"
          >
            Proceed to Review
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
