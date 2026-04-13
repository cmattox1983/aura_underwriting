"use client";

import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import RiskBadge from "@/components/RiskBadge";
import { ACTIVE_APPLICATIONS, RISK_DISTRIBUTION } from "@/lib/data";

// Proper SVG donut matching source HTML
function DonutChart() {
  const r = 80;
  const cx = 96;
  const cy = 96;
  const circumference = 2 * Math.PI * r; // ~502.4

  return (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        {/* Track */}
        <circle
          className="text-surface-container-high"
          cx={cx}
          cy={cy}
          r={r}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={12}
        />
        {/* Low Risk: 64% */}
        <circle
          className="text-secondary"
          cx={cx}
          cy={cy}
          r={r}
          fill="transparent"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - 0.64)}
          strokeWidth={12}
        />
        {/* Medium Risk: 28% — offset to start after low */}
        <circle
          className="text-primary-container"
          cx={cx}
          cy={cy}
          r={r}
          fill="transparent"
          stroke="currentColor"
          strokeDasharray={`${circumference * 0.28} ${circumference * 0.72}`}
          strokeDashoffset={circumference * (1 - 0.64)}
          strokeWidth={12}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-headline">702</span>
        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
          Total Units
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <AppHeader activeNav="dashboard" showNotification />

      <main className="max-w-screen-2xl mx-auto px-8 py-10 pb-24">
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-headline text-5xl italic tracking-tight text-primary-container">
              Underwriter Portfolio
            </h1>
            <p className="text-on-primary-container text-lg font-light">
              Precision analytics for risk assessment and policy issuance.
            </p>
          </div>
          <button className="bg-gradient-to-r from-primary-container to-primary text-on-primary px-8 py-4 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 duration-150 shadow-lg">
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
              }}
            >
              analytics
            </span>
            Run Risk Audit
          </button>
        </header>

        {/* KPI Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Pending Reviews */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 group hover:border-secondary transition-all">
            <p className="text-on-surface-variant font-medium text-sm tracking-widest uppercase mb-4">
              Pending Reviews
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-4xl text-primary">14</span>
              <span className="text-secondary text-sm font-semibold">
                +2 today
              </span>
            </div>
            <div className="mt-6 w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
              <div className="bg-secondary h-full w-2/3" />
            </div>
          </div>

          {/* Portfolio Risk Score */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 group hover:border-secondary transition-all">
            <p className="text-on-surface-variant font-medium text-sm tracking-widest uppercase mb-4">
              Portfolio Risk Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-4xl text-primary">0.42</span>
              <span className="text-on-surface-variant text-sm">/ 1.0</span>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-secondary text-sm"
                style={{
                  fontVariationSettings:
                    "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                }}
              >
                check_circle
              </span>
              <span className="text-sm text-on-surface-variant italic">
                Within optimal threshold
              </span>
            </div>
          </div>

          {/* Weekly Conversion */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 group hover:border-secondary transition-all">
            <p className="text-on-surface-variant font-medium text-sm tracking-widest uppercase mb-4">
              Weekly Conversion
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-4xl text-primary">89.4%</span>
              <span className="material-symbols-outlined text-secondary text-base">
                trending_up
              </span>
            </div>
            <div className="mt-6 flex gap-1">
              <div className="h-2 w-full rounded-sm bg-secondary opacity-20" />
              <div className="h-2 w-full rounded-sm bg-secondary opacity-40" />
              <div className="h-2 w-full rounded-sm bg-secondary opacity-60" />
              <div className="h-2 w-full rounded-sm bg-secondary" />
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Applications Table */}
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/5">
              <div className="p-6 flex items-center justify-between border-b border-surface-container-low">
                <h2 className="font-headline text-2xl">Active Applications</h2>
                <button className="text-secondary font-medium text-sm hover:underline">
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-widest">
                      <th className="px-6 py-4">Applicant Name</th>
                      <th className="px-6 py-4">Product Type</th>
                      <th className="px-6 py-4">Risk Level</th>
                      <th className="px-6 py-4">Time in Queue</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {ACTIVE_APPLICATIONS.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-surface-container-low transition-colors group"
                      >
                        <td className="px-6 py-5 font-medium text-on-surface">
                          {app.name}
                        </td>
                        <td className="px-6 py-5 text-on-primary-container text-sm">
                          {app.product}
                        </td>
                        <td className="px-6 py-5">
                          <RiskBadge level={app.risk} />
                        </td>
                        <td className="px-6 py-5 text-on-primary-container text-sm italic">
                          {app.queueTime}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined">
                              chevron_right
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Risk Distribution */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/5 tray-accent">
              <h3 className="font-headline text-xl mb-8">Risk Distribution</h3>
              <DonutChart />
              <div className="mt-8 space-y-4">
                {RISK_DISTRIBUTION.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.dotColor }}
                      />
                      <span>{item.label}</span>
                    </div>
                    <span className="font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Insight */}
            <div className="bg-tertiary-fixed p-8 rounded-xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-headline text-lg mb-2">
                  Portfolio Insight
                </h4>
                <p className="text-sm text-on-tertiary-fixed leading-relaxed opacity-80">
                  Hedge Asset Protection requests have surged by 12% this
                  quarter. Ensure stringent adherence to the 2024 Liquidity
                  Protocol.
                </p>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-5 pointer-events-none">
                auto_awesome
              </span>
            </div>
          </aside>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
